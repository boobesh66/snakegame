import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Coordinate,
  Direction,
  FoodItem,
  ActivePowerUp,
  Particle,
  ScorePopup,
  ThemeConfig,
  GameStatus,
} from '../types/game';
import { GRID_SIZE } from '../hooks/useSnakeGame';

interface SnakeCanvasProps {
  snake: Coordinate[];
  direction: Direction;
  foodItems: FoodItem[];
  obstacles: Coordinate[];
  activePowerUp: ActivePowerUp | null;
  particles: Particle[];
  scorePopups: ScorePopup[];
  theme: ThemeConfig;
  gameStatus: GameStatus;
  onDirectionChange: (dir: Direction) => void;
  onStartOrResume: () => void;
  swipeSensitivity?: number;
}

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
  snake,
  direction,
  foodItems,
  obstacles,
  activePowerUp,
  particles,
  scorePopups,
  theme,
  gameStatus,
  onDirectionChange,
  onStartOrResume,
  swipeSensitivity = 22,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [swipeIndicator, setSwipeIndicator] = useState<{
    dir: Direction;
    x: number;
    y: number;
  } | null>(null);

  // Touch gesture tracker
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    if (gameStatus === 'READY' || gameStatus === 'PAUSED') {
      onStartOrResume();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist >= swipeSensitivity) {
      let detectedDir: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        detectedDir = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        detectedDir = dy > 0 ? 'DOWN' : 'UP';
      }

      onDirectionChange(detectedDir);

      // Brief visual indicator of swipe
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSwipeIndicator({
          dir: detectedDir,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setTimeout(() => setSwipeIndicator(null), 300);
      }

      // Reset origin to current point so player can continue dragging to chain turns!
      touchStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };
    }
  };

  const handlePointerUp = () => {
    touchStartRef.current = null;
  };

  // Render loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / GRID_SIZE;

    // 1. Clear background
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Grid Lines
    ctx.strokeStyle = theme.gridLineColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // 3. Obstacles
    if (obstacles.length > 0) {
      for (const obs of obstacles) {
        const ox = obs.x * cellSize;
        const oy = obs.y * cellSize;
        const padding = cellSize * 0.08;

        ctx.fillStyle = theme.obstacleColor;
        ctx.beginPath();
        ctx.roundRect(
          ox + padding,
          oy + padding,
          cellSize - padding * 2,
          cellSize - padding * 2,
          cellSize * 0.18
        );
        ctx.fill();

        // Inner highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Subtle cross-hatch or center core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(ox + cellSize * 0.35, oy + cellSize * 0.35, cellSize * 0.3, cellSize * 0.3);
      }
    }

    // 4. Food Items
    const now = Date.now();
    for (const food of foodItems) {
      const fx = food.x * cellSize + cellSize / 2;
      const fy = food.y * cellSize + cellSize / 2;
      const radius = (cellSize / 2) * 0.72;

      ctx.save();
      ctx.translate(fx, fy);

      // Pulse animation
      const pulse = Math.sin(now * 0.006) * 0.08 + 1;
      ctx.scale(pulse, pulse);

      if (food.type === 'APPLE') {
        // Red delicious apple
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Apple leaf & stem
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(radius * 0.2, -radius * 0.9, radius * 0.3, radius * 0.15, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Apple highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (food.type === 'GOLDEN_STAR') {
        // Golden bonus starfruit
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#fbbf24';

        // 5-point star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const sx = Math.cos(outerAngle) * radius * 1.1;
          const sy = Math.sin(outerAngle) * radius * 1.1;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();

        // Time countdown ring
        if (food.expiresAt && food.durationMs) {
          const timeLeft = Math.max(0, food.expiresAt - now);
          const ratio = timeLeft / food.durationMs;
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 1.35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
          ctx.stroke();
        }
      } else if (food.type === 'SPEED_CHILLI') {
        // Spicy Chilli pepper
        ctx.shadowColor = 'rgba(249, 115, 22, 0.7)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.95, radius * 0.6, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Flame top
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.5, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Countdown ring
        if (food.expiresAt && food.durationMs) {
          const timeLeft = Math.max(0, food.expiresAt - now);
          const ratio = timeLeft / food.durationMs;
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#fdba74';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 1.35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
          ctx.stroke();
        }
      } else if (food.type === 'FROST_BERRY') {
        // Frost Berry (Slow-mo)
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Ice diamond center
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.6);
        ctx.lineTo(radius * 0.6, 0);
        ctx.lineTo(0, radius * 0.6);
        ctx.lineTo(-radius * 0.6, 0);
        ctx.closePath();
        ctx.fill();

        if (food.expiresAt && food.durationMs) {
          const timeLeft = Math.max(0, food.expiresAt - now);
          const ratio = timeLeft / food.durationMs;
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 1.35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
          ctx.stroke();
        }
      } else if (food.type === 'GHOST_ORB') {
        // Ethereal Ghost Orb
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f3e8ff';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        if (food.expiresAt && food.durationMs) {
          const timeLeft = Math.max(0, food.expiresAt - now);
          const ratio = timeLeft / food.durationMs;
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#d8b4fe';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 1.35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // 5. Snake Body & Tail
    const isGhost = activePowerUp?.type === 'GHOST';
    const isSpeed = activePowerUp?.type === 'SPEED';
    const isSlow = activePowerUp?.type === 'SLOW';

    ctx.save();
    if (isGhost) {
      ctx.globalAlpha = 0.55;
    }

    // Snake body drawn from tail to head
    const bodyPadding = cellSize * 0.08;
    const bodyRadius = cellSize * 0.35;

    for (let i = snake.length - 1; i >= 1; i--) {
      const seg = snake[i];
      const sx = seg.x * cellSize + bodyPadding;
      const sy = seg.y * cellSize + bodyPadding;
      const sw = cellSize - bodyPadding * 2;
      const sh = cellSize - bodyPadding * 2;

      // Color interpolation from head to tail
      const progress = i / snake.length;
      ctx.fillStyle = isSpeed
        ? '#f97316'
        : isSlow
        ? '#38bdf8'
        : progress > 0.5
        ? theme.snakeBodyEnd
        : theme.snakeBodyStart;

      if (theme.snakeGlowColor !== 'transparent') {
        ctx.shadowColor = theme.snakeGlowColor;
        ctx.shadowBlur = 8;
      }

      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, bodyRadius);
      ctx.fill();

      // Connector to next segment to form a continuous smooth serpent body
      const nextSeg = snake[i - 1];
      const dx = nextSeg.x - seg.x;
      const dy = nextSeg.y - seg.y;

      // Only draw connector if segments are adjacent (not wrapping)
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
        ctx.beginPath();
        const cx = (seg.x + nextSeg.x) * cellSize * 0.5 + bodyPadding;
        const cy = (seg.y + nextSeg.y) * cellSize * 0.5 + bodyPadding;
        ctx.roundRect(cx, cy, sw, sh, bodyRadius * 0.8);
        ctx.fill();
      }
    }

    // 6. Snake Head
    if (snake.length > 0) {
      const head = snake[0];
      const hx = head.x * cellSize + bodyPadding;
      const hy = head.y * cellSize + bodyPadding;
      const hw = cellSize - bodyPadding * 2;
      const hh = cellSize - bodyPadding * 2;

      ctx.fillStyle = isSpeed ? '#fb923c' : isSlow ? '#7dd3fc' : theme.snakeHeadColor;
      if (theme.snakeGlowColor !== 'transparent') {
        ctx.shadowColor = theme.snakeGlowColor;
        ctx.shadowBlur = 12;
      }

      ctx.beginPath();
      ctx.roundRect(hx, hy, hw, hh, cellSize * 0.4);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Cute Eyes facing current direction
      const headCenterX = head.x * cellSize + cellSize / 2;
      const headCenterY = head.y * cellSize + cellSize / 2;
      const eyeOffset = cellSize * 0.22;
      const eyeRadius = cellSize * 0.12;
      const pupilRadius = cellSize * 0.06;

      let eye1X = headCenterX;
      let eye1Y = headCenterY;
      let eye2X = headCenterX;
      let eye2Y = headCenterY;
      let pupilDx = 0;
      let pupilDy = 0;

      switch (direction) {
        case 'UP':
          eye1X = headCenterX - eyeOffset;
          eye1Y = headCenterY - eyeOffset * 0.4;
          eye2X = headCenterX + eyeOffset;
          eye2Y = headCenterY - eyeOffset * 0.4;
          pupilDy = -eyeRadius * 0.4;
          break;
        case 'DOWN':
          eye1X = headCenterX - eyeOffset;
          eye1Y = headCenterY + eyeOffset * 0.4;
          eye2X = headCenterX + eyeOffset;
          eye2Y = headCenterY + eyeOffset * 0.4;
          pupilDy = eyeRadius * 0.4;
          break;
        case 'LEFT':
          eye1X = headCenterX - eyeOffset * 0.4;
          eye1Y = headCenterY - eyeOffset;
          eye2X = headCenterX - eyeOffset * 0.4;
          eye2Y = headCenterY + eyeOffset;
          pupilDx = -eyeRadius * 0.4;
          break;
        case 'RIGHT':
          eye1X = headCenterX + eyeOffset * 0.4;
          eye1Y = headCenterY - eyeOffset;
          eye2X = headCenterX + eyeOffset * 0.4;
          eye2Y = headCenterY + eyeOffset;
          pupilDx = eyeRadius * 0.4;
          break;
      }

      // Eye whites
      ctx.fillStyle = theme.eyeColor;
      ctx.beginPath();
      ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
      ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Eye pupils
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(eye1X + pupilDx, eye1Y + pupilDy, pupilRadius, 0, Math.PI * 2);
      ctx.arc(eye2X + pupilDx, eye2Y + pupilDy, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Cute playful tongue flick (toggles every 500ms when playing)
      if (gameStatus === 'PLAYING' && Math.floor(now / 350) % 2 === 0) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const tongueLen = cellSize * 0.35;
        let tx = headCenterX;
        let ty = headCenterY;
        let fork1X = tx;
        let fork1Y = ty;
        let fork2X = tx;
        let fork2Y = ty;

        if (direction === 'UP') {
          ty -= cellSize * 0.45;
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx, ty - tongueLen);
          fork1X = tx - cellSize * 0.1;
          fork1Y = ty - tongueLen - cellSize * 0.1;
          fork2X = tx + cellSize * 0.1;
          fork2Y = ty - tongueLen - cellSize * 0.1;
          ctx.moveTo(tx, ty - tongueLen);
          ctx.lineTo(fork1X, fork1Y);
          ctx.moveTo(tx, ty - tongueLen);
          ctx.lineTo(fork2X, fork2Y);
        } else if (direction === 'DOWN') {
          ty += cellSize * 0.45;
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx, ty + tongueLen);
          fork1X = tx - cellSize * 0.1;
          fork1Y = ty + tongueLen + cellSize * 0.1;
          fork2X = tx + cellSize * 0.1;
          fork2Y = ty + tongueLen + cellSize * 0.1;
          ctx.moveTo(tx, ty + tongueLen);
          ctx.lineTo(fork1X, fork1Y);
          ctx.moveTo(tx, ty + tongueLen);
          ctx.lineTo(fork2X, fork2Y);
        } else if (direction === 'LEFT') {
          tx -= cellSize * 0.45;
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - tongueLen, ty);
          fork1X = tx - tongueLen - cellSize * 0.1;
          fork1Y = ty - cellSize * 0.1;
          fork2X = tx - tongueLen - cellSize * 0.1;
          fork2Y = ty + cellSize * 0.1;
          ctx.moveTo(tx - tongueLen, ty);
          ctx.lineTo(fork1X, fork1Y);
          ctx.moveTo(tx - tongueLen, ty);
          ctx.lineTo(fork2X, fork2Y);
        } else if (direction === 'RIGHT') {
          tx += cellSize * 0.45;
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + tongueLen, ty);
          fork1X = tx + tongueLen + cellSize * 0.1;
          fork1Y = ty - cellSize * 0.1;
          fork2X = tx + tongueLen + cellSize * 0.1;
          fork2Y = ty + cellSize * 0.1;
          ctx.moveTo(tx + tongueLen, ty);
          ctx.lineTo(fork1X, fork1Y);
          ctx.moveTo(tx + tongueLen, ty);
          ctx.lineTo(fork2X, fork2Y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();

    // 7. Render Particles
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x * cellSize, p.y * cellSize, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 8. Render Floating Score Popups
    for (const pop of scorePopups) {
      const elapsed = now - pop.createdAt;
      const progress = elapsed / pop.durationMs;
      const alpha = Math.max(0, 1 - progress);
      const floatY = (pop.y * cellSize) - progress * cellSize * 1.5;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 15px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = pop.color;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(pop.text, pop.x * cellSize, floatY);
      ctx.restore();
    }
  }, [
    snake,
    direction,
    foodItems,
    obstacles,
    activePowerUp,
    particles,
    scorePopups,
    theme,
    gameStatus,
  ]);

  // Handle Resize and High DPI canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const size = Math.floor(Math.min(rect.width, rect.height));
      const dpr = window.devicePixelRatio || 1;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // Trigger draw on updates
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex items-center justify-center w-full max-w-[540px] aspect-square rounded-2xl overflow-hidden shadow-2xl border game-touch-zone select-none cursor-crosshair transition-all duration-300"
      style={{
        borderColor: theme.arenaBorderColor,
        boxShadow: `0 0 25px ${theme.snakeGlowColor}`,
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Swipe Feedback Ripple */}
      {swipeIndicator && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-emerald-400 bg-emerald-400/20 animate-ping"
          style={{ left: swipeIndicator.x, top: swipeIndicator.y }}
        />
      )}

      {/* Overlays */}
      {gameStatus === 'READY' && (
        <div
          onClick={onStartOrResume}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-opacity"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
            <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-white tracking-wide mb-1">TAP OR SWIPE TO START</p>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Use swipe gestures, on-screen controls, or Arrow / WASD keys on desktop.
          </p>
        </div>
      )}

      {gameStatus === 'PAUSED' && (
        <div
          onClick={onStartOrResume}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white tracking-wide mb-1">GAME PAUSED</p>
          <p className="text-xs text-slate-400">Tap screen or press Space / P to resume</p>
        </div>
      )}
    </div>
  );
};
