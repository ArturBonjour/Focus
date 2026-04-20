'use client';

import { useEffect, useState } from 'react';
import type { Task } from '@/lib/api';

interface UpcomingTask extends Task {
  daysLeft: number | null;
}

interface Props {
  apiUrl: string;
  token?: string;
}

const priorityColor: Record<Task['priority'], string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

function DaysLeftBadge({ days }: { days: number | null }) {
  if (days === null) return null;
  if (days < 0) return (
    <span style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 999, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
      Просрочено {Math.abs(days)}д
    </span>
  );
  if (days === 0) return (
    <span style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 999, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0, animation: 'pulse-ring 2s infinite' }}>
      🔴 Сегодня
    </span>
  );
  if (days === 1) return (
    <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', borderRadius: 999, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
      ⚠️ Завтра
    </span>
  );
  if (days <= 3) return (
    <span style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', borderRadius: 999, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 600, flexShrink: 0 }}>
      {days}д
    </span>
  );
  return (
    <span style={{ background: 'var(--border)', color: 'var(--text-tertiary)', borderRadius: 999, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 600, flexShrink: 0 }}>
      {days}д
    </span>
  );
}

export function UpcomingDeadlinesWidget({ token }: Props) {
  const [tasks, setTasks] = useState<UpcomingTask[] | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetch('/api/tasks/upcoming?days=7')
      .then((r) => r.ok ? r.json() as Promise<UpcomingTask[]> : Promise.reject())
      .then((data) => { if (!cancelled) setTasks(data); })
      .catch(() => { if (!cancelled) setTasks([]); });

    return () => { cancelled = true; };
  }, [token]);

  if (!token || (tasks !== null && tasks.length === 0)) return null;

  return (
    <section className="card glow-card animate-slide-up" style={{ padding: '22px', marginBottom: 14, animationDelay: '170ms' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(239,68,68,0.25)',
          flexShrink: 0,
        }}>
          📅
        </div>
        <div>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.2 }}>Ближайшие дедлайны</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Задачи в течение 7 дней</p>
        </div>
      </div>

      {tasks === null ? (
        /* Skeleton */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 44, borderRadius: 10 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--bg-base)',
                border: `1px solid ${priorityColor[task.priority]}22`,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-base)'; }}
            >
              {/* Priority dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: priorityColor[task.priority],
                flexShrink: 0,
                boxShadow: `0 0 6px ${priorityColor[task.priority]}66`,
              }} />

              {/* Title */}
              <span style={{
                flex: 1,
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {task.title}
              </span>

              {/* Deadline date */}
              {task.deadline && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  {new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </span>
              )}

              <DaysLeftBadge days={task.daysLeft} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
