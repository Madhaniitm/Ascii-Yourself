import React, { useState, useEffect } from 'react';
import { AsciiCanvas } from './components/AsciiCanvas';
import { ControlPanel } from './components/ControlPanel';
import { AsciiOptions } from './types';
import { Terminal } from 'lucide-react';
import { playAnalysisCompleteSound } from './utils/soundEffects';

const CHEESY_LINES = [
  "You are not just a face. You are a rendering target.",
  "Beauty is in the eye of the ASCII beholder.",
  "Even pixels can't contain your vibes.",
  "Neural scan complete. Result: suspiciously radiant.",
  "Your face just crashed my density algorithm.",
  "Warning: charisma levels exceeding safe parameters.",
  "404: Flaw not found.",
  "You had me at 'ThangaPushpam'.",
  "Processing complete. Result: dangerously charming.",
  "ALERT: You are too beautiful for this resolution.",
  "The matrix chose wisely.",
  "ThangaPushpam protocol engaged. Confidence: MAXIMUM.",
];

const App: React.FC = () => {
  const [options, setOptions] = useState<AsciiOptions>({
    fontSize: 12,
    brightness: 1.0,
    contrast: 1.0,
    colorMode: 'matrix',
    density: 'complex',
    resolution: 0.2,
  });

  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const showNextLine = () => {
    setVisible(false);
    setTimeout(() => {
      setLineIndex((i: number) => (i + 1) % CHEESY_LINES.length);
      setVisible(true);
    }, 400);
  };

  useEffect(() => {
    const interval = setInterval(showNextLine, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCapture = () => {
    showNextLine();
    playAnalysisCompleteSound();
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      {/* Header / HUD */}
      <header className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 text-green-500 pointer-events-auto">
          <Terminal className="w-6 h-6 animate-pulse" />
          <h1 className="text-xl font-bold tracking-widest uppercase">CyberAscii<span className="text-xs ml-1 opacity-70">v1.0</span></h1>
        </div>
        <div className="text-green-800 text-xs flex gap-4 font-mono">
          <span>SYS.STATUS: ONLINE</span>
          <span>CAM.FEED: ACTIVE</span>
          <span className="animate-pulse">REC ●</span>
        </div>
      </header>

      {/* Cheesy Line Banner */}
      <div
        className={`absolute top-20 left-0 right-0 flex justify-center z-30 pointer-events-none transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="font-mono text-sm text-green-400 border border-green-500/40 bg-black/70 px-6 py-2 shadow-[0_0_15px_rgba(0,255,0,0.15)] max-w-lg text-center">
          &gt; {CHEESY_LINES[lineIndex]}
        </div>
      </div>

      {/* Main Canvas Area */}
      <main className="flex-grow relative z-10">
        <AsciiCanvas options={options} onCapture={handleCapture} />
      </main>

      {/* Controls */}
      <ControlPanel options={options} setOptions={setOptions} />

      {/* Decorative overlaid scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
};

export default App;
