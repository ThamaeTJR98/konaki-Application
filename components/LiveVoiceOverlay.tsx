
import React, { useEffect, useRef, useState } from 'react';
import { LiveClient } from '../services/liveClient';
import Logo from './Logo';

interface LiveVoiceOverlayProps {
  onClose: () => void;
}

const LiveVoiceOverlay: React.FC<LiveVoiceOverlayProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [volume, setVolume] = useState(0);
  const clientRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    const startCall = async () => {
      try {
        clientRef.current = new LiveClient();
        
        clientRef.current.onVolumeUpdate = (vol) => {
            // Smooth volume for visualization
            setVolume(prev => prev * 0.8 + vol * 0.2);
        };

        await clientRef.current.connect(() => {
            console.log("Disconnected remotely");
            onClose();
        });
        
        setStatus('connected');
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };

    startCall();

    return () => {
      clientRef.current?.disconnect();
    };
  }, [onClose]);

  const handleHangup = () => {
      clientRef.current?.disconnect();
      onClose();
  };

  // Visualization dynamic scale
  const scale = 1 + Math.min(volume * 5, 0.5);

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900/95 backdrop-blur-md flex flex-col items-center justify-between py-12 animate-fade-in text-white">
        
        {/* Header */}
        <div className="text-center space-y-2">
             <h2 className="text-sm font-bold uppercase tracking-widest text-green-400">Konaki Live</h2>
             <p className="text-stone-400 text-xs">Voice Mode • {status === 'connected' ? 'Listening...' : 'Connecting...'}</p>
        </div>

        {/* Visualizer */}
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pulsing Circles */}
            <div 
                className="absolute inset-0 bg-green-500/20 rounded-full blur-xl transition-transform duration-75"
                style={{ transform: `scale(${scale * 1.5})` }}
            />
            <div 
                className="absolute inset-4 bg-green-500/20 rounded-full blur-md transition-transform duration-75 delay-75"
                style={{ transform: `scale(${scale * 1.2})` }}
            />
            
            {/* Center Logo */}
            <div className="relative w-32 h-32 bg-stone-800 rounded-full border-4 border-stone-700 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="w-20 h-20 opacity-80">
                     <Logo isThinking={status === 'connecting'} isSpeaking={volume > 0.05} />
                </div>
            </div>
        </div>

        {/* Status Text */}
        <div className="h-16 flex items-center justify-center px-8 text-center">
            {status === 'error' ? (
                <p className="text-red-400">Connection Failed. Please try again.</p>
            ) : (
                <p className="text-lg font-medium text-stone-200 animate-pulse">
                    {volume > 0.1 ? "..." : "Bua, kea mamela (Speak, I'm listening)"}
                </p>
            )}
        </div>

        {/* Controls */}
        <div className="flex gap-6 items-center">
             <button className="p-4 rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
             </button>
             
             <button 
                onClick={handleHangup}
                className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-900/50 transition-transform hover:scale-105 active:scale-95"
             >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.36 7.46 6 12 6s8.66 2.36 11.71 5.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
             </button>

              <button className="p-4 rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
             </button>
        </div>
    </div>
  );
};

export default LiveVoiceOverlay;
