'use client';

import { useState } from 'react';
import type { Task } from '@/lib/api';
import { TaskCard } from './task-card';

type Filter = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE';

const FILTERS: { value: Filter; label: string; emoji: string }[] = [
  { value: 'ALL',         label: 'Все',      emoji: '📋' },
  { value: 'TODO',        label: 'Запланировано', emoji: '🔲' },
  { value: 'IN_PROGRESS', label: 'В процессе', emoji: '⚡' },
  { value: 'DONE',        label: 'Готово',   emoji: '✅' },
];

interface TaskFilterBarProps {
  tasks: Task[];
}

export function TaskFilterBar({ tasks }: TaskFilterBarProps) {
  const [active, setActive] = useState<Filter>('ALL');

  const counts: Record<Filter, number> = {
    ALL:         tasks.length,
    TODO:        tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE:        tasks.filter((t) => t.status === 'DONE').length,
  };

  const visible =
    active === 'ALL' ? tasks : tasks.filter((t) => t.status === active);

  return (
    <div>
      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--border)',
        borderRadius: 12, padding: 3,
        marginBottom: 12,
        overflowX: 'auto',
      }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.76rem',
              fontWeight: active === f.value ? 600 : 400,
              background: active === f.value ? 'var(--bg-elevated)' : 'transparent',
              color: active === f.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: active === f.value ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s var(--ease)',
              whiteSpace: 'nowrap',
            }}
          >
            {f.emoji} {f.label}
            {counts[f.value] > 0 && (
              <span style={{
                background: active === f.value ? 'rgba(99,102,241,0.15)' : 'var(--border-strong)',
                color: active === f.value ? 'var(--accent-1)' : 'var(--text-tertiary)',
                borderRadius: 999,
                padding: '0px 5px',
                fontSize: '0.68rem',
                fontWeight: 700,
                lineHeight: '16px',
                minWidth: 16,
                textAlign: 'center',
              }}>
                {counts[f.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {visible.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 0',
          color: 'var(--text-tertiary)',
          fontSize: '0.85rem',
          gap: 8,
        }}>
          <span style={{ fontSize: '2rem' }}>🎉</span>
          <p>Нет задач в этом фильтре</p>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map((task) => (
            <div key={task.id} className="animate-slide-up">
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
