import React, { useState, useRef, useEffect } from 'react';
import { getCheesyness } from './services/geminiService';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const usedLinesRef = useRef<string[]>([]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
    }).then(s => {
      stream = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
    }).catch(console.error);
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const handleSnapshot = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `thanga_pushpam_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClick = async () => {
    if (isLoadingRef.current) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setMessage(null);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(640, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, 640, 480);
    }
    const frame = canvas.toDataURL('image/jpeg', 0.85);

    try {
      const result = await getCheesyness(frame, usedLinesRef.current);
      usedLinesRef.current = [...usedLinesRef.current.slice(-5), result];
      setMessage(result);
    } catch {
      setMessage("You're so stunning even my circuits blushed! 🌹");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  const floaties = ['💫', '✨', '🌸', '💕', '⭐', '🌟', '💖', '🎀', '🦋', '🌺'];

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', overflow: 'hidden', background: '#000' }}>

      {/* Camera feed */}
      <video
        ref={videoRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        playsInline muted autoPlay
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(180,0,100,0.3) 0%, transparent 22%, transparent 60%, rgba(100,0,180,0.35) 100%)'
      }} />

      {/* Floating emojis */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
        {floaties.map((emoji, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: `${5 + i * 9.5}%`,
            top: `${10 + (i % 4) * 18}%`,
            fontSize: `${0.9 + (i % 3) * 0.35}rem`,
            opacity: 0.45,
            animation: `floatie ${2.5 + i * 0.25}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.35}s`,
          }}>{emoji}</span>
        ))}
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        textAlign: 'center',
        padding: 'max(env(safe-area-inset-top), 14px) 12px 0',
        zIndex: 10,
      }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(1rem, 4.5vw, 2.4rem)',
          fontWeight: 900,
          fontFamily: "'Georgia', 'Times New Roman', serif",
          letterSpacing: '1.5px',
          color: '#ffffff',
          textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 12px #ff1493, 0 0 24px #ff1493',
          WebkitTextFillColor: '#ffffff',
          lineHeight: 1.2,
        }}>
          🎂 Happy Birthday Thanga Pushpam 🎂
        </h1>
        <p style={{
          margin: '4px 0 0',
          color: '#ffffff',
          fontSize: 'clamp(0.65rem, 1.8vw, 0.9rem)',
          fontFamily: 'cursive',
          letterSpacing: '1px',
          textShadow: '0 0 6px #000, 0 0 12px #000',
        }}>
          ✨ The universe's most precious person ✨
        </p>
      </div>

      {/* Message box */}
      {(message || isLoading) && (
        <div style={{
          position: 'absolute',
          top: '16%', left: '4%', right: '4%',
          zIndex: 20,
          background: 'linear-gradient(135deg, rgba(220,20,120,0.52), rgba(120,20,220,0.52))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          padding: 'clamp(14px, 3vw, 22px) clamp(16px, 4vw, 26px)',
          border: '1.5px solid rgba(255,215,0,0.55)',
          boxShadow: '0 0 24px rgba(255,20,147,0.35), 0 0 50px rgba(138,43,226,0.25)',
          animation: 'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
          textAlign: 'center',
          maxHeight: '45vh',
          overflowY: 'auto',
        }}>
          {isLoading ? (
            <p style={{ color: '#ffd700', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', fontStyle: 'italic', margin: 0, animation: 'blink 1s ease infinite' }}>
              💭 Cooking up something dangerously cheesy...
            </p>
          ) : (
            <p style={{
              color: 'white',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
              lineHeight: 1.7,
              fontWeight: 500,
              fontFamily: "'Georgia', serif",
              margin: 0,
            }}>
              💝 {message} 💝
            </p>
          )}
        </div>
      )}

      {/* Buttons */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0, right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        zIndex: 20,
        paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
        paddingTop: '12px',
      }}>
        <button
          onClick={handleClick}
          disabled={isLoading}
          style={{
            padding: 'clamp(14px, 3vw, 18px) clamp(20px, 5vw, 32px)',
            fontSize: 'clamp(0.82rem, 2.5vw, 1.05rem)',
            fontWeight: 900,
            color: '#ffffff',
            background: 'linear-gradient(270deg, #cc0052, #7700cc, #0077cc, #cc0052)',
            backgroundSize: '400% 400%',
            border: '4px solid #ffffff',
            borderRadius: '60px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.4px',
            textShadow: '0 2px 6px rgba(0,0,0,0.8)',
            boxShadow: '0 4px 0 #000, 0 0 0 2px #000',
            animation: isLoading ? 'none' : 'jump 1.1s ease-in-out infinite, rainbow 2.5s linear infinite, glow 1.8s ease-in-out infinite',
            opacity: isLoading ? 0.5 : 1,
            width: 'min(88vw, 420px)',
            lineHeight: 1.4,
          }}
        >
          Click me please... I want to tell you something!!
        </button>
        <button
          onClick={handleSnapshot}
          style={{
            padding: 'clamp(8px, 2vw, 10px) clamp(20px, 5vw, 28px)',
            fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
            fontWeight: 800,
            color: '#ffffff',
            background: 'rgba(0,0,0,0.6)',
            border: '2.5px solid #ffffff',
            borderRadius: '40px',
            cursor: 'pointer',
            letterSpacing: '1px',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            boxShadow: '0 3px 0 #555',
            backdropFilter: 'blur(8px)',
          }}
        >
          📸 Snap it!
        </button>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; overflow: hidden; }
        @keyframes jump {
          0%   { transform: translateY(0)     scale(1)    rotate(-1.5deg); }
          30%  { transform: translateY(-24px) scale(1.08) rotate(1.5deg);  }
          55%  { transform: translateY(-14px) scale(1.04) rotate(-0.8deg); }
          80%  { transform: translateY(-6px)  scale(1.02) rotate(0.5deg);  }
          100% { transform: translateY(0)     scale(1)    rotate(-1.5deg); }
        }
        @keyframes rainbow {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 4px 0 #000, 0 0 0 2px #000, 0 0 22px #cc0052, 0 0 44px #7700cc; }
          50%      { box-shadow: 0 4px 0 #000, 0 0 0 2px #000, 0 0 36px #7700cc, 0 0 70px #0077cc; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.88) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes floatie {
          from { transform: translateY(0)     rotate(-6deg); }
          to   { transform: translateY(-16px) rotate(6deg);  }
        }
        @keyframes blink {
          0%,100% { opacity: 1;   }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default App;
