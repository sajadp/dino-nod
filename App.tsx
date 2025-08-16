
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Theme } from './types';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';

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
  const [showCamera, setShowCamera] = useState(true);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('dino-nod-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === Theme.Light ? Theme.Dark : Theme.Light));
  }, []);

  const handleSetUserName = useCallback((name: string) => {
    const finalName = name.trim() === '' ? 'Player' : name;
    setUserName(finalName);
    localStorage.setItem('dino-nod-username', finalName);
  }, []);

  const handleStartGame = () => {
    setScore(0);
    setGameState(GameState.Playing);
  };
  
  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('dino-nod-highscore', finalScore.toString());
    }
    setGameState(GameState.GameOver);
  }, [highScore]);
  
  const handleRestart = () => {
    setGameState(GameState.MainMenu);
  };
  
  const renderGameState = () => {
    switch(gameState) {
      case GameState.Playing:
        return <GameScreen onGameOver={handleGameOver} showCamera={showCamera} />;
      case GameState.GameOver:
        return <GameOverScreen score={score} highScore={highScore} onRestart={handleRestart} userName={userName} />;
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
            showCamera={showCamera}
            onToggleCamera={() => setShowCamera(prev => !prev)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans overflow-hidden">
      <main className="flex-grow flex items-center justify-center">
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
