'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

type Mode = 'login' | 'register';

export function LoginClient() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nt-token') : null;
    if (token) router.replace(`/?token=${token}`);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Заполните все поля'); return; }
    setLoading(true);
    setError('');
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const body: Record<string, string> = { email: email.trim(), password };
      if (mode === 'register' && name.trim()) body['name'] = name.trim();

      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        const msg = Array.isArray(data.message) ? (data.message as string[]).join(', ') : (data.message ?? 'Ошибка сервера');
        throw new Error(msg);
      }

      const { accessToken } = (await res.json()) as { accessToken: string };
      localStorage.setItem('nt-token', accessToken);
      router.push(`/?token=${accessToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    borderRadius: 12, border: '1.5px solid var(--border-strong)',
    background: 'var(--bg-base)', color: 'var(--text-primary)',
    fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 20,
      position: 'relative',
    }}>
      {/* Ambient blobs */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
      </div>

      <div className="card animate-scale-in" style={{
        width: '100%', maxWidth: 420, padding: '36px 36px 32px',
        position: 'relative', zIndex: 1,
        boxShadow: 'var(--shadow-lg), 0 0 60px rgba(99,102,241,0.12)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>NeuroTrack</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Интеллектуальная система планирования
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-base)', borderRadius: 10, padding: 4, marginBottom: 22, gap: 4 }}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '8px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-tertiary)',
                transition: 'all 0.15s',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {m === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            fontSize: '0.82rem', color: '#ef4444', lineHeight: 1.45,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                style={inputStyle}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus={mode === 'login'}
              style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              required
              style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem', fontWeight: 700, marginTop: 4 }}
          >
            {loading ? (
              <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
            ) : mode === 'login' ? '🚀 Войти' : '✨ Создать аккаунт'}
          </button>
        </form>

        {/* Demo hint */}
        <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(99,102,241,0.06)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            💡 Нет аккаунта?{' '}
            <Link
              href="/"
              style={{ color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600 }}
            >
              Открыть демо-режим
            </Link>
            {' '}— без регистрации
          </p>
        </div>
      </div>
    </div>
  );
}
