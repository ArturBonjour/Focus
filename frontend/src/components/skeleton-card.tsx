/**
 * Reusable skeleton loading card using glass-card styling and animate-pulse.
 * Use for placeholder states while async content loads.
 */

interface SkeletonCardProps {
  /** Number of skeleton rows to render inside the card */
  rows?: number;
  /** Height of each row in px */
  rowHeight?: number;
  /** Overall card height. When set, rows are ignored. */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

function SkeletonLine({ width, height = 14 }: { width?: string; height?: number }) {
  return (
    <div
      className="skeleton"
      style={{
        height,
        width: width ?? '100%',
        borderRadius: 8,
      }}
    />
  );
}

export function SkeletonCard({ rows = 3, rowHeight = 14, height, className, style }: SkeletonCardProps) {
  if (height !== undefined) {
    return (
      <div
        className={`card skeleton ${className ?? ''}`}
        role="status"
        aria-busy="true"
        aria-label="Loading…"
        style={{ height, ...style }}
      />
    );
  }

  return (
    <div
      className={`card ${className ?? ''}`}
      role="status"
      aria-busy="true"
      aria-label="Loading…"
      style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, ...style }}
    >
      {/* Title placeholder */}
      <SkeletonLine width="45%" height={18} />

      {/* Row placeholders */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === rows - 1 ? '70%' : '100%'}
          height={rowHeight}
        />
      ))}
    </div>
  );
}

/** Compact inline skeleton pulse block */
export function SkeletonInline({ width = 60, height = 14 }: { width?: number; height?: number }) {
  return (
    <div
      className="skeleton"
      role="status"
      aria-label="Loading…"
      style={{ width, height, borderRadius: 6, display: 'inline-block' }}
    />
  );
}
