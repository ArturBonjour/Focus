export default function FocusLoading() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      gap: 24, padding: 24,
    }}>
      <div className="skeleton" style={{ width: 220, height: 220, borderRadius: '50%' }} />
      <div className="skeleton" style={{ height: 24, width: 140, borderRadius: 8 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="skeleton" style={{ width: 100, height: 40, borderRadius: 12 }} />
        <div className="skeleton" style={{ width: 100, height: 40, borderRadius: 12 }} />
        <div className="skeleton" style={{ width: 100, height: 40, borderRadius: 12 }} />
      </div>
    </div>
  );
}
