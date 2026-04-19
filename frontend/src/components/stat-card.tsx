interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  accent?: string;
  delay?: number;
}

export function StatCard({ label, value, subtitle, icon, accent = '#6366f1', delay = 0 }: StatCardProps) {
  return (
    <div
      className="card animate-slide-up"
      style={{
        padding: '20px 22px',
        animationDelay: `${delay}ms`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: accent,
        opacity: 0.08,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </p>
          <p style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginTop: 4 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          width: 42, height: 42,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${accent}22, ${accent}11)`,
          border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
