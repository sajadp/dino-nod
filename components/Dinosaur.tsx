
import React from 'react';

interface DinosaurProps {
  y: number;
  x: number;
  isJumping: boolean;
}

const Dinosaur: React.FC<DinosaurProps> = ({ y, x, isJumping }) => {
  return (
    <div
      className="absolute w-10 h-[50px] bg-green-500 rounded-t-md transition-transform duration-100"
      style={{
        bottom: `${350 - y}px`,
        left: `${x}px`,
        transform: isJumping ? 'rotate(-10deg)' : 'rotate(0deg)',
      }}
    >
      {/* Eye */}
      <div className="absolute top-3 right-3 w-2 h-2 bg-white dark:bg-black rounded-full" />
    </div>
  );
};

export default React.memo(Dinosaur);
