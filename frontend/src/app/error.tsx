'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 20,
      position: 'relative',
    }}>
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
      </div>
      <div className="card animate-scale-in" style={{
        padding: '48px 40px',
        textAlign: 'center',
        maxWidth: 400,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16, lineHeight: 1 }}>⚡</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Что-то пошло не так
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
          {error.message || 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'}
        </p>
        <button
          onClick={reset}
          className="btn btn-primary btn-neon"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
