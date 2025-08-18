import React, { useState } from 'react';
import { Theme } from '../types';

interface MainMenuProps {
  onStartGame: () => void;
  highScore: number;
  userName: string;
  onUserNameChange: (name: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMusicOn: boolean;
  onToggleMusic: () => void;
  isSfxOn: boolean;
  onToggleSfx: () => void;
  onShowLeaderboard: () => void;
  canInstall: boolean;
  onInstall: () => void;
}

const ToggleSwitch: React.FC<{id: string, label: string, icon: string, checked: boolean, onChange: () => void}> = ({ id, label, icon, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <label htmlFor={id} className="flex items-center cursor-pointer select-none">
            <span className="mr-3 text-lg" aria-hidden="true">{icon}</span>
            <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
        </label>
        <div className="relative">
            <input id={id} type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="block bg-gray-300 dark:bg-gray-600 w-14 h-8 rounded-full peer-checked:bg-green-500 transition-colors"></div>
            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full"></div>
        </div>
    </div>
);


const MainMenu: React.FC<MainMenuProps> = ({ 
  onStartGame, 
  highScore, 
  userName, 
  onUserNameChange,
  theme,
  onToggleTheme,
  isMusicOn,
  onToggleMusic,
  isSfxOn,
  onToggleSfx,
  onShowLeaderboard,
  canInstall,
  onInstall
}) => {
  const [nameInput, setNameInput] = useState(userName);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleNameBlur = () => {
    onUserNameChange(nameInput);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        onUserNameChange(nameInput);
        e.currentTarget.blur();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl space-y-6">
      <div className="flex justify-center items-center space-x-4">
        <div className="w-16 h-16 bg-green-500 rounded-lg animate-nod" />
        <h1 className="text-5xl font-bold text-green-500">Dino Nod</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-300">
        Tap to jump over obstacles and survive!
      </p>
      
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Name</label>
        <input
          id="username"
          type="text"
          value={nameInput}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onKeyPress={handleKeyPress}
          placeholder="Enter your name"
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
        <p className="text-lg font-semibold text-green-800 dark:text-green-200">High Score: {highScore}</p>
      </div>
      
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onShowLeaderboard}
            className="w-full px-4 py-3 text-lg font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 transition-transform transform hover:scale-105"
          >
           🏆 Leaderboard
          </button>
          {canInstall && (
            <button
              onClick={onInstall}
              className="w-full px-4 py-3 text-lg font-bold text-white bg-purple-500 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700 transition-transform transform hover:scale-105"
            >
              📲 Install Game
            </button>
          )}
      </div>

      <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <ToggleSwitch id="music-toggle" label="Music" icon="🎵" checked={isMusicOn} onChange={onToggleMusic} />
          <ToggleSwitch id="sfx-toggle" label="Sound Effects" icon="🔊" checked={isSfxOn} onChange={onToggleSfx} />
      </div>

      <button
        onClick={onStartGame}
        className="w-full px-6 py-4 text-xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 transition-transform transform hover:scale-105 disabled:bg-green-700 disabled:cursor-wait"
      >
        Start Game
      </button>

      <div className="flex justify-center items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};

export default MainMenu;