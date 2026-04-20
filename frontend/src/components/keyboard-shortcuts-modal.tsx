'use client';

import { useEffect } from 'react';

interface ShortcutEntry {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  emoji: string;
  shortcuts: ShortcutEntry[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Навигация',
    emoji: '🧭',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Открыть Command Palette' },
      { keys: ['?'], description: 'Показать все горячие клавиши' },
      { keys: ['T'], description: 'Прокрутить страницу вверх' },
    ],
  },
  {
    title: 'Задачи',
    emoji: '✅',
    shortcuts: [
      { keys: ['N'], description: 'Новая задача (Quick Add)' },
      { keys: ['Esc'], description: 'Закрыть любое модальное окно' },
    ],
  },
  {
    title: 'Привычки',
    emoji: '🔥',
    shortcuts: [
      { keys: ['H'], description: 'Новая привычка (Quick Add)' },
    ],
  },
  {
    title: 'Прочее',
    emoji: '⚡',
    shortcuts: [
      { keys: ['Esc'], description: 'Закрыть модальное окно / Command Palette' },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 28, height: 26,
      padding: '0 7px',
      background: 'var(--bg-elevated)',
      border: '1.5px solid var(--border-strong)',
      borderBottom: '3px solid var(--border-strong)',
      borderRadius: 7,
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      fontWeight: 700,
      color: 'var(--text-secondary)',
      lineHeight: 1,
      userSelect: 'none',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Горячие клавиши"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 2001,
          width: 'min(640px, 95vw)',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'var(--bg-elevated)',
          border: '1.5px solid var(--border)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-lg), 0 0 60px rgba(99,102,241,0.12)',
          animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          padding: '28px 28px 24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>
              ⌨️
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Горячие клавиши
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Быстрый доступ ко всем функциям</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: '6px 8px',
              borderRadius: 8, lineHeight: 1,
              transition: 'background 0.15s',
              fontSize: '1.1rem',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
          >
            ✕
          </button>
        </div>

        {/* Shortcut groups */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <span style={{ fontSize: '1rem' }}>{group.emoji}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{group.title}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {group.shortcuts.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{s.description}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {s.keys.map((k, ki) => (
                        <span key={ki} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          {ki > 0 && <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>+</span>}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          Нажмите <Kbd>Esc</Kbd> или кликните снаружи, чтобы закрыть
        </p>
      </div>
    </>
  );
}
