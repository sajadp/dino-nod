import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Theme } from './types';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import LeaderboardScreen from './components/LeaderboardScreen';

// --- Simple Web Audio API Sound Engine ---
let audioCtx: AudioContext | null = null;
let musicOscillator: OscillatorNode | null = null;
let musicGain: GainNode | null = null;

const initAudio = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported.");
    }
  }
};

const playSfx = (type: 'jump' | 'land' | 'hit' | 'lose' | 'coin' | 'heart' | 'bomb') => {
    if (!audioCtx) return;
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

        switch(type) {
            case 'jump':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.2);
                break;
            case 'land':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.1);
                break;
            case 'hit':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.4);
                break;
            case 'bomb':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
                break;
            case 'lose':
                 oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 1);
                break;
            case 'coin':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.15);
                break;
            case 'heart':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.3);
                break;
        }
    } catch (e) { console.error("Error playing sfx", e)}
};

const musicNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
let noteIndex = 0;
let musicInterval: number | null = null;
const playMusic = () => {
    if (!audioCtx || musicInterval) return;
    const playNote = () => {
        if (!audioCtx || !musicGain) return;
        const oscillator = audioCtx.createOscillator();
        oscillator.connect(musicGain);
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(musicNotes[noteIndex % musicNotes.length] / 2, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.25);
        noteIndex++;
    };
    musicInterval = window.setInterval(playNote, 300);
};

const stopMusic = () => {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
};

// --- App Component ---
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MainMenu);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('dino-nod-theme') as Theme) || Theme.Dark;
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('dino-nod-highscore') || '0', 10);
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('dino-nod-username') || 'Player';
  });
  const [notification, setNotification] = useState<string | null>(null);
  
  // PWA Install Prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Sound State
  const [isMusicOn, setIsMusicOn] = useState(() => localStorage.getItem('dino-nod-music') !== 'off');
  const [isSfxOn, setIsSfxOn] = useState(() => localStorage.getItem('dino-nod-sfx') !== 'off');
  const isSfxOnRef = useRef(isSfxOn);
  isSfxOnRef.current = isSfxOn;

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('dino-nod-theme', theme);
  }, [theme]);

  // PWA Install handler
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Audio Management Effects ---
  useEffect(() => {
      if (isMusicOn && gameState === GameState.Playing) {
          if (!audioCtx) initAudio();
          if (audioCtx && !musicGain) {
            musicGain = audioCtx.createGain();
            musicGain.gain.value = 0.1;
            musicGain.connect(audioCtx.destination);
          }
          playMusic();
      } else {
          stopMusic();
      }
      return () => stopMusic();
  }, [isMusicOn, gameState]);


  const handlePlaySfx = useCallback((type: 'jump' | 'land' | 'hit' | 'lose' | 'coin' | 'heart' | 'bomb') => {
      if(isSfxOnRef.current) {
          playSfx(type);
      }
  }, []);

  // --- Component Callbacks ---
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === Theme.Light ? Theme.Dark : Theme.Light));
  }, []);
  
  const handleToggleMusic = useCallback(() => {
      setIsMusicOn(prev => {
          const newValue = !prev;
          localStorage.setItem('dino-nod-music', newValue ? 'on' : 'off');
          return newValue;
      });
  }, []);
  
  const handleToggleSfx = useCallback(() => {
      setIsSfxOn(prev => {
          const newValue = !prev;
          localStorage.setItem('dino-nod-sfx', newValue ? 'on' : 'off');
          return newValue;
      });
  }, []);

  const handleSetUserName = useCallback((name: string) => {
    const finalName = name.trim() === '' ? 'Player' : name;
    setUserName(finalName);
    localStorage.setItem('dino-nod-username', finalName);
  }, []);

  const handleStartGame = useCallback(() => {
    initAudio(); // Initialize audio on first user interaction
    setScore(0);
    setNotification('Get Ready!');
    setGameState(GameState.Playing);
  }, []);
  
  const handleGameOver = useCallback((finalScore: number) => {
    if (gameState !== GameState.Playing) return; // Prevent multiple calls
    handlePlaySfx('lose');
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('dino-nod-highscore', finalScore.toString());
    }
    setGameState(GameState.GameOver);
  }, [highScore, handlePlaySfx, gameState]);
  
  const handleRestart = () => {
    setGameState(GameState.MainMenu);
  };
  
  const handleShowLeaderboard = () => {
    setGameState(GameState.Leaderboard);
  }

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };
  
  const renderGameState = () => {
    switch(gameState) {
      case GameState.Playing:
        return <GameScreen onGameOver={handleGameOver} playSfx={handlePlaySfx} />;
      case GameState.GameOver:
        return <GameOverScreen score={score} highScore={highScore} onRestart={handleRestart} onShowLeaderboard={handleShowLeaderboard} userName={userName} />;
      case GameState.Leaderboard:
        return <LeaderboardScreen onBack={handleRestart} />;
      case GameState.MainMenu:
      default:
        return (
          <MainMenu 
            onStartGame={handleStartGame} 
            highScore={highScore}
            userName={userName}
            onUserNameChange={handleSetUserName}
            theme={theme}
            onToggleTheme={toggleTheme}
            isMusicOn={isMusicOn}
            onToggleMusic={handleToggleMusic}
            isSfxOn={isSfxOn}
            onToggleSfx={handleToggleSfx}
            onShowLeaderboard={handleShowLeaderboard}
            onInstall={handleInstall}
            canInstall={!!installPrompt}
          />
        );
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      {notification && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-50 text-center animate-fade-in-down">
              {notification}
          </div>
      )}
      <main className="flex-grow flex items-center justify-center p-2">
        {renderGameState()}
      </main>
      <footer className="w-full text-center p-2 bg-gray-200 dark:bg-gray-800">
        <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
          Your Advertisement Banner Here - Click for amazing deals!
        </a>
      </footer>
    </div>
  );
};

export default App;