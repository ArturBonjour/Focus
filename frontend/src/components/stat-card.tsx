import { Sparkline } from './sparkline';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  accent?: string;
  delay?: number;
  sparkline?: number[];
  trend?: { value: number; label?: string };
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  accent = '#6366f1',
  delay = 0,
  sparkline,
  trend,
}: StatCardProps) {
  const trendPositive = trend && trend.value >= 0;

  return (
    <div
      className="card animate-slide-up"
      style={{
        padding: '18px 20px',
        animationDelay: `${delay}ms`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow orb */}
      <div
        style={{
          position: 'absolute',
          top: -24,
          right: -24,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: accent,
          opacity: 0.08,
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 4,
        }}
      >
        <p
          style={{
            fontSize: '0.73rem',
            color: 'var(--text-tertiary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            flex: 1,
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${accent}22, ${accent}11)`,
            border: `1px solid ${accent}28`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.05rem',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <p
        style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}
      >
        {value}
      </p>

      {/* Subtitle + trend row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div>
          {subtitle && (
            <p
              style={{
                fontSize: '0.73rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              style={{
                fontSize: '0.7rem',
                color: trendPositive ? '#10b981' : '#ef4444',
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {trendPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              {trend.label && (
                <span
                  style={{
                    color: 'var(--text-tertiary)',
                    fontWeight: 400,
                    marginLeft: 3,
                  }}
                >
                  {trend.label}
                </span>
              )}
            </p>
          )}
        </div>

        {sparkline && sparkline.length >= 2 && (
          <Sparkline data={sparkline} color={accent} width={64} height={26} />
        )}
      </div>
    </div>
  );
}
