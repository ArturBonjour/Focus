'use client';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

interface ConfettiParticle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  rotate: number;
  size: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function generateParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, () => ({
    x: randomBetween(20, 80),
    y: randomBetween(20, 80),
    tx: randomBetween(-60, 60),
    ty: randomBetween(-30, 70),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotate: randomBetween(0, 360),
    size: randomBetween(5, 9),
  }));
}

interface ConfettiBurstProps {
  active: boolean;
  count?: number;
}

/**
 * Mini confetti burst — renders over its parent (position:absolute).
 * Use inside a position:relative container.
 */
export function ConfettiBurst({ active, count = 18 }: ConfettiBurstProps) {
  if (!active) return null;

  // Generate particles deterministically each time active=true (new JSX tree)
  const particles = generateParticles(count);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: 'inherit',
        zIndex: 10,
      }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animationDelay: `${i * 20}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
