'use client';

import { useEffect, useRef, useState } from 'react';
import type { Task, Habit } from '@/lib/api';

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
}

// ── Inner component mounts fresh every time palette opens ─────────
interface PaletteInnerProps {
  tasks: Task[];
  habits: Habit[];
  onClose: () => void;
}

function PaletteInner({ tasks, habits, onClose }: PaletteInnerProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount (side-effect only, no setState)
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, []);

  // Reset selection when query changes — use event handler instead of effect
  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setSelectedIndex(0);
  }

  const staticCommands: Command[] = [
    {
      id: 'goto-focus',
      title: 'Focus Timer',
      subtitle: 'Запустить Pomodoro таймер',
      icon: '⏱',
      action: () => {
        document.getElementById('focus-timer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onClose();
      },
    },
    {
      id: 'goto-heatmap',
      title: 'История активности',
      subtitle: 'Посмотреть heatmap привычек',
      icon: '📊',
      action: () => {
        document.getElementById('heatmap-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onClose();
      },
    },
    {
      id: 'goto-ai',
      title: 'AI-инсайты',
      subtitle: 'Посмотреть рекомендации',
      icon: '🧠',
      action: () => {
        document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onClose();
      },
    },
    {
      id: 'toggle-theme',
      title: 'Переключить тему',
      subtitle: 'Тёмная / светлая',
      icon: '🌗',
      action: () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('nt-theme', next);
        onClose();
      },
    },
  ];

  const taskCommands: Command[] = tasks
    .filter((t) => !query || t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: `Задача · ${t.status === 'DONE' ? 'Готово' : t.status === 'IN_PROGRESS' ? 'В процессе' : 'Запланировано'}`,
      icon: t.status === 'DONE' ? '✅' : t.status === 'IN_PROGRESS' ? '⚡' : '🔲',
      action: onClose,
    }));

  const habitCommands: Command[] = habits
    .filter((h) => !query || h.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map((h) => ({
      id: `habit-${h.id}`,
      title: h.name,
      subtitle: `Привычка · Серия: ${h.streak} дней`,
      icon: '🔥',
      action: onClose,
    }));

  const filteredStatic = staticCommands.filter(
    (c) =>
      !query ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      (c.subtitle ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  const allCommands = [
    ...(query ? taskCommands : []),
    ...(query ? habitCommands : []),
    ...filteredStatic,
  ];

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      allCommands[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  return (
    <>
      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          placeholder="Поиск команд, задач, привычек..."
          style={{
            flex: 1, border: 'none', background: 'transparent',
            color: 'var(--text-primary)', fontSize: '0.95rem',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        <kbd style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', background: 'var(--border)', borderRadius: 6, padding: '2px 6px', fontFamily: 'monospace' }}>Esc</kbd>
      </div>

      {/* Commands list */}
      <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px' }}>
        {allCommands.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            Ничего не найдено
          </div>
        ) : (
          allCommands.map((cmd, idx) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: 'none',
                background: idx === selectedIndex ? 'rgba(99,102,241,0.10)' : 'transparent',
                cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.1s var(--ease)',
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{cmd.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {cmd.title}
                </p>
                {cmd.subtitle && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 1, lineHeight: 1.3 }}>
                    {cmd.subtitle}
                  </p>
                )}
              </div>
              {idx === selectedIndex && (
                <kbd style={{ fontSize: '0.68rem', color: 'var(--accent-1)', background: 'rgba(99,102,241,0.10)', borderRadius: 5, padding: '2px 6px', fontFamily: 'monospace', flexShrink: 0 }}>
                  Enter
                </kbd>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 18px', display: 'flex', gap: 14, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
        <span><kbd style={{ fontFamily: 'monospace', background: 'var(--border)', borderRadius: 4, padding: '1px 4px' }}>↑↓</kbd> навигация</span>
        <span><kbd style={{ fontFamily: 'monospace', background: 'var(--border)', borderRadius: 4, padding: '1px 4px' }}>Enter</kbd> выбрать</span>
        <span><kbd style={{ fontFamily: 'monospace', background: 'var(--border)', borderRadius: 4, padding: '1px 4px' }}>Esc</kbd> закрыть</span>
      </div>
    </>
  );
}

// ── Shell component with global shortcut listener ─────────────────
interface CommandPaletteProps {
  tasks: Task[];
  habits: Habit[];
}

export function CommandPalette({ tasks, habits }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          animation: 'fade-in 0.15s var(--ease) both',
        }}
      />

      {/* Palette — key forces remount each open so state is fresh */}
      <div
        style={{
          position: 'fixed',
          top: '20%', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          width: '90%', maxWidth: 560,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 18,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'scale-in 0.18s var(--ease-spring) both',
        }}
      >
        <PaletteInner
          key={String(open)}
          tasks={tasks}
          habits={habits}
          onClose={() => setOpen(false)}
        />
      </div>
    </>
  );
}
