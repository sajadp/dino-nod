import React, { useState, useEffect, useRef } from 'react';

interface MicrophoneCheckProps {
  onTestComplete: () => void;
  analyser: AnalyserNode | null;
}

const VOLUME_THRESHOLD = 80; // Must match GameScreen for consistency

const MicrophoneCheck: React.FC<MicrophoneCheckProps> = ({ onTestComplete, analyser }) => {
  const [status, setStatus] = useState('Initializing...');
  const [volume, setVolume] = useState(0);

  const animationFrameRef = useRef<number | null>(null);
  const successTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser) {
      setStatus('Microphone not available.');
      const timer = setTimeout(() => onTestComplete(), 2000);
      return () => clearTimeout(timer);
    }
    
    setStatus('Please make a sound!');
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += dataArray[i];
      }
      const averageVolume = sum / 8;
      setVolume(averageVolume);

      if (averageVolume > VOLUME_THRESHOLD && status !== 'Success!') {
        setStatus('Success!');
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = window.setTimeout(() => {
            onTestComplete();
        }, 1500);
      } else {
         animationFrameRef.current = requestAnimationFrame(checkVolume);
      }
    };
    animationFrameRef.current = requestAnimationFrame(checkVolume);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
      }
    };
  }, [onTestComplete, status, analyser]);

  const volumePercentage = Math.min(100, (volume / 200) * 100);

  return (
    <div className="w-full max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl space-y-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-green-500">🎤 Mic Check 🎤</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300">{status}</p>
      
      <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
          <div 
            className="h-full bg-green-500 transition-all duration-75"
            style={{ width: `${volumePercentage}%` }}
          />
      </div>
      <div className="w-full relative h-2">
         <div className="absolute h-full w-px bg-red-500" style={{ left: `${(VOLUME_THRESHOLD / 200) * 100}%`}}>
            <span className="absolute -top-6 -translate-x-1/2 text-sm text-red-500">Jump!</span>
         </div>
      </div>
      
      <button
        onClick={() => onTestComplete()}
        className="w-full px-6 py-3 text-lg font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300"
      >
        Continue to Game
      </button>
    </div>
  );
};

export default MicrophoneCheck;