import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ObstacleState } from '../types';
import Dinosaur from './Dinosaur';
import Obstacle from './Obstacle';
import HeadTracker from './HeadTracker';

interface GameScreenProps {
  onGameOver: (score: number) => void;
  showCamera: boolean;
}

// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const DINO_Y_START = GAME_HEIGHT - 50;
const DINO_X_POS = 50;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 50;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const OBSTACLE_WIDTH_MIN = 30;
const OBSTACLE_WIDTH_MAX = 60;
const OBSTACLE_HEIGHT_MIN = 40;
const OBSTACLE_HEIGHT_MAX = 100;
const OBSTACLE_GAP_MIN = 280;
const OBSTACLE_GAP_MAX = 450;
const INITIAL_SPEED = 4;
const SPEED_INCREASE_INTERVAL = 5; // Increase speed every 5 points
const SPEED_INCREASE_AMOUNT = 0.4;

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, showCamera }) => {
  const [dinoY, setDinoY] = useState(DINO_Y_START);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [score, setScore] = useState(0);

  // Refs for high-frequency updates in the game loop to avoid stale state
  const gameLoopRef = useRef<number | null>(null);
  const dinoStateRef = useRef({ y: DINO_Y_START, velocityY: 0, isJumping: false });
  const obstaclesRef = useRef<ObstacleState[]>([]);
  const scoreRef = useRef(0);
  const gameSpeedRef = useRef(INITIAL_SPEED);

  const handleJump = useCallback(() => {
    if (!dinoStateRef.current.isJumping) {
      dinoStateRef.current.isJumping = true;
      dinoStateRef.current.velocityY = JUMP_FORCE;
    }
  }, []);
  
  useEffect(() => {
    const gameLoop = () => {
      // --- Physics Update ---
      const dino = dinoStateRef.current;
      dino.velocityY += GRAVITY;
      dino.y += dino.velocityY;

      if (dino.y >= DINO_Y_START) {
        dino.y = DINO_Y_START;
        dino.velocityY = 0;
        dino.isJumping = false;
      }

      // --- Game Speed & Difficulty Update ---
      const currentScore = scoreRef.current;
      gameSpeedRef.current = INITIAL_SPEED + Math.floor(currentScore / SPEED_INCREASE_INTERVAL) * SPEED_INCREASE_AMOUNT;
      
      const difficultyFactor = 1.0 + Math.floor(currentScore / 10) * 0.05;
      const currentGapMin = Math.max(180, OBSTACLE_GAP_MIN / difficultyFactor);
      const currentGapMax = Math.max(300, OBSTACLE_GAP_MAX / difficultyFactor);
      
      // --- Obstacle Update ---
      let newObstacles = obstaclesRef.current;
      newObstacles = newObstacles
        .map(obs => ({ ...obs, x: obs.x - gameSpeedRef.current }))
        .filter(obs => obs.x > -obs.width);

      // Add new obstacle if needed
      const lastObstacle = newObstacles[newObstacles.length - 1];
      if (!lastObstacle || (GAME_WIDTH - lastObstacle.x) > (currentGapMin + Math.random() * (currentGapMax - currentGapMin))) {
        const height = OBSTACLE_HEIGHT_MIN + Math.random() * (OBSTACLE_HEIGHT_MAX - OBSTACLE_HEIGHT_MIN);
        newObstacles.push({
          id: Date.now(),
          x: GAME_WIDTH,
          width: OBSTACLE_WIDTH_MIN + Math.random() * (OBSTACLE_WIDTH_MAX - OBSTACLE_WIDTH_MIN),
          height: height,
          y: GAME_HEIGHT - height,
          passed: false,
        });
      }

      // --- Score Update ---
      newObstacles.forEach(obs => {
        if (!obs.passed && obs.x + obs.width < DINO_X_POS) {
            obs.passed = true;
            scoreRef.current += 1;
        }
      });
      obstaclesRef.current = newObstacles;

      // --- Collision Detection ---
      const dinoRect = { x: DINO_X_POS, y: dino.y, width: DINO_WIDTH, height: DINO_HEIGHT };
      for (const obs of obstaclesRef.current) {
        const obsRect = { x: obs.x, y: obs.y, width: obs.width, height: obs.height };
        if (
          dinoRect.x < obsRect.x + obsRect.width &&
          dinoRect.x + dinoRect.width > obsRect.x &&
          dinoRect.y < obsRect.y + obsRect.height &&
          dinoRect.y + dinoRect.height > obsRect.y
        ) {
          if (gameLoopRef.current !== null) cancelAnimationFrame(gameLoopRef.current);
          onGameOver(scoreRef.current);
          return; // Stop the loop
        }
      }

      // --- Sync refs to state for rendering ---
      setDinoY(dino.y);
      setIsJumping(dino.isJumping);
      setObstacles([...newObstacles]);
      setScore(scoreRef.current);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
        if (gameLoopRef.current !== null) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [onGameOver]);

  return (
    <div className="relative w-full max-w-4xl aspect-[2/1] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border-4 border-gray-300 dark:border-gray-700">
      <div style={{ width: GAME_WIDTH, height: GAME_HEIGHT, position: 'relative' }}>
          {/* Game elements */}
          <Dinosaur y={dinoY} x={DINO_X_POS} isJumping={isJumping} />
          {obstacles.map(obs => <Obstacle key={obs.id} {...obs} />)}
          <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-600 dark:bg-gray-500" />

          {/* HUD */}
          <div className="absolute top-4 right-4 text-2xl font-bold text-gray-700 dark:text-gray-200">
              SCORE: {score}
          </div>

          <HeadTracker onJump={handleJump} showCamera={showCamera} />
      </div>
    </div>
  );
};

export default GameScreen;