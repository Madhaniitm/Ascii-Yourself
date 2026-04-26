import React, { useState, useCallback, useRef } from 'react';
import { AsciiCanvas } from './components/AsciiCanvas';
import { ControlPanel } from './components/ControlPanel';
import { AsciiOptions } from './types';
import { Terminal } from 'lucide-react';
import { getCheesyness } from './services/geminiService';

type ViewMode = 'ascii' | 'camera';

const App: React.FC = () => {
  const [options, setOptions] = useState<AsciiOptions>({
    fontSize: 12,
    brightness: 1.0,
    contrast: 1.0,
    colorMode: 'matrix',
    density: 'complex',
    resolution: 0.2,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('ascii');
  const [cheesyLine, setCheesyLine] = useState("Initializing charm subroutines...");
  const [isLoading, setIsLoading] = useState(false);
  const [lineVisible, setLineVisible] = useState(true);
  const isLoadingRef = useRef(false);

  const showLine = useCallback((line: string) => {
    setLineVisible(false);
    setTimeout(() => {
      setCheesyLine(line);
      setLineVisible(true);
    }, 400);
  }, []);

  const handleCapture = useCallback(async (imageData: string) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const line = await getCheesyness(imageData);
      showLine(line);
    } catch {
      showLine("My circuits overheated — you're too hot to process.");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [showLine]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 text-green-500 pointer-events-auto">
          <Terminal className="w-6 h-6 animate-pulse" />
          <h1 className="text-xl font-bold tracking-widest uppercase">CyberAscii<span className="text-xs ml-1 opacity-70">v1.0</span></h1>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex border border-green-800 font-mono text-xs">
            <button
              onClick={() => setViewMode('ascii')}
              className={`px-3 py-1 transition-colors ${viewMode === 'ascii' ? 'bg-green-500 text-black' : 'text-green-700 hover:text-green-400'}`}
            >
              ASCII
            </button>
            <button
              onClick={() => setViewMode('camera')}
              className={`px-3 py-1 transition-colors ${viewMode === 'camera' ? 'bg-green-500 text-black' : 'text-green-700 hover:text-green-400'}`}
            >
              CAM
            </button>
          </div>
          <span className="text-green-800 text-xs font-mono animate-pulse">REC ●</span>
        </div>
      </header>

      {/* Cheesy Line Banner */}
      <div className={`absolute top-20 left-0 right-0 flex justify-center z-30 pointer-events-none transition-opacity duration-500 ${lineVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="font-mono text-sm text-green-400 border border-green-500/40 bg-black/70 px-6 py-2 shadow-[0_0_15px_rgba(0,255,0,0.15)] max-w-xl text-center">
          {isLoading
            ? <span className="animate-pulse">Scanning vibes...</span>
            : <>&gt; {cheesyLine}</>
          }
        </div>
      </div>

      {/* Main Canvas */}
      <main className="flex-grow relative z-10">
        <AsciiCanvas options={options} onCapture={handleCapture} viewMode={viewMode} />
      </main>

      {viewMode === 'ascii' && <ControlPanel options={options} setOptions={setOptions} />}

      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
};

export default App;
