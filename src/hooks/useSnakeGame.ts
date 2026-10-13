import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Coordinate,
  Direction,
  FoodItem,
  FoodType,
  GameMode,
  Difficulty,
  GameStatus,
  ActivePowerUp,
  Particle,
  ScorePopup,
} from '../types/game';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { recordGameRun, loadGameStats } from '../utils/storage';

export const GRID_SIZE = 20;

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const DIFFICULTY_BASE_SPEEDS: Record<Difficulty, number> = {
  CASUAL: 135,
  NORMAL: 95,
  TURBO: 70,
  EXTREME: 50,
};

export const SPEED_LEVEL_INTERVALS: Record<number, number> = {
  1: 155, // 1 - Relaxed / Slow
  2: 130, // 2 - Casual
  3: 110, // 3 - Moderate
  4: 95,  // 4 - Standard / Normal
  5: 80,  // 5 - Fast
  6: 68,  // 6 - Turbo
  7: 54,  // 7 - Extreme
  8: 42,  // 8 - Hyper Insane
};


function createInitialSnake(): Coordinate[] {
  return [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ];
}

function generateObstacles(mode: GameMode): Coordinate[] {
  if (mode !== 'OBSTACLES') return [];
  const obstacles: Coordinate[] = [];
  const count = 7;
  const safeZone = new Set([
    '7,10', '8,10', '9,10', '10,10', '11,10',
    '7,9', '8,9', '9,9', '10,9', '11,9',
    '7,11', '8,11', '9,11', '10,11', '11,11',
  ]);

  while (obstacles.length < count) {
    const x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
    const y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
    const key = `${x},${y}`;

    if (!safeZone.has(key) && !obstacles.some((o) => o.x === x && o.y === y)) {
      obstacles.push({ x, y });
    }
  }
  return obstacles;
}

export function useSnakeGame(
  mode: GameMode,
  difficulty: Difficulty,
  speedLevel: number = 4,
  progressiveSpeed: boolean = true
) {
  const [snake, setSnake] = useState<Coordinate[]>(createInitialSnake);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [obstacles, setObstacles] = useState<Coordinate[]>(() => generateObstacles(mode));
  const [gameStatus, setGameStatus] = useState<GameStatus>('READY');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => loadGameStats().highScore);
  const [combo, setCombo] = useState<number>(1);
  const [comboExpiry, setComboExpiry] = useState<number>(0);
  const [activePowerUp, setActivePowerUp] = useState<ActivePowerUp | null>(null);
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);

  // Refs for high performance game loop without stale closures
  const snakeRef = useRef<Coordinate[]>(snake);
  snakeRef.current = snake;

  const isBoostingRef = useRef<boolean>(false);
  isBoostingRef.current = isBoosting;


  const currentDirRef = useRef<Direction>('RIGHT');
  const inputQueueRef = useRef<Direction[]>([]);
  const foodItemsRef = useRef<FoodItem[]>(foodItems);
  foodItemsRef.current = foodItems;

  const obstaclesRef = useRef<Coordinate[]>(obstacles);
  obstaclesRef.current = obstacles;

  const gameStatusRef = useRef<GameStatus>(gameStatus);
  gameStatusRef.current = gameStatus;

  const activePowerUpRef = useRef<ActivePowerUp | null>(activePowerUp);
  activePowerUpRef.current = activePowerUp;

  const comboRef = useRef<number>(combo);
  comboRef.current = combo;

  const applesEatenCountRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);
  const gameLoopRafRef = useRef<number | null>(null);

  // Helper to check tile occupancy
  const isTileOccupied = useCallback((x: number, y: number, checkSnake = true): boolean => {
    if (checkSnake && snakeRef.current.some((segment) => segment.x === x && segment.y === y)) {
      return true;
    }
    if (obstaclesRef.current.some((obs) => obs.x === x && obs.y === y)) {
      return true;
    }
    if (foodItemsRef.current.some((item) => item.x === x && item.y === y)) {
      return true;
    }
    return false;
  }, []);

  // Spawn food at random unoccupied tile
  const spawnFood = useCallback((type: FoodType = 'APPLE'): FoodItem | null => {
    let attempts = 0;
    while (attempts < 200) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (!isTileOccupied(x, y)) {
        let points = 10;
        let expiresAt: number | undefined;
        let durationMs: number | undefined;
        let powerUpEffect: FoodItem['powerUpEffect'];

        if (type === 'GOLDEN_STAR') {
          points = 50;
          durationMs = 8000;
          expiresAt = Date.now() + durationMs;
        } else if (type === 'SPEED_CHILLI') {
          points = 30;
          durationMs = 7000;
          expiresAt = Date.now() + durationMs;
          powerUpEffect = { type: 'SPEED', durationSeconds: 6 };
        } else if (type === 'FROST_BERRY') {
          points = 25;
          durationMs = 7000;
          expiresAt = Date.now() + durationMs;
          powerUpEffect = { type: 'SLOW', durationSeconds: 6 };
        } else if (type === 'GHOST_ORB') {
          points = 40;
          durationMs = 6500;
          expiresAt = Date.now() + durationMs;
          powerUpEffect = { type: 'GHOST', durationSeconds: 6 };
        }

        return {
          id: Math.random().toString(36).substring(2, 9),
          x,
          y,
          type,
          points,
          expiresAt,
          durationMs,
          powerUpEffect,
        };
      }
      attempts++;
    }
    return null;
  }, [isTileOccupied]);

  // Burst particle helper
  const addParticles = useCallback((gridX: number, gridY: number, color: string, count = 16) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 1.2 + Math.random() * 2.8;
      newParticles.push({
        x: gridX + 0.5,
        y: gridY + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color,
        alpha: 1,
        life: 1,
        decay: 0.025 + Math.random() * 0.02,
      });
    }
    setParticles((prev) => [...prev.slice(-40), ...newParticles]);
  }, []);

  // Floating popup helper
  const addScorePopup = useCallback((gridX: number, gridY: number, text: string, color: string) => {
    const popup: ScorePopup = {
      id: Math.random().toString(36).substring(2, 8),
      x: gridX + 0.5,
      y: gridY + 0.5,
      text,
      color,
      createdAt: Date.now(),
      durationMs: 750,
    };
    setScorePopups((prev) => [...prev.slice(-6), popup]);
  }, []);

  // Change direction with queue
  const changeDirection = useCallback((newDir: Direction) => {
    if (gameStatusRef.current === 'PAUSED' || gameStatusRef.current === 'GAME_OVER') {
      return;
    }
    // If game is ready, start on first input
    if (gameStatusRef.current === 'READY') {
      setGameStatus('PLAYING');
      startTimeRef.current = Date.now();
    }

    const queue = inputQueueRef.current;
    const lastPendingDir = queue.length > 0 ? queue[queue.length - 1] : currentDirRef.current;

    // Prevent 180 degree instant reversal
    if (newDir !== lastPendingDir && newDir !== OPPOSITE_DIRECTIONS[lastPendingDir]) {
      if (queue.length < 2) {
        queue.push(newDir);
        triggerHaptic('tap');
        sound.playTurn();
      }
    }
  }, []);

  // Start / Restart game
  const resetGame = useCallback(() => {
    const initialSnake = createInitialSnake();
    const newObstacles = generateObstacles(mode);
    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setObstacles(newObstacles);
    obstaclesRef.current = newObstacles;

    currentDirRef.current = 'RIGHT';
    setDirection('RIGHT');
    inputQueueRef.current = [];

    // Spawn 1 standard apple
    const initialApple: FoodItem = {
      id: 'init_apple',
      x: 14,
      y: 10,
      type: 'APPLE',
      points: 10,
    };
    setFoodItems([initialApple]);
    foodItemsRef.current = [initialApple];

    setScore(0);
    setCombo(1);
    setComboExpiry(0);
    setActivePowerUp(null);
    setSurvivalTime(0);
    setParticles([]);
    setScorePopups([]);
    applesEatenCountRef.current = 0;
    startTimeRef.current = 0;
    lastTickTimeRef.current = 0;
    setGameStatus('READY');
  }, [mode]);

  const startGame = useCallback(() => {
    if (gameStatusRef.current === 'READY') {
      setGameStatus('PLAYING');
      startTimeRef.current = Date.now();
    }
  }, []);

  const pauseGame = useCallback(() => {
    if (gameStatusRef.current === 'PLAYING') {
      setGameStatus('PAUSED');
    }
  }, []);

  const resumeGame = useCallback(() => {
    if (gameStatusRef.current === 'PAUSED') {
      setGameStatus('PLAYING');
      lastTickTimeRef.current = performance.now();
    }
  }, []);

  const togglePause = useCallback(() => {
    if (gameStatusRef.current === 'PLAYING') {
      pauseGame();
    } else if (gameStatusRef.current === 'PAUSED') {
      resumeGame();
    }
  }, [pauseGame, resumeGame]);

  // Handle Game Over
  const triggerGameOver = useCallback(() => {
    setGameStatus('GAME_OVER');
    sound.playDie();
    triggerHaptic('collision');

    const finalLength = snakeRef.current.length;
    const elapsedSecs = startTimeRef.current > 0 ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    const currentScore = score;

    const updatedStats = recordGameRun(currentScore, mode, finalLength, elapsedSecs);
    setHighScore(updatedStats.highScore);

    if (currentScore > highScore && currentScore > 0) {
      sound.playHighScore();
    }
  }, [score, mode, highScore]);

  // Main game tick step
  const tick = useCallback(() => {
    // Process next direction from input queue
    if (inputQueueRef.current.length > 0) {
      const nextDir = inputQueueRef.current.shift()!;
      if (nextDir !== OPPOSITE_DIRECTIONS[currentDirRef.current]) {
        currentDirRef.current = nextDir;
        setDirection(nextDir);
      }
    }

    const currentHead = snakeRef.current[0];
    let newHeadX = currentHead.x;
    let newHeadY = currentHead.y;

    switch (currentDirRef.current) {
      case 'UP':
        newHeadY -= 1;
        break;
      case 'DOWN':
        newHeadY += 1;
        break;
      case 'LEFT':
        newHeadX -= 1;
        break;
      case 'RIGHT':
        newHeadX += 1;
        break;
    }

    const isGhostActive = activePowerUpRef.current?.type === 'GHOST';

    // Wall collision handling
    if (mode === 'WRAP') {
      if (newHeadX < 0) newHeadX = GRID_SIZE - 1;
      else if (newHeadX >= GRID_SIZE) newHeadX = 0;
      if (newHeadY < 0) newHeadY = GRID_SIZE - 1;
      else if (newHeadY >= GRID_SIZE) newHeadY = 0;
    } else {
      if (newHeadX < 0 || newHeadX >= GRID_SIZE || newHeadY < 0 || newHeadY >= GRID_SIZE) {
        if (!isGhostActive) {
          triggerGameOver();
          return;
        } else {
          // In ghost mode in classic, wrap around harmlessly
          if (newHeadX < 0) newHeadX = GRID_SIZE - 1;
          else if (newHeadX >= GRID_SIZE) newHeadX = 0;
          if (newHeadY < 0) newHeadY = GRID_SIZE - 1;
          else if (newHeadY >= GRID_SIZE) newHeadY = 0;
        }
      }
    }

    // Obstacle collision
    if (obstaclesRef.current.some((obs) => obs.x === newHeadX && obs.y === newHeadY)) {
      if (!isGhostActive) {
        triggerGameOver();
        return;
      }
    }

    // Self collision (ignore tail end since it moves forward unless food is eaten)
    const bodyToCheck = snakeRef.current.slice(0, -1);
    if (bodyToCheck.some((seg) => seg.x === newHeadX && seg.y === newHeadY)) {
      if (!isGhostActive) {
        triggerGameOver();
        return;
      }
    }

    const newHead: Coordinate = { x: newHeadX, y: newHeadY };
    let ateFood: FoodItem | null = null;
    const remainingFoods: FoodItem[] = [];

    // Check if new head lands on any food
    for (const food of foodItemsRef.current) {
      if (food.x === newHeadX && food.y === newHeadY) {
        ateFood = food;
      } else {
        remainingFoods.push(food);
      }
    }

    if (ateFood) {
      // Calculate combo & score
      const now = Date.now();
      const currentCombo = now < comboExpiry ? Math.min(comboRef.current + 1, 5) : 1;
      setCombo(currentCombo);
      setComboExpiry(now + 4200);

      const speedMultiplier = activePowerUpRef.current?.type === 'SPEED' ? 2 : 1;
      const pointsEarned = ateFood.points * currentCombo * speedMultiplier;
      setScore((s) => s + pointsEarned);

      // Play audio & haptics
      if (ateFood.type === 'APPLE') {
        sound.playEat();
        triggerHaptic('eat');
        addParticles(newHeadX, newHeadY, '#ef4444', 12);
        addScorePopup(newHeadX, newHeadY, `+${pointsEarned}${currentCombo > 1 ? ` (${currentCombo}x)` : ''}`, '#10b981');
      } else {
        sound.playSpecialEat();
        triggerHaptic('powerup');
        const particleColor =
          ateFood.type === 'GOLDEN_STAR' ? '#fbbf24' :
          ateFood.type === 'SPEED_CHILLI' ? '#f97316' :
          ateFood.type === 'FROST_BERRY' ? '#38bdf8' : '#a855f7';
        addParticles(newHeadX, newHeadY, particleColor, 20);
        addScorePopup(newHeadX, newHeadY, `+${pointsEarned} ${ateFood.type.replace('_', ' ')}!`, particleColor);
      }

      // Handle power-up activation
      if (ateFood.powerUpEffect) {
        sound.playPowerUp();
        setActivePowerUp({
          type: ateFood.powerUpEffect.type,
          expiresAt: Date.now() + ateFood.powerUpEffect.durationSeconds * 1000,
          durationSeconds: ateFood.powerUpEffect.durationSeconds,
        });
      }

      applesEatenCountRef.current += 1;

      // Spawn next standard apple if no apple left
      const hasApple = remainingFoods.some((f) => f.type === 'APPLE');
      if (!hasApple) {
        const nextApple = spawnFood('APPLE');
        if (nextApple) remainingFoods.push(nextApple);
      }

      // Occasional bonus fruit spawn based on count or high combo
      if (applesEatenCountRef.current % 4 === 0 && remainingFoods.length < 3) {
        const bonusTypes: FoodType[] = ['GOLDEN_STAR', 'SPEED_CHILLI', 'FROST_BERRY', 'GHOST_ORB'];
        const randomBonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        const bonusItem = spawnFood(randomBonusType);
        if (bonusItem) remainingFoods.push(bonusItem);
      }

      // Grow snake (keep tail)
      const newSnake = [newHead, ...snakeRef.current];
      setSnake(newSnake);
    } else {
      // Move snake forward without growing
      const newSnake = [newHead, ...snakeRef.current.slice(0, -1)];
      setSnake(newSnake);
    }

    // Filter out expired bonus fruits
    const nowTimestamp = Date.now();
    const validFoods = remainingFoods.filter((f) => !f.expiresAt || f.expiresAt > nowTimestamp);
    setFoodItems(validFoods);

    // Update survival time
    if (startTimeRef.current > 0) {
      setSurvivalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  }, [
    mode,
    triggerGameOver,
    comboExpiry,
    spawnFood,
    addParticles,
    addScorePopup,
  ]);

  // Compute dynamic tick interval
  const getTickInterval = useCallback((): number => {
    const base = SPEED_LEVEL_INTERVALS[speedLevel] || DIFFICULTY_BASE_SPEEDS[difficulty] || 95;
    let speed = base;

    // Gentle progressive acceleration as snake grows (if enabled)
    if (progressiveSpeed) {
      const growthSpeedUp = Math.min(Math.floor(snake.length / 5) * 3, 25);
      speed = Math.max(base - growthSpeedUp, 36);
    }

    // Sprint / Turbo boost (Shift key or hold button)
    if (isBoostingRef.current) {
      speed = Math.floor(speed * 0.58);
    }

    if (activePowerUp?.type === 'SPEED') {
      speed = Math.floor(speed * 0.65);
    } else if (activePowerUp?.type === 'SLOW') {
      speed = Math.floor(speed * 1.45);
    }
    return Math.max(speed, 28);
  }, [speedLevel, difficulty, progressiveSpeed, snake.length, activePowerUp]);


  // Game Loop requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      // Check active power-up expiration
      if (activePowerUpRef.current && Date.now() > activePowerUpRef.current.expiresAt) {
        setActivePowerUp(null);
      }

      // Check combo expiration
      if (comboExpiry > 0 && Date.now() > comboExpiry) {
        setCombo(1);
      }

      // Game tick
      if (gameStatusRef.current === 'PLAYING') {
        const interval = getTickInterval();
        if (timestamp - lastTickTimeRef.current >= interval) {
          lastTickTimeRef.current = timestamp;
          tick();
        }
      }

      // Update particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.05,
            y: p.y + p.vy * 0.05,
            alpha: p.alpha - p.decay,
          }))
          .filter((p) => p.alpha > 0.01)
      );

      // Update popups
      setScorePopups((prev) =>
        prev.filter((popup) => Date.now() - popup.createdAt < popup.durationMs)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    gameLoopRafRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [getTickInterval, tick, comboExpiry]);

  // Initialize first game board on mount or mode change
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return {
    snake,
    direction,
    foodItems,
    obstacles,
    gameStatus,
    score,
    highScore,
    combo,
    comboExpiry,
    activePowerUp,
    survivalTime,
    particles,
    scorePopups,
    isBoosting,
    setIsBoosting,
    currentSpeedInterval: getTickInterval(),
    changeDirection,
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    resetGame,
  };
}

