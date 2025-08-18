import React from 'react';
import { ObstacleState } from '../types';

const GROUND_Y_OFFSET = 60; // Must match GameScreen constant

const OBSTACLE_COLORS = [
  'bg-red-500 border-red-700', 'bg-blue-500 border-blue-700', 'bg-yellow-500 border-yellow-700',
  'bg-purple-500 border-purple-700', 'bg-pink-500 border-pink-700', 'bg-indigo-500 border-indigo-700',
  'bg-teal-500 border-teal-700', 'bg-orange-500 border-orange-700',
];

const Obstacle: React.FC<ObstacleState> = ({ id, x, width, height, type, y }) => {
  const colorClass = OBSTACLE_COLORS[id % OBSTACLE_COLORS.length];

  switch (type) {
    case 'pit':
      // Pit is now a true empty space, rendered by the absence of a ground segment in GameScreen.
      return null;
    case 'flying':
       return (
        <div
          className={`absolute rounded-md border-2 ${colorClass}`}
          style={{ left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` }}
          aria-label="A flying obstacle"
        />
      );
    case 'heart':
      return (
         <div className="absolute text-4xl animate-float" style={{ left: `${x}px`, top: `${y}px` }} aria-label="Extra life heart">
            ❤️
         </div>
      );
    case 'coin':
      return (
          <div className="absolute text-3xl animate-bounce" style={{ left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` }} aria-label="Coin">
              🪙
          </div>
      );
    case 'bomb':
        return (
            <div className="absolute text-4xl animate-pulse" style={{ left: `${x}px`, top: `${y}px` }} aria-label="Bomb">
                💣
            </div>
        );
    case 'pillar':
      return (
        <div
          className={`absolute rounded-sm border-2 ${colorClass}`}
          style={{ left: `${x}px`, bottom: `${GROUND_Y_OFFSET}px`, width: `${width}px`, height: `${height}px` }}
          aria-label="A pillar obstacle"
        />
      );
  }
};

export default React.memo(Obstacle);