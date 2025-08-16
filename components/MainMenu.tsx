
import React, { useState } from 'react';
import { Theme } from '../types';

interface MainMenuProps {
  onStartGame: () => void;
  highScore: number;
  userName: string;
  onUserNameChange: (name: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  showCamera: boolean;
  onToggleCamera: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onStartGame, 
  highScore, 
  userName, 
  onUserNameChange,
  theme,
  onToggleTheme,
  showCamera,
  onToggleCamera
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
        Nod your head up to make the dino jump! A fun exercise for your neck.
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

      <button
        onClick={onStartGame}
        className="w-full px-6 py-4 text-xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700 transition-transform transform hover:scale-105"
      >
        Start Game
      </button>

      <div className="flex justify-around items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="flex items-center space-x-2">
          <label htmlFor="camera-toggle" className="text-sm">Show Camera:</label>
          <button
            id="camera-toggle"
            onClick={onToggleCamera}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${showCamera ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${showCamera ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
