'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

interface SettingsClientProps {
  profile: UserProfile | null;
  apiUrl: string;
  token: string;
}

export function SettingsClient({ profile, apiUrl, token }: SettingsClientProps) {
  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    borderRadius: 10, border: '1.5px solid var(--border-strong)',
    background: 'var(--bg-base)', color: 'var(--text-primary)',
    fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Профиль обновлён', 'Изменения сохранены');
    } catch {
      toast.error('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  }

  async function handleExport(format: 'json' | 'csv') {
    try {
      const res = await fetch(`${apiUrl}/tasks/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Экспорт завершён (${format.toUpperCase()})`);
    } catch {
      toast.error('Не удалось экспортировать данные');
    }
  }

  const initials = (profile?.name ?? profile?.email ?? '?')
    .split(/[\s@_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          ⚙️ Настройки
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
          Управление аккаунтом, данными и экспортом
        </p>
      </div>

      {/* Profile card */}
      <section className="card animate-slide-up" style={{ padding: '24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}>
            {initials}
          </div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
              {profile?.name ?? profile?.email?.split('@')[0] ?? 'Пользователь'}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {profile?.email}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              🗓 В системе с {memberSince}
            </p>
          </div>
        </div>

        <h2 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 14 }}>
          Профиль
        </h2>

        <form onSubmit={(e) => { void handleSaveProfile(e); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              maxLength={80}
              style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              Email изменить нельзя — это основной идентификатор аккаунта
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ padding: '9px 22px', fontSize: '0.85rem' }}
            >
              {saving ? (
                <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
              ) : '💾 Сохранить'}
            </button>
          </div>
        </form>
      </section>

      {/* Data export card */}
      <section className="card animate-slide-up" style={{ padding: '24px', marginBottom: 16, animationDelay: '60ms' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 6 }}>
          📦 Экспорт данных
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 18, lineHeight: 1.5 }}>
          Скачайте все ваши задачи в удобном формате для резервной копии или переноса данных.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost"
            onClick={() => { void handleExport('json'); }}
            style={{ gap: 6, fontSize: '0.82rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Скачать JSON
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { void handleExport('csv'); }}
            style={{ gap: 6, fontSize: '0.82rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Скачать CSV
          </button>
        </div>
      </section>

      {/* Keyboard shortcuts card */}
      <section className="card animate-slide-up" style={{ padding: '24px', marginBottom: 16, animationDelay: '120ms' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 14 }}>
          ⌨️ Горячие клавиши
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { keys: ['⌘', 'K'], desc: 'Command Palette — быстрый поиск' },
            { keys: ['N'], desc: 'Создать новую задачу' },
            { keys: ['H'], desc: 'Создать новую привычку' },
            { keys: ['Space'], desc: 'Старт/пауза Focus Timer' },
            { keys: ['Esc'], desc: 'Закрыть модальное окно' },
          ].map(({ keys, desc }) => (
            <div key={desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{desc}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {keys.map((k) => (
                  <kbd key={k} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                    borderRadius: 5, padding: '2px 7px',
                    fontFamily: '-apple-system, monospace', fontSize: '0.72rem', fontWeight: 700,
                    color: 'var(--text-secondary)',
                    boxShadow: '0 1px 0 var(--border-strong)',
                    minWidth: 20, textAlign: 'center',
                  }}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About card */}
      <section className="card animate-slide-up" style={{ padding: '24px', animationDelay: '180ms' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 14 }}>
          ℹ️ О системе
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Версия', value: 'v7.0' },
            { label: 'Frontend', value: 'Next.js 16 · React 19' },
            { label: 'Backend', value: 'NestJS 11 · Prisma 6' },
            { label: 'База данных', value: 'PostgreSQL 16' },
            { label: 'Auth', value: 'JWT + httpOnly cookie' },
            { label: 'Инфра', value: 'Docker Compose' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--border)' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{value}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(99,102,241,0.05)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
            🧠 <strong style={{ color: 'var(--text-secondary)' }}>NeuroTrack</strong> — интеллектуальная система планирования и анализа продуктивности.
            Gamification, AI-инсайты, Focus Timer, тепловые карты и полная аналитика в одном месте.
          </p>
        </div>
      </section>
    </div>
  );
}
