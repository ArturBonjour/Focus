'use client';

import { useState } from 'react';
import type { Task } from '@/lib/api';
import { toast } from '@/components/toast';
import { ConfettiBurst } from '@/components/confetti';

interface KanbanBoardProps {
  initialTasks: Task[];
  apiUrl: string;
  token: string;
}

type Column = 'TODO' | 'IN_PROGRESS' | 'DONE';

const COLUMN_CONFIG: { id: Column; label: string; emoji: string; accent: string; bg: string }[] = [
  { id: 'TODO',        label: 'Запланировано', emoji: '📋', accent: '#6b7280', bg: 'rgba(107,114,128,0.07)' },
  { id: 'IN_PROGRESS', label: 'В процессе',    emoji: '⚡', accent: '#f59e0b', bg: 'rgba(245,158,11,0.07)' },
  { id: 'DONE',        label: 'Готово',         emoji: '✅', accent: '#10b981', bg: 'rgba(16,185,129,0.07)' },
];

const PRIORITY_COLOR: Record<Task['priority'], string> = {
  HIGH:   '#ef4444',
  MEDIUM: '#f59e0b',
  LOW:    '#10b981',
};
const PRIORITY_LABEL: Record<Task['priority'], string> = {
  HIGH:   'Высокий',
  MEDIUM: 'Средний',
  LOW:    'Низкий',
};

function formatDeadline(deadline: string | null | undefined): string | null {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function isOverdue(deadline: string | null | undefined, status: Column): boolean {
  if (!deadline || status === 'DONE') return false;
  return new Date(deadline) < new Date();
}

interface KanbanCardProps {
  task: Task;
  onDragStart: (id: string) => void;
  onStatusChange: (id: string, status: Column) => void;
}

function KanbanCard({ task, onDragStart, onStatusChange }: KanbanCardProps) {
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const overdue = isOverdue(task.deadline, task.status as Column);
  const deadline = formatDeadline(task.deadline);

  function handleQuickDone() {
    if (task.status === 'DONE') return;
    setLoading(true);
    onStatusChange(task.id, 'DONE');
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setLoading(false); }, 900);
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="animate-scale-in"
      style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '12px 14px',
        cursor: 'grab',
        transition: 'box-shadow 0.15s, transform 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
        (e.currentTarget as HTMLDivElement).style.transform = '';
      }}
    >
      {/* confetti burst */}
      <ConfettiBurst active={showConfetti} count={20} />

      {/* Priority bar */}
      <div style={{
        position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
        borderRadius: 99,
        background: PRIORITY_COLOR[task.priority],
      }} />

      <div style={{ paddingLeft: 10 }}>
        {/* Title */}
        <p style={{
          fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
          lineHeight: 1.45, marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.45,
            marginBottom: 8,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: 99,
            background: `${PRIORITY_COLOR[task.priority]}1a`,
            color: PRIORITY_COLOR[task.priority],
          }}>
            {PRIORITY_LABEL[task.priority]}
          </span>

          {deadline && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: '0.68rem', fontWeight: 500, padding: '2px 7px', borderRadius: 99,
              background: overdue ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.08)',
              color: overdue ? '#ef4444' : 'var(--text-tertiary)',
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {overdue ? '⚠️ ' : ''}{deadline}
            </span>
          )}

          {/* Quick DONE button */}
          {task.status !== 'DONE' && (
            <button
              onClick={handleQuickDone}
              disabled={loading}
              title="Отметить как выполнено"
              style={{
                marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', padding: '2px 4px', borderRadius: 6,
                display: 'flex', alignItems: 'center',
                transition: 'color 0.15s',
                fontSize: '0.75rem',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#10b981'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ initialTasks, apiUrl, token }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Column | null>(null);

  function handleDragStart(id: string) {
    setDragId(id);
  }

  async function handleDrop(targetCol: Column) {
    setDragOverCol(null);
    if (!dragId) return;

    const task = tasks.find((t) => t.id === dragId);
    if (!task || task.status === targetCol) { setDragId(null); return; }

    // Optimistic update
    const prevTasks = tasks;
    setTasks((prev) => prev.map((t) => t.id === dragId ? { ...t, status: targetCol } : t));
    setDragId(null);

    try {
      const res = await fetch(`${apiUrl}/tasks/${dragId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: targetCol }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(
        targetCol === 'DONE' ? '✅ Задача выполнена!' : '↪️ Статус обновлён',
        task.title,
      );
    } catch {
      setTasks(prevTasks);
      toast.error('Не удалось обновить статус');
    }
  }

  function handleStatusChange(id: string, status: Column) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const prevTasks = tasks;
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));

    void fetch(`${apiUrl}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }).then((res) => {
      if (!res.ok) throw new Error('failed');
      toast.success('✅ Задача выполнена!', task.title);
    }).catch(() => {
      setTasks(prevTasks);
      toast.error('Не удалось обновить статус');
    });
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  const completion = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="card animate-slide-up" style={{ padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Общий прогресс
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-1)' }}>
            {doneTasks}/{totalTasks} задач · {completion}%
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'var(--accent-gradient)',
            width: `${completion}%`,
            transition: 'width 0.6s var(--ease)',
          }} />
        </div>
      </div>

      {/* Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        alignItems: 'start',
      }}>
        {COLUMN_CONFIG.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => { void handleDrop(col.id); }}
              style={{
                borderRadius: 18,
                border: `2px solid ${isOver ? col.accent : 'var(--border)'}`,
                background: isOver ? col.bg : 'var(--bg-card)',
                padding: '14px 12px',
                minHeight: 280,
                transition: 'border-color 0.15s, background 0.15s',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: '1rem' }}>{col.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {col.label}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  minWidth: 22, height: 22,
                  borderRadius: 999,
                  background: `${col.accent}22`,
                  color: col.accent,
                  fontSize: '0.72rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 6px',
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Drop zone hint */}
              {isOver && (
                <div style={{
                  height: 56, borderRadius: 12, marginBottom: 10,
                  border: `2px dashed ${col.accent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', color: col.accent, fontWeight: 600,
                  background: `${col.accent}0a`,
                }}>
                  Перетащите сюда
                </div>
              )}

              {/* Task cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colTasks.length === 0 && !isOver ? (
                  <div style={{
                    padding: '28px 16px', textAlign: 'center',
                    color: 'var(--text-tertiary)', fontSize: '0.8rem',
                    borderRadius: 12,
                    border: '1.5px dashed var(--border)',
                  }}>
                    <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>
                      {col.id === 'TODO' ? '📭' : col.id === 'IN_PROGRESS' ? '⚙️' : '🎉'}
                    </p>
                    <p>{col.id === 'DONE' ? 'Задачи пока не выполнены' : 'Нет задач'}</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 20, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        fontSize: '0.72rem', color: 'var(--text-tertiary)',
        background: 'var(--border)', borderRadius: 12,
      }}>
        <span>💡 Совет:</span>
        <span>🖱 <strong>Перетаскивайте</strong> карточки между колонками</span>
        <span>✓ Нажмите <strong>галочку</strong> на карточке для быстрого выполнения</span>
        <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Drag & Drop Kanban
        </span>
      </div>
    </div>
  );
}
