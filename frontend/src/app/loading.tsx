export default function RootLoading() {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh', position: 'relative' }}>
      {/* Sidebar skeleton */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: 240, height: '100dvh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        gap: 8,
        zIndex: 40,
      }}>
        <div className="skeleton" style={{ height: 36, width: 160, borderRadius: 10, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 56, borderRadius: 12, marginBottom: 12 }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 38, borderRadius: 10, opacity: 1 - i * 0.07 }} />
        ))}
      </div>

      {/* Main content skeleton */}
      <div style={{ marginLeft: 240, flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="skeleton" style={{ height: 28, width: 200, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 32, width: 120, borderRadius: 20 }} />
        </div>

        {/* Welcome banner */}
        <div className="skeleton" style={{ height: 140, borderRadius: 20 }} />

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 20 }} />
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
        </div>

        {/* Content row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}
