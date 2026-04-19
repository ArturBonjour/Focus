'use client';

import { useState } from 'react';
import type { Task } from '@/lib/api';
import { toast } from './toast';

interface TaskEditModalProps {
  task: Task;
  apiUrl?: string;
  token?: string;
  onUpdated: (updated: Task) => void;
  onClose: () => void;
}

const PRIORITIES = [
  { value: 'LOW',    label: 'Низкий',   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { value: 'MEDIUM', label: 'Средний',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { value: 'HIGH',   label: 'Высокий',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
] as const;

export function TaskEditModal({ task, apiUrl, token, onUpdated, onClose }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [deadline, setDeadline] = useState(task.deadline ? task.deadline.slice(0, 16) : '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) { toast.error('Название задачи обязательно'); return; }
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null,
    };

    try {
      if (!token || !apiUrl) {
        // Demo mode
        await new Promise((r) => setTimeout(r, 200));
        onUpdated({ ...task, ...payload, deadline: payload.deadline ?? null });
        toast.success('Задача обновлена', title);
        onClose();
        return;
      }
      const res = await fetch(`${apiUrl}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = (await res.json()) as Task;
      onUpdated(updated);
      toast.success('Задача обновлена', updated.title);
      onClose();
    } catch {
      toast.error('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 300, backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Редактировать задачу"
        className="animate-scale-in"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 310,
          width: 'min(540px, calc(100vw - 32px))',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-strong)',
          borderRadius: 20,
          padding: '28px 28px 24px',
          boxShadow: 'var(--shadow-lg), 0 0 60px rgba(99,102,241,0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>✏️ Редактировать задачу</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Изменения сохраняются немедленно</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.2rem', padding: 4 }}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Название *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
            style={{
              width: '100%', padding: '10px 14px',
              borderRadius: 10, border: '1px solid var(--border-strong)',
              background: 'var(--bg-base)', color: 'var(--text-primary)',
              fontSize: '0.9rem', fontWeight: 500, outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
            placeholder="Название задачи"
            autoFocus
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%', padding: '10px 14px',
              borderRadius: 10, border: '1px solid var(--border-strong)',
              background: 'var(--bg-base)', color: 'var(--text-primary)',
              fontSize: '0.875rem', resize: 'vertical', outline: 'none',
              transition: 'border-color 0.15s', lineHeight: 1.55, fontFamily: 'inherit',
            }}
            onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--accent-1)'; }}
            onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border-strong)'; }}
            placeholder="Опциональное описание…"
          />
        </div>

        {/* Priority + Deadline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
          {/* Priority */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Приоритет
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  style={{
                    flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600,
                    border: `1.5px solid ${priority === p.value ? p.color : 'var(--border)'}`,
                    background: priority === p.value ? p.bg : 'transparent',
                    color: priority === p.value ? p.color : 'var(--text-tertiary)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Дедлайн
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px',
                borderRadius: 10, border: '1px solid var(--border-strong)',
                background: 'var(--bg-base)', color: 'var(--text-primary)',
                fontSize: '0.8rem', outline: 'none',
                transition: 'border-color 0.15s', fontFamily: 'inherit',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ flex: 1 }}
            disabled={saving}
          >
            Отмена
          </button>
          <button
            onClick={() => { void handleSave(); }}
            className="btn btn-primary"
            style={{ flex: 2, gap: 6 }}
            disabled={saving || !title.trim()}
          >
            {saving ? (
              <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
            ) : '💾'}
            {saving ? 'Сохраняем…' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </>
  );
}
