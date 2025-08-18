import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ObstacleState } from '../types';
import Dinosaur from './Dinosaur';
import Obstacle from './Obstacle';

interface GameScreenProps {
  onGameOver: (score: number) => void;
  playSfx: (type: 'jump' | 'land' | 'hit' | 'lose' | 'coin' | 'heart' | 'bomb') => void;
}

// Game Constants
const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;
const GROUND_Y_OFFSET = 60;
const DINO_WIDTH = 50;
const DINO_HEIGHT = 50;
const DINO_Y_START = GAME_HEIGHT - GROUND_Y_OFFSET - DINO_HEIGHT;
const DINO_X_POS = 50;
const GRAVITY = 0.4; 
const JUMP_FORCE = -9;
const MAX_JUMPS = 3;
const OBSTACLE_WIDTH_MIN = 30;
const OBSTACLE_WIDTH_MAX = 60;
const OBSTACLE_HEIGHT_MIN = 40;
const OBSTACLE_HEIGHT_MAX = 120;
const OBSTACLE_GAP_MIN = 200; // Reduced for more action
const OBSTACLE_GAP_MAX = 280; // Reduced for more action
const PIT_WIDTH_MIN = 100;
const PIT_WIDTH_MAX = 150;
const INITIAL_SPEED = 2; 
const SPEED_INCREASE_INTERVAL = 5;
const SPEED_INCREASE_AMOUNT = 0.15; 
const LIVES_START = 3;
const SCORE_PENALTY_START = 5;
const INVINCIBILITY_DURATION = 2000;
const GRACE_PERIOD_DURATION = 3000;
const BG_CHANGE_SCORE_MILESTONE = 75;
const HEART_SPAWN_SCORE_DELAY = 15;

const BG_COLORS = [
  'bg-gray-200 dark:bg-gray-800', 'bg-sky-200 dark:bg-slate-800',
  'bg-amber-100 dark:bg-indigo-900', 'bg-teal-100 dark:bg-gray-900',
  'bg-rose-100 dark:bg-slate-900',
];

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, playSfx }) => {
  const [dinoY, setDinoY] = useState(DINO_Y_START);
  const [dinoAction, setDinoAction] = useState<'jump' | 'land' | null>(null);
  const [dinoOnGround, setDinoOnGround] = useState(true);
  const [dinoRotation, setDinoRotation] = useState(0);
  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES_START);
  const [isInvincible, setInvincible] = useState(false);
  const [gameMessage, setGameMessage] = useState('Get Ready!');
  const [isPausedAfterHit, setPausedAfterHit] = useState(false);
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  
  const gameLoopRef = useRef<number | null>(null);
  const dinoStateRef = useRef({ y: DINO_Y_START, velocityY: 0, onGround: true, jumpsMade: 0 });
  const obstaclesRef = useRef<ObstacleState[]>([]);
  const scoreRef = useRef(0);
  const gameSpeedRef = useRef(INITIAL_SPEED);
  const livesRef = useRef(LIVES_START);
  const scorePenaltyRef = useRef(SCORE_PENALTY_START);
  const isInvincibleRef = useRef(false);
  const gameStartTimeRef = useRef<number | null>(null);
  const nextBgChangeScoreRef = useRef(BG_CHANGE_SCORE_MILESTONE);
  const currentBgIndexRef = useRef(0);
  const canSpawnHeartAfterScoreRef = useRef(Infinity);

  const handleJump = useCallback(() => {
    if (isPausedAfterHit) return;

    const dino = dinoStateRef.current;
    if (dino.jumpsMade < MAX_JUMPS) {
      playSfx('jump');
      dino.velocityY = dino.jumpsMade === 2 ? JUMP_FORCE * 1.2 : JUMP_FORCE;
      dino.onGround = false;
      dino.jumpsMade++;
      setDinoAction('jump');
      setTimeout(() => setDinoAction(null), 300);
    }
  }, [isPausedAfterHit, playSfx]);

  const handleCollision = useCallback(() => {
    if (isInvincibleRef.current || isPausedAfterHit) return;
    playSfx('hit');
    setPausedAfterHit(true);
  }, [isPausedAfterHit, playSfx]);
  
  const handleContinueGame = () => {
     livesRef.current -= 1;
     if (scoreRef.current >= 10) {
        scoreRef.current = Math.max(0, scoreRef.current - scorePenaltyRef.current);
        scorePenaltyRef.current = Math.min(15, scorePenaltyRef.current + 5); 
     }
     setLives(livesRef.current);
     setScore(scoreRef.current);
     if (livesRef.current <= 0) {
       onGameOver(scoreRef.current);
       return;
     }
     canSpawnHeartAfterScoreRef.current = scoreRef.current + HEART_SPAWN_SCORE_DELAY;
     isInvincibleRef.current = true;
     setInvincible(true);
     setTimeout(() => {
       isInvincibleRef.current = false;
       setInvincible(false);
     }, INVINCIBILITY_DURATION);
     setPausedAfterHit(false);
  };
  
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      gameStartTimeRef.current = Date.now();
      setGameMessage('');
    }, GRACE_PERIOD_DURATION);
    return () => clearTimeout(startTimeout);
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameStartTimeRef.current || isPausedAfterHit) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    const dino = dinoStateRef.current;
    dino.velocityY += GRAVITY;
    dino.y += dino.velocityY;
    
    let fellInPit = false;
    // Lenient pit detection: only fall if the center of the dino is over the pit
    const dinoCenterX = DINO_X_POS + DINO_WIDTH / 2;
    const pitUnderDino = obstaclesRef.current.find(obs => 
        obs.type === 'pit' &&
        dinoCenterX > obs.x && 
        dinoCenterX < (obs.x + obs.width)
    );
    
    if (dino.y >= DINO_Y_START && pitUnderDino) {
        fellInPit = true;
    }


    if (fellInPit) {
        // Continue falling into the pit
    } else if (dino.y >= DINO_Y_START) {
      if (!dino.onGround) {
        playSfx('land');
        setDinoAction('land');
        setTimeout(() => setDinoAction(null), 200);
      }
      dino.y = DINO_Y_START;
      dino.velocityY = 0;
      dino.onGround = true;
      dino.jumpsMade = 0;
    }

    if (dino.y > GAME_HEIGHT) { // Fell off screen completely
        handleCollision();
        // Reset dino position to avoid repeated fall triggers
        dino.y = DINO_Y_START; 
        dino.velocityY = 0;
        dino.onGround = true;
        dino.jumpsMade = 0;
    }
    setDinoOnGround(dino.onGround);
    
    let newObstacles = obstaclesRef.current;

    gameSpeedRef.current = INITIAL_SPEED + Math.floor(scoreRef.current / SPEED_INCREASE_INTERVAL) * SPEED_INCREASE_AMOUNT;
    newObstacles = newObstacles
      .map(obs => ({ ...obs, x: obs.x - gameSpeedRef.current }))
      .filter(obs => obs.x > -obs.width - 50);

    const obstacleGap = OBSTACLE_GAP_MIN + Math.random() * (OBSTACLE_GAP_MAX - OBSTACLE_GAP_MIN);

    const lastObstacle = newObstacles[newObstacles.length - 1];
    if (!lastObstacle || (GAME_WIDTH - lastObstacle.x) > obstacleGap) {
        const canSpawnHeart = livesRef.current < LIVES_START && !newObstacles.some(o => o.type === 'heart') && scoreRef.current >= canSpawnHeartAfterScoreRef.current;
        if (canSpawnHeart) {
            newObstacles.push({ id: Date.now(), x: GAME_WIDTH, type: 'heart', width: 40, height: 40, y: GAME_HEIGHT / 2 - 50, passed: true });
            canSpawnHeartAfterScoreRef.current = Infinity; // Reset until next life loss
        } else {
            const rand = Math.random();
            if (rand < 0.10) { // Bomb (10%)
                const isFlyingBomb = Math.random() > 0.4; // 60% chance to be flying
                const bombY = isFlyingBomb ? DINO_Y_START - DINO_HEIGHT - (20 + Math.random() * 80) : DINO_Y_START;
                newObstacles.push({ id: Date.now(), x: GAME_WIDTH, type: 'bomb', width: 40, height: 40, y: bombY, passed: false });
            } else if (rand < 0.45) { // Coin (35% - Increased!)
                newObstacles.push({ id: Date.now(), x: GAME_WIDTH, type: 'coin', width: 30, height: 30, y: DINO_Y_START - DINO_HEIGHT - (30 + Math.random() * 70), passed: true });
            } else if (rand < 0.65) { // Pit (20%)
                newObstacles.push({ id: Date.now(), x: GAME_WIDTH, type: 'pit', width: PIT_WIDTH_MIN + Math.random() * (PIT_WIDTH_MAX - PIT_WIDTH_MIN), height: GROUND_Y_OFFSET, y: GAME_HEIGHT - GROUND_Y_OFFSET, passed: false });
            } else if (rand < 0.80) { // Flying (15%)
                const h = 40 + Math.random() * 40;
                newObstacles.push({ id: Date.now(), x: GAME_WIDTH, type: 'flying', width: 50 + Math.random() * 30, height: h, y: DINO_Y_START - h - (20 + Math.random() * 60), passed: false });
            } else { // Pillar (20%)
                 const h = OBSTACLE_HEIGHT_MIN + Math.random() * (OBSTACLE_HEIGHT_MAX - OBSTACLE_HEIGHT_MIN);
                 newObstacles.push({ id: Date.now(), x: GAME_WIDTH, type: 'pillar', width: OBSTACLE_WIDTH_MIN + Math.random() * (OBSTACLE_WIDTH_MAX - OBSTACLE_WIDTH_MIN), height: h, y: GAME_HEIGHT - h - GROUND_Y_OFFSET, passed: false });
            }
        }
    }
    
    newObstacles.forEach(obs => {
        if (!obs.passed && obs.x + obs.width < DINO_X_POS) {
            obs.passed = true;
            scoreRef.current += (obs.type === 'pit' ? 3 : 1);
            
            if (scoreRef.current >= nextBgChangeScoreRef.current) {
                currentBgIndexRef.current = (currentBgIndexRef.current + 1) % BG_COLORS.length;
                setBgColor(BG_COLORS[currentBgIndexRef.current]);
                nextBgChangeScoreRef.current += BG_CHANGE_SCORE_MILESTONE;
            }
        }
    });

    const dinoRect = { x: DINO_X_POS, y: dino.y, width: DINO_WIDTH, height: DINO_HEIGHT };
    for (const obs of newObstacles) {
        const obsRect = { x: obs.x, y: obs.y, width: obs.width, height: obs.height };
        if (dinoRect.x < obsRect.x + obsRect.width && dinoRect.x + dinoRect.width > obsRect.x && dinoRect.y < obsRect.y + obsRect.height && dinoRect.y + dinoRect.height > obsRect.y) {
            if (obs.type === 'coin') {
                playSfx('coin');
                scoreRef.current += 5;
                newObstacles = newObstacles.filter(o => o.id !== obs.id);
            } else if (obs.type === 'heart') {
                playSfx('heart');
                livesRef.current = Math.min(LIVES_START, livesRef.current + 1);
                setLives(livesRef.current);
                newObstacles = newObstacles.filter(o => o.id !== obs.id);
            } else if (obs.type === 'bomb') {
                if (isInvincibleRef.current) continue;
                playSfx('bomb');
                onGameOver(scoreRef.current);
                return; // Exit game loop immediately
            } else if (obs.type !== 'pit') { // All other obstacles
                handleCollision();
            }
        }
    }
    obstaclesRef.current = newObstacles;

    setDinoY(dino.y);
    setDinoRotation(dino.onGround ? 0 : Math.max(-20, dino.velocityY * 2));
    setObstacles([...newObstacles]);
    setScore(scoreRef.current);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [onGameOver, handleCollision, isPausedAfterHit, playSfx]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameLoop]);

  const penalty = score < 10 ? 0 : scorePenaltyRef.current;
  
  // --- Ground Rendering Logic ---
  const visiblePits = obstacles.filter(o => o.type === 'pit' && o.x < GAME_WIDTH && o.x + o.width > 0).sort((a, b) => a.x - b.x);
  const groundSegments = [];
  let lastX = 0;
  visiblePits.forEach(pit => {
      if (pit.x > lastX) {
          groundSegments.push({ left: lastX, width: pit.x - lastX });
      }
      lastX = pit.x + pit.width;
  });
  if (lastX < GAME_WIDTH + 200) { // Extend ground off-screen to prevent pop-in
      groundSegments.push({ left: lastX, width: (GAME_WIDTH + 200) - lastX });
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow-lg border-4 border-gray-300 dark:border-gray-700 cursor-pointer transition-colors duration-1000 ${bgColor}`}
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      onPointerDown={handleJump} role="button" tabIndex={0} aria-label="Game Area, Tap to Jump"
    >
      <Dinosaur y={dinoY} x={DINO_X_POS} isInvincible={isInvincible} rotation={dinoRotation} action={dinoAction} onGround={dinoOnGround} />
      
      {/* Dynamic Ground Segments */}
      {groundSegments.map((seg, i) => (
          <div key={i} className="absolute bottom-0 bg-gray-600 dark:bg-gray-500" style={{ height: `${GROUND_Y_OFFSET}px`, left: `${seg.left}px`, width: `${seg.width}px` }} />
      ))}

      {obstacles.map(obs => <Obstacle key={obs.id} {...obs} />)}
      
      <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

      {/* HUD */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/20 rounded-lg text-2xl font-bold">
          {'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, LIVES_START - lives))}
      </div>
      <div className="absolute top-4 right-4 px-4 py-1 bg-black/20 rounded-lg text-2xl font-bold text-white dark:text-gray-200">
          {score}
      </div>
      <button onClick={() => onGameOver(scoreRef.current)} className="absolute top-4 right-1/2 translate-x-1/2 px-3 py-1 bg-black/20 rounded-full text-lg font-bold text-white hover:bg-red-500 z-20">
          X
      </button>
      
      {gameMessage && !isPausedAfterHit && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-black/50 rounded-lg text-3xl font-bold text-white animate-pulse">
            {gameMessage}
        </div>
      )}
      
      {isPausedAfterHit && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-6 text-center p-4 z-10">
              <h2 className="text-5xl font-extrabold text-red-500">Ouch!</h2>
              <p className="text-lg text-white">You have {lives - 1} {lives - 1 === 1 ? 'life' : 'lives'} left.</p>
              <button onClick={handleContinueGame} className="w-full max-w-xs px-6 py-4 text-xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105">
                {penalty > 0 ? `Continue (-${penalty} Points)`: 'Continue'}
              </button>
              <button onClick={() => onGameOver(scoreRef.current)} className="w-full max-w-xs px-6 py-3 text-lg font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105">
                Share & Quit
              </button>
          </div>
      )}

      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center text-sm font-semibold text-gray-400 dark:text-gray-500 pointer-events-none">
          Tap up to 3 times to jump higher
      </div>
    </div>
  );
};

export default GameScreen;