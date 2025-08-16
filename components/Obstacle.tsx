
import React from 'react';
import { ObstacleState } from '../types';

const Obstacle: React.FC<ObstacleState> = ({ x, y, width, height }) => {
  return (
    <div
      className="absolute bg-red-500 rounded-sm"
      style={{
        left: `${x}px`,
        bottom: 0,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

export default React.memo(Obstacle);
