export default function SettingsLoading() {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: 240, height: '100dvh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        zIndex: 40,
      }} />
      <div style={{ marginLeft: 240, flex: 1, padding: '28px 32px', maxWidth: 700 }}>
        <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 8, marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 16, width: 300, borderRadius: 6, marginBottom: 32 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 160, borderRadius: 20, marginBottom: 16 }} />
        ))}
      </div>
    </div>
  );
}
