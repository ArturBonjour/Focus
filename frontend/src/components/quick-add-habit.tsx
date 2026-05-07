'use client';

import { useEffect, useRef, useState } from 'react';
import type { Habit } from '@/lib/api';
import { toast } from './toast';

const EMOJI_OPTIONS = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '✍️', '🎯', '🎸', '🌿', '🧠'];

interface HabitFormProps {
  apiUrl?: string;
  token?: string;
  onCreated?: (habit: Habit) => void;
  onClose: () => void;
}

function HabitForm({ apiUrl, token, onCreated, onClose }: HabitFormProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💪');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const fullName = `${emoji} ${name.trim()}`;

    if (!token || !apiUrl) {
      await new Promise((r) => setTimeout(r, 300));
      const mockHabit: Habit = {
        id: `h-${Date.now()}`,
        name: fullName,
        streak: 0,
        completedDays: [],
      };
      onCreated?.(mockHabit);
      toast.success('Привычка создана', fullName);
      onClose();
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/habits`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fullName }),
      });

      if (!res.ok) throw new Error('Failed to create habit');

      const raw = (await res.json()) as Habit & { data?: Habit };
      const habit: Habit = raw.data ?? raw;
      onCreated?.({
        id: habit.id,
        name: habit.name,
        streak: habit.streak ?? 0,
        completedDays: Array.isArray(habit.completedDays) ? habit.completedDays : [],
      });
      toast.success('Привычка создана', fullName);
      onClose();
    } catch {
      toast.error('Не удалось создать привычку');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => { void submit(e); }}>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.1rem' }}>🌱</span> Новая привычка
      </h3>

      {/* Emoji picker */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Иконка
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              style={{
                width: 38, height: 38, fontSize: '1.15rem', borderRadius: 10,
                border: `2px solid ${emoji === e ? 'var(--accent-1)' : 'var(--border)'}`,
                background: emoji === e ? 'rgba(99,102,241,0.12)' : 'transparent',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.12s var(--ease)',
                transform: emoji === e ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name input */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Название
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'var(--bg-base)', transition: 'border-color 0.15s var(--ease)' }}
          onFocus={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-1)'; }}
          onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'; }}
        >
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{emoji}</span>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название привычки..."
            maxLength={80}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
            }}
          />
        </div>
        {name.trim() && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 5 }}>
            Будет сохранено как: <em style={{ color: 'var(--text-secondary)' }}>{emoji} {name.trim()}</em>
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} className="btn btn-ghost">
          Отмена
        </button>
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="btn btn-primary"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Создание...' : 'Создать привычку'}
        </button>
      </div>
    </form>
  );
}

interface QuickAddHabitProps {
  apiUrl?: string;
  token?: string;
  onCreated?: (habit: Habit) => void;
}

export function QuickAddHabit({ apiUrl, token, onCreated }: QuickAddHabitProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost"
        data-shortcut="new-habit"
        style={{ gap: 6, padding: '7px 12px', fontSize: '0.82rem', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Новая
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            animation: 'fade-in 0.15s var(--ease) both',
          }}
        />
      )}

      {open && (
        <div
          style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 70,
            width: '90%', maxWidth: 440,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-lg)',
            padding: '24px',
            animation: 'scale-in 0.2s var(--ease-spring) both',
          }}
        >
          <HabitForm
            key="habit-form"
            apiUrl={apiUrl}
            token={token}
            onCreated={onCreated}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
