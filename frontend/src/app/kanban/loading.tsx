function SidebarSkeleton() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: 240, height: '100dvh',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      zIndex: 40,
    }} />
  );
}

export default function KanbanLoading() {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <SidebarSkeleton />
      <div style={{ marginLeft: 240, flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 24, width: 180, borderRadius: 6 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, col) => (
            <div key={col}>
              <div className="skeleton" style={{ height: 40, borderRadius: 12, marginBottom: 12 }} />
              {Array.from({ length: 3 + col }).map((__, i) => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16, marginBottom: 10 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
