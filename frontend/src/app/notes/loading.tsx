export default function NotesLoading() {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: 240, height: '100dvh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        zIndex: 40,
      }} />
      <div style={{ marginLeft: 240, flex: 1, padding: '28px 32px' }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: 28, width: 180, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 36, width: 130, borderRadius: 10 }} />
        </div>
        <div className="skeleton" style={{ height: 44, borderRadius: 12, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
