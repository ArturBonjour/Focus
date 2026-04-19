'use client';

import { useState } from 'react';
import type { Task } from '@/lib/api';
import { toast } from './toast';

const priorityColors: Record<Task['priority'], string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

const priorityLabel: Record<Task['priority'], string> = {
  HIGH: 'Высокий',
  MEDIUM: 'Средний',
  LOW: 'Низкий',
};

const statusLabel: Record<Task['status'], string> = {
  DONE: 'Готово',
  IN_PROGRESS: 'В работе',
  TODO: 'Запланировано',
};

const statusBadge: Record<Task['status'], string> = {
  DONE: 'badge badge-done',
  IN_PROGRESS: 'badge badge-progress',
  TODO: 'badge badge-todo',
};

const STATUS_CYCLE: Task['status'][] = ['TODO', 'IN_PROGRESS', 'DONE'];

interface TaskCardProps {
  task: Task;
  apiUrl?: string;
  token?: string;
  onDelete?: (id: string) => void;
  onDuplicate?: (newTask: Task) => void;
}

export function TaskCard({ task, apiUrl, token, onDelete, onDuplicate }: TaskCardProps) {
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [loading, setLoading] = useState<'status' | 'delete' | 'duplicate' | null>(null);
  const [deleted, setDeleted] = useState(false);

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && status !== 'DONE';

  async function cycleStatus() {
    if (loading) return;
    const currentIdx = STATUS_CYCLE.indexOf(status);
    const next = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    const prev = status;
    setStatus(next);
    setLoading('status');

    try {
      if (!token || !apiUrl) {
        await new Promise((r) => setTimeout(r, 150));
        if (next === 'DONE') toast.success('Задача выполнена! 🎯', task.title);
        else toast.info(`Статус: ${statusLabel[next]}`, task.title);
        return;
      }
      const res = await fetch(`${apiUrl}/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Failed');
      if (next === 'DONE') toast.success('Задача выполнена! 🎯', task.title);
      else toast.info(`Статус: ${statusLabel[next]}`, task.title);
    } catch {
      setStatus(prev);
      toast.error('Не удалось обновить статус');
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (loading) return;
    setLoading('delete');
    try {
      if (!token || !apiUrl) {
        await new Promise((r) => setTimeout(r, 150));
        setDeleted(true);
        toast.info('Задача удалена', task.title);
        onDelete?.(task.id);
        return;
      }
      const res = await fetch(`${apiUrl}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      setDeleted(true);
      toast.info('Задача удалена', task.title);
      onDelete?.(task.id);
    } catch {
      toast.error('Не удалось удалить задачу');
    } finally {
      setLoading(null);
    }
  }

  async function handleDuplicate() {
    if (loading) return;
    setLoading('duplicate');
    try {
      if (!token || !apiUrl) {
        await new Promise((r) => setTimeout(r, 150));
        toast.info('Задача дублирована', `${task.title} (копия)`);
        return;
      }
      const res = await fetch(`${apiUrl}/tasks/${task.id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      const newTask = (await res.json()) as Task;
      toast.success('Задача дублирована', newTask.title);
      onDuplicate?.(newTask);
    } catch {
      toast.error('Не удалось дублировать задачу');
    } finally {
      setLoading(null);
    }
  }

  if (deleted) return null;

  return (
    <div
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '12px 14px',
        borderRadius: 12,
        background: 'var(--bg-base)',
        border: `1px solid ${status === 'DONE' ? 'rgba(16,185,129,0.15)' : 'var(--border)'}`,
        transition: 'all 0.2s var(--ease)',
        cursor: 'default',
        opacity: status === 'DONE' ? 0.75 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-base)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
      }}
    >
      {/* Priority bar */}
      <div style={{
        width: 3, borderRadius: 3, alignSelf: 'stretch', flexShrink: 0,
        background: priorityColors[task.priority],
        transition: 'opacity 0.2s',
        opacity: status === 'DONE' ? 0.4 : 1,
      }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <p style={{
            fontWeight: 500,
            color: status === 'DONE' ? 'var(--text-tertiary)' : 'var(--text-primary)',
            textDecoration: status === 'DONE' ? 'line-through' : 'none',
            fontSize: '0.875rem',
            flex: 1,
            lineHeight: 1.35,
          }}>
            {task.title}
          </p>

          {/* Clickable status badge */}
          <button
            onClick={() => { void cycleStatus(); }}
            disabled={!!loading}
            title="Нажмите для смены статуса"
            className={statusBadge[status]}
            style={{
              border: 'none', cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.15s var(--ease)',
              opacity: loading === 'status' ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            {loading === 'status' ? '…' : statusLabel[status]}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            <span style={{ color: priorityColors[task.priority], fontWeight: 600 }}>{priorityLabel[task.priority]}</span>
          </span>
          {task.deadline && (
            <span style={{ fontSize: '0.72rem', color: isOverdue ? '#ef4444' : 'var(--text-tertiary)', fontWeight: isOverdue ? 600 : 400 }}>
              📅 {new Date(task.deadline).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              {isOverdue && ' · просрочено'}
            </span>
          )}

          {/* Action buttons — appear on the right */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {/* Duplicate */}
            <button
              onClick={() => { void handleDuplicate(); }}
              disabled={!!loading}
              title="Дублировать задачу"
              style={{
                width: 22, height: 22, borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: loading ? 'default' : 'pointer',
                fontSize: '0.7rem', lineHeight: 1,
                color: 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.1s',
                opacity: loading === 'duplicate' ? 0.4 : 1,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#6366f1'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
            >
              ⧉
            </button>
            {/* Delete */}
            <button
              onClick={() => { void handleDelete(); }}
              disabled={!!loading}
              title="Удалить задачу"
              style={{
                width: 22, height: 22, borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: loading ? 'default' : 'pointer',
                fontSize: '0.7rem', lineHeight: 1,
                color: 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.1s',
                opacity: loading === 'delete' ? 0.4 : 1,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
