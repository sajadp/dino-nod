import React from 'react';

// Game Constants from GameScreen
const GAME_HEIGHT = 700;
const DINO_WIDTH = 50;
const DINO_HEIGHT = 50;

interface DinosaurProps {
  y: number;
  x: number;
  isInvincible: boolean;
  rotation: number;
  action: 'jump' | 'land' | null;
  onGround: boolean;
}

const Dinosaur: React.FC<DinosaurProps> = ({ y, x, isInvincible, rotation, action, onGround }) => {
  const bottomPosition = GAME_HEIGHT - (y + DINO_HEIGHT);
  const animationClass = action === 'jump' ? 'animate-stretch-jump' : action === 'land' ? 'animate-squash-land' : '';
  const showDust = (action === 'jump' && onGround) || action === 'land';

  return (
    <div
      className="absolute"
      style={{
        width: `${DINO_WIDTH}px`,
        height: `${DINO_HEIGHT}px`,
        bottom: `${bottomPosition}px`,
        left: `${x}px`,
      }}
      aria-hidden="true"
    >
        {showDust && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end justify-center w-16 h-8 pointer-events-none">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-dust-poof-1" style={{ animationDelay: '0.1s' }}/>
                <div className="w-3 h-3 bg-gray-500 dark:bg-gray-600 rounded-full animate-dust-poof-2" />
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-dust-poof-3" style={{ animationDelay: '0.05s' }}/>
            </div>
        )}
        <div
            className={`relative w-full h-full select-none origin-bottom bg-green-500 rounded-lg ${animationClass} ${isInvincible ? 'animate-pulse opacity-50' : ''}`}
            style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.1s linear',
            }}
        >
            {/* Eye */}
            <div className="absolute top-2 right-2 w-4 h-4 bg-black rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-800">
                {/* Eye Highlight */}
                <div className="w-1 h-1 bg-white rounded-full" />
            </div>
        </div>
    </div>
  );
};

export default React.memo(Dinosaur);