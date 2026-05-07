import Link from 'next/link';

export default function NotFound() {
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
        <div
          className="gradient-text"
          style={{ fontSize: '5rem', fontWeight: 800, lineHeight: 1, marginBottom: 16, display: 'block' }}
        >
          404
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Страница не найдена
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Link
          href="/"
          className="btn btn-primary btn-neon"
          style={{ textDecoration: 'none', display: 'inline-flex' }}
        >
          ← На главную
        </Link>
      </div>
    </div>
  );
}
