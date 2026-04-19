'use client';

import { useState } from 'react';
import type { Habit } from '@/lib/api';
import { toast } from './toast';

const DOW_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Returns ISO dates for Mon–Sun of the current week
function getCurrentWeekDates(): string[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

interface HabitCardProps {
  habit: Habit;
  apiUrl?: string;
  token?: string;
}

export function HabitCard({ habit, apiUrl, token }: HabitCardProps) {
  const [completedDays, setCompletedDays] = useState<string[]>(
    habit.completedDays,
  );
  const [streak, setStreak] = useState(habit.streak);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const isToday = completedDays.includes(today);
  const weekDays = getCurrentWeekDates();

  async function toggle() {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const wasTracked = isToday;
    if (wasTracked) {
      setCompletedDays((prev) => prev.filter((d) => d !== today));
      setStreak((s) => Math.max(0, s - 1));
    } else {
      setCompletedDays((prev) => [...prev, today]);
      setStreak((s) => s + 1);
    }

    try {
      if (!token || !apiUrl) {
        // Demo mode — keep optimistic state
        await new Promise((r) => setTimeout(r, 200));
        if (wasTracked) {
          toast.info('Отметка снята', habit.name);
        } else {
          toast.success('Привычка выполнена! 🎉', habit.name);
        }
        setLoading(false);
        return;
      }

      const endpoint = wasTracked ? 'untrack' : 'track';
      const res = await fetch(`${apiUrl}/habits/${habit.id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: today }),
      });

      if (!res.ok) throw new Error('Failed');

      const json = (await res.json()) as {
        data?: { completedDays: string[]; streak: number };
        completedDays?: string[];
        streak?: number;
      };
      const updated = json.data ?? json;
      if (Array.isArray(updated.completedDays)) {
        setCompletedDays(
          updated.completedDays.filter((d): d is string => typeof d === 'string'),
        );
      }
      if (typeof updated.streak === 'number') setStreak(updated.streak);

      if (wasTracked) {
        toast.info('Отметка снята', habit.name);
      } else {
        toast.success('Привычка выполнена! 🎉', habit.name);
      }
    } catch {
      // Revert optimistic update on error
      if (wasTracked) {
        setCompletedDays((prev) => [...prev, today]);
        setStreak((s) => s + 1);
      } else {
        setCompletedDays((prev) => prev.filter((d) => d !== today));
        setStreak((s) => Math.max(0, s - 1));
      }
      toast.error('Не удалось обновить привычку');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: '14px 14px 12px',
        borderRadius: 14,
        background: 'var(--bg-base)',
        border: `1px solid ${isToday ? 'rgba(16,185,129,0.28)' : 'var(--border)'}`,
        transition: 'all 0.2s var(--ease)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Done glow */}
      {isToday && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              lineHeight: 1.3,
            }}
          >
            {habit.name}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 3,
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>🔥</span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: streak > 0 ? '#f59e0b' : 'var(--text-tertiary)',
              }}
            >
              {streak}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              дней подряд
            </span>
          </div>
        </div>

        {/* Track / untrack button */}
        <button
          onClick={() => { void toggle(); }}
          disabled={loading}
          title={isToday ? 'Снять отметку' : 'Отметить сегодня'}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: `2px solid ${isToday ? '#10b981' : 'var(--border-strong)'}`,
            background: isToday
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'transparent',
            cursor: loading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s var(--ease-spring)',
            flexShrink: 0,
            boxShadow: isToday ? '0 2px 8px rgba(16,185,129,0.35)' : 'none',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>•</span>
          ) : isToday ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 7l3 3 6-6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 3v8M3 7h8"
                stroke="var(--text-tertiary)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Week grid Mon–Sun */}
      <div style={{ display: 'flex', gap: 4 }}>
        {weekDays.map((day, i) => {
          const done = completedDays.includes(day);
          const isTod = day === today;
          const isFuture = day > today;
          return (
            <div
              key={day}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <span
                style={{
                  fontSize: '0.58rem',
                  color: isTod ? 'var(--accent-1)' : 'var(--text-tertiary)',
                  fontWeight: isTod ? 700 : 400,
                }}
              >
                {DOW_LABELS[i]}
              </span>
              <div
                style={{
                  width: '100%',
                  height: 18,
                  borderRadius: 4,
                  background: isFuture
                    ? 'var(--border)'
                    : done
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'rgba(239,68,68,0.12)',
                  opacity: isFuture ? 0.35 : 1,
                  border: isTod
                    ? '1.5px solid var(--accent-1)'
                    : '1.5px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s var(--ease)',
                }}
              >
                {done && !isFuture && (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1.5 5l3 3 4-5"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
