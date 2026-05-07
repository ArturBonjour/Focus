export default function AnalyticsLoading() {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: 240, height: '100dvh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        zIndex: 40,
      }} />
      <div style={{ marginLeft: 240, flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <div>
            <div className="skeleton" style={{ height: 24, width: 160, borderRadius: 6, marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 14, width: 240, borderRadius: 6 }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 20 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
        </div>
        <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
      </div>
    </div>
  );
}
