'use client';

import { useEffect, useRef, useState } from 'react';

interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  deadline?: string | null;
}

interface NotificationBellProps {
  tasks: Task[];
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#6b7280',
};

export function NotificationBell({ tasks }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('nt-dismissed-notifications');
      return stored ? new Set<string>(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  const ref = useRef<HTMLDivElement>(null);

  const now = new Date();
  const notifications = tasks
    .filter((t) => {
      if (t.status === 'DONE') return false;
      if (!t.deadline) return false;
      if (dismissed.has(t.id)) return false;
      return new Date(t.deadline) < now;
    })
    .slice(0, 10);

  const count = notifications.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem('nt-dismissed-notifications', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  function dismissAll() {
    const ids = notifications.map((n) => n.id);
    setDismissed((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      try { localStorage.setItem('nt-dismissed-notifications', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label={count > 0 ? `${count} просроченных задач` : 'Уведомления'}
        style={{
          position: 'relative',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 6, borderRadius: 8,
          color: count > 0 ? '#ef4444' : 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
      >
        {/* Bell icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          {count > 0 && (
            <circle cx="18" cy="5" r="4" fill="#ef4444" stroke="var(--bg-base)" strokeWidth="1.5" />
          )}
        </svg>
        {count > 0 && (
          <span
            style={{
              position: 'absolute', top: 0, right: 0,
              width: 16, height: 16,
              background: '#ef4444',
              borderRadius: '50%',
              border: '2px solid var(--bg-base)',
              fontSize: '0.6rem', fontWeight: 800, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 8,
            width: 320, maxHeight: 400,
            background: 'var(--bg-card)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🔔 Уведомления
            </p>
            {count > 0 && (
              <button
                onClick={dismissAll}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.7rem', color: 'var(--accent-1)', fontWeight: 600,
                }}
              >
                Отклонить все
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {count === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>✅</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                  Просроченных задач нет
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const overdueDays = Math.ceil((now.getTime() - new Date(n.deadline!).getTime()) / 86_400_000);
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex', gap: 10, padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: 3, height: 36, borderRadius: 2, flexShrink: 0,
                        background: PRIORITY_COLOR[n.priority],
                        marginTop: 2,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {n.title}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: 2 }}>
                        Просрочено на {overdueDays} {overdueDays === 1 ? 'день' : overdueDays <= 4 ? 'дня' : 'дней'}
                      </p>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-tertiary)', padding: 4, lineHeight: 1, flexShrink: 0,
                      }}
                      aria-label="Отклонить"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
