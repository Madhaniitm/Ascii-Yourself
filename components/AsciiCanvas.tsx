import React, { useRef, useEffect, useCallback } from 'react';
import { AsciiOptions } from '../types';
import { getAsciiChar } from '../utils/asciiConverter';
import { playStartupSound, playScanSound, startAmbientHum, stopAmbientHum } from '../utils/soundEffects';
import { ScanEye, Camera } from 'lucide-react';

interface AsciiCanvasProps {
  options: AsciiOptions;
  onCapture: (imageData: string) => void;
  viewMode: 'ascii' | 'camera';
}

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({ options, onCapture, viewMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Float32Array | null>(null);
  const animationRef = useRef<number>();
  const errorRef = useRef<string | null>(null);

  // Start camera once
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(e => console.error("Play error:", e));
          playStartupSound();
          startAmbientHum();
        }
      } catch (err) {
        console.error("Camera error:", err);
        errorRef.current = "Unable to access camera. Please allow permissions.";
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      stopAmbientHum();
    };
  }, []);

  // Canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        canvasRef.current.width = parent ? parent.clientWidth : window.innerWidth;
        canvasRef.current.height = parent ? parent.clientHeight : window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { prevFrameRef.current = null; }, [options.fontSize]);

  // ASCII render loop — only runs in ascii mode
  useEffect(() => {
    if (viewMode === 'camera') {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;
      if (!video || !canvas || !hiddenCanvas || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }
      const ctx = canvas.getContext('2d', { alpha: false });
      const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || !hiddenCtx) { animationRef.current = requestAnimationFrame(renderLoop); return; }

      const charHeight = options.fontSize;
      const charWidth = charHeight * 0.6;
      const cols = Math.floor(canvas.width / charWidth);
      const rows = Math.floor(canvas.height / charHeight);
      if (cols <= 0 || rows <= 0) { animationRef.current = requestAnimationFrame(renderLoop); return; }

      if (hiddenCanvas.width !== cols || hiddenCanvas.height !== rows) {
        hiddenCanvas.width = cols;
        hiddenCanvas.height = rows;
        prevFrameRef.current = null;
      }

      hiddenCtx.save();
      hiddenCtx.translate(cols, 0);
      hiddenCtx.scale(-1, 1);
      hiddenCtx.drawImage(video, 0, 0, cols, rows);
      hiddenCtx.restore();

      const frameData = hiddenCtx.getImageData(0, 0, cols, rows);
      const data = frameData.data;
      const pixelCount = data.length;

      if (!prevFrameRef.current || prevFrameRef.current.length !== pixelCount) {
        prevFrameRef.current = new Float32Array(pixelCount);
        for (let i = 0; i < pixelCount; i++) prevFrameRef.current[i] = data[i];
      }
      const prev = prevFrameRef.current;
      const inertia = 0.75;
      for (let i = 0; i < pixelCount; i++) {
        const newValue = prev[i] + (data[i] - prev[i]) * (1 - inertia);
        prev[i] = newValue;
        data[i] = newValue;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${options.fontSize}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      const contrastFactor = (259 * (options.contrast * 255 + 255)) / (255 * (259 - options.contrast * 255));

      if (options.colorMode === 'color') {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            const r = data[offset], g = data[offset + 1], b = data[offset + 2];
            let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            brightness = Math.max(0, Math.min(255, contrastFactor * (brightness - 128) + 128)) * options.brightness;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillText(getAsciiChar(brightness, options.density), x * charWidth, y * charHeight);
          }
        }
      } else {
        if (options.colorMode === 'matrix') ctx.fillStyle = '#00ff41';
        else if (options.colorMode === 'retro') ctx.fillStyle = '#ffb000';
        else ctx.fillStyle = '#ffffff';

        for (let y = 0; y < rows; y++) {
          let rowText = "";
          for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            const r = data[offset], g = data[offset + 1], b = data[offset + 2];
            let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            brightness = Math.max(0, Math.min(255, contrastFactor * (brightness - 128) + 128)) * options.brightness;
            rowText += getAsciiChar(brightness, options.density);
          }
          ctx.fillText(rowText, 0, y * charHeight);
        }
      }

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    animationRef.current = requestAnimationFrame(renderLoop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [options, viewMode]);

  // Capture a frame from the raw video for AI
  const captureVideoFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const tmp = document.createElement('canvas');
    tmp.width = 640; tmp.height = 480;
    const ctx = tmp.getContext('2d');
    if (!ctx) return null;
    ctx.translate(640, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 480);
    return tmp.toDataURL('image/jpeg', 0.85);
  }, []);

  // Auto-snap every 15 seconds → AI cheesy line
  useEffect(() => {
    const interval = setInterval(() => {
      const frame = captureVideoFrame();
      if (frame) onCapture(frame);
    }, 15000);
    return () => clearInterval(interval);
  }, [captureVideoFrame, onCapture]);

  const handleScanClick = () => {
    playScanSound();
    const frame = captureVideoFrame();
    if (frame) onCapture(frame);
  };

  const handleScreenshotClick = () => {
    playScanSound();
    let dataUrl: string | null = null;
    if (viewMode === 'camera') {
      dataUrl = captureVideoFrame();
    } else if (canvasRef.current) {
      dataUrl = canvasRef.current.toDataURL('image/png');
    }
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `cyber_ascii_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full h-full bg-black">
      {errorRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-red-500 z-50">
          <p>{errorRef.current}</p>
        </div>
      )}

      {/* Video — full screen in camera mode, hidden in ascii mode */}
      <video
        ref={videoRef}
        className={viewMode === 'camera'
          ? "absolute inset-0 w-full h-full object-cover"
          : "absolute top-0 left-0 opacity-0 pointer-events-none -z-10 w-1 h-1"}
        style={viewMode === 'camera' ? { transform: 'scaleX(-1)' } : {}}
        playsInline autoPlay muted
      />

      <canvas ref={hiddenCanvasRef} className="hidden" />
      <canvas ref={canvasRef} className={`block w-full h-full ${viewMode === 'camera' ? 'hidden' : ''}`} />

      {/* Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-8 z-40">
        <button
          onClick={handleScreenshotClick}
          className="bg-black/60 hover:bg-green-900/80 text-green-400 border border-green-500/50 p-4 rounded-full backdrop-blur-md transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]"
          title="Save Snapshot"
        >
          <Camera className="w-6 h-6" />
        </button>
        <button
          onClick={handleScanClick}
          className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 p-6 rounded-full backdrop-blur-md transition-all active:scale-95 group relative hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
          title="Get Cheesy Line Now"
        >
          <div className="absolute inset-0 rounded-full border border-green-500 opacity-50 animate-ping"></div>
          <ScanEye className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
