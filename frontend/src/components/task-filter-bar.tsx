'use client';

import { useState } from 'react';
import type { Task } from '@/lib/api';
import { TaskCard } from './task-card';
import { toast } from './toast';

type Filter = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE';

const FILTERS: { value: Filter; label: string; emoji: string }[] = [
  { value: 'ALL',         label: 'Все',          emoji: '📋' },
  { value: 'TODO',        label: 'Запланировано', emoji: '🔲' },
  { value: 'IN_PROGRESS', label: 'В процессе',   emoji: '⚡' },
  { value: 'DONE',        label: 'Готово',       emoji: '✅' },
];

interface TaskFilterBarProps {
  tasks: Task[];
  apiUrl?: string;
  token?: string;
}

export function TaskFilterBar({ tasks: initialTasks, apiUrl, token }: TaskFilterBarProps) {
  const [active, setActive] = useState<Filter>('ALL');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const counts: Record<Filter, number> = {
    ALL:         tasks.length,
    TODO:        tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE:        tasks.filter((t) => t.status === 'DONE').length,
  };

  const visible = active === 'ALL' ? tasks : tasks.filter((t) => t.status === active);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === visible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((t) => t.id)));
    }
  }

  function clearSelection() { setSelected(new Set()); }

  async function bulkAction(action: 'complete' | 'delete') {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const ids = [...selected];
    try {
      if (!token || !apiUrl) {
        // Demo mode
        if (action === 'delete') {
          setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
          toast.info(`Удалено ${ids.length} задач`);
        } else {
          setTasks((prev) => prev.map((t) => ids.includes(t.id) ? { ...t, status: 'DONE' as const } : t));
          toast.success(`Выполнено ${ids.length} задач 🎯`);
        }
        clearSelection();
        return;
      }

      const res = await fetch(`${apiUrl}/tasks/bulk`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'delete'
            ? { ids, delete: true }
            : { ids, status: 'DONE' }
        ),
      });
      if (!res.ok) throw new Error('Bulk action failed');

      if (action === 'delete') {
        setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
        toast.info(`Удалено ${ids.length} задач`);
      } else {
        setTasks((prev) => prev.map((t) => ids.includes(t.id) ? { ...t, status: 'DONE' as const } : t));
        toast.success(`Выполнено ${ids.length} задач 🎯`);
      }
      clearSelection();
    } catch {
      toast.error('Не удалось выполнить массовое действие');
    } finally {
      setBulkLoading(false);
    }
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  function handleDuplicate(newTask: Task) {
    setTasks((prev) => [...prev, newTask]);
  }

  function handleUpdate(updated: Task) {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

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
            onClick={() => { setActive(f.value); clearSelection(); }}
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
                borderRadius: 999, padding: '0px 5px',
                fontSize: '0.68rem', fontWeight: 700,
                lineHeight: '16px', minWidth: 16, textAlign: 'center',
              }}>
                {counts[f.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {visible.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8, minHeight: 28,
          transition: 'all 0.2s',
        }}>
          {/* Select all checkbox */}
          <button
            onClick={toggleSelectAll}
            title={selected.size === visible.length ? 'Снять выделение' : 'Выбрать все'}
            style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${selected.size > 0 ? 'var(--accent-1)' : 'var(--border-strong)'}`,
              background: selected.size === visible.length ? 'var(--accent-1)' : selected.size > 0 ? 'rgba(99,102,241,0.15)' : 'transparent',
              cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {selected.size > 0 && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                {selected.size === visible.length
                  ? <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  : <line x1="2" y1="6" x2="10" y2="6" stroke="var(--accent-1)" strokeWidth="2" strokeLinecap="round"/>
                }
              </svg>
            )}
          </button>

          {selected.size > 0 ? (
            <>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-1)', fontWeight: 600 }}>
                {selected.size} выбрано
              </span>
              <button
                onClick={() => { void bulkAction('complete'); }}
                disabled={bulkLoading}
                style={{
                  padding: '3px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: 'rgba(16,185,129,0.12)', color: '#059669',
                  fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.12s',
                  opacity: bulkLoading ? 0.5 : 1,
                }}
              >
                ✓ Выполнить
              </button>
              <button
                onClick={() => { void bulkAction('delete'); }}
                disabled={bulkLoading}
                style={{
                  padding: '3px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: 'rgba(239,68,68,0.10)', color: '#dc2626',
                  fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.12s',
                  opacity: bulkLoading ? 0.5 : 1,
                }}
              >
                🗑 Удалить
              </button>
              <button
                onClick={clearSelection}
                style={{
                  padding: '3px 8px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: 'transparent', color: 'var(--text-tertiary)',
                  fontSize: '0.68rem', transition: 'all 0.12s',
                }}
              >
                ✕ Отмена
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
              Выберите задачи для групповых действий
            </span>
          )}
        </div>
      )}

      {/* Task list */}
      {visible.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '28px 0',
          color: 'var(--text-tertiary)', fontSize: '0.85rem', gap: 8,
        }}>
          <span style={{ fontSize: '2rem' }}>🎉</span>
          <p>{active === 'DONE' ? 'Нет выполненных задач' : 'Нет задач в этом фильтре'}</p>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map((task) => (
            <div key={task.id} className="animate-slide-up" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              {/* Per-row checkbox */}
              <button
                onClick={() => toggleSelect(task.id)}
                style={{
                  marginTop: 14, width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${selected.has(task.id) ? 'var(--accent-1)' : 'var(--border-strong)'}`,
                  background: selected.has(task.id) ? 'var(--accent-1)' : 'transparent',
                  cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                aria-label={selected.has(task.id) ? 'Снять выделение' : 'Выбрать задачу'}
              >
                {selected.has(task.id) && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <TaskCard
                  task={task}
                  apiUrl={apiUrl}
                  token={token}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onUpdate={handleUpdate}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

