'use client';

import { useCallback, useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// ── Singleton event bus ───────────────────────────────────────────
type Listener = (toast: ToastMessage) => void;
const listeners: Set<Listener> = new Set();

function emit(t: ToastMessage) {
  listeners.forEach((l) => l(t));
}

let idCounter = 0;

export const toast = {
  success: (title: string, message?: string) =>
    emit({ id: String(++idCounter), type: 'success', title, message }),
  error: (title: string, message?: string) =>
    emit({ id: String(++idCounter), type: 'error', title, message }),
  info: (title: string, message?: string) =>
    emit({ id: String(++idCounter), type: 'info', title, message }),
  warning: (title: string, message?: string) =>
    emit({ id: String(++idCounter), type: 'warning', title, message }),
};

// ── Toast item ────────────────────────────────────────────────────
const icons: Record<ToastType, string> = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
};

const accentColors: Record<ToastType, string> = {
  success: '#10b981',
  error:   '#ef4444',
  info:    '#6366f1',
  warning: '#f59e0b',
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(t.id), 300);
    }, 4000);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick() {
    setVisible(false);
    setTimeout(() => onDismiss(t.id), 300);
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 14,
        background: 'var(--bg-elevated)',
        border: `1px solid ${accentColors[t.type]}33`,
        boxShadow: 'var(--shadow-lg)',
        minWidth: 280,
        maxWidth: 360,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
        transition: 'opacity 0.25s var(--ease), transform 0.25s var(--ease)',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={handleClick}
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{icons[t.type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {t.title}
        </p>
        {t.message && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
            {t.message}
          </p>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: accentColors[t.type], animation: 'toast-progress 4s linear forwards' }} />
      </div>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────
export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    function handler(t: ToastMessage) {
      setToasts((prev) => [...prev.slice(-4), t]);
    }
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
