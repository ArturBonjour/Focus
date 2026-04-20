'use client';

import { useState } from 'react';
import type { Task, Subtask } from '@/lib/api';
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

const TAG_PRESETS = ['работа', 'личное', 'urgent', 'dev', 'meeting', 'review', 'docs', 'идея'];

function hashTag(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return (h * 137) % 360;
}

let subtaskIdCounter = Date.now();
function nextSubtaskId() { return `st_${++subtaskIdCounter}`; }

export function TaskEditModal({ task, apiUrl, token, onUpdated, onClose }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [deadline, setDeadline] = useState(task.deadline ? task.deadline.slice(0, 16) : '');
  const [saving, setSaving] = useState(false);

  // Tags state
  const [tags, setTags] = useState<string[]>(task.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  // Subtasks state
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks ?? []);
  const [subtaskInput, setSubtaskInput] = useState('');

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 30);
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function addSubtask() {
    const t = subtaskInput.trim();
    if (!t) return;
    setSubtasks((prev) => [...prev, { id: nextSubtaskId(), title: t, done: false }]);
    setSubtaskInput('');
  }

  function toggleSubtask(id: string) {
    setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, done: !s.done } : s));
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('Название задачи обязательно'); return; }
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      tags,
      subtasks,
    };

    try {
      if (!token || !apiUrl) {
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    borderRadius: 10, border: '1px solid var(--border-strong)',
    background: 'var(--bg-base)', color: 'var(--text-primary)',
    fontSize: '0.875rem', outline: 'none',
    transition: 'border-color 0.15s', fontFamily: 'inherit',
  };

  const doneSub = subtasks.filter((s) => s.done).length;
  const totalSub = subtasks.length;

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
          width: 'min(580px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
          overflowY: 'auto',
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
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            style={{ ...inputStyle, fontWeight: 500, fontSize: '0.9rem' }}
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
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
            onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--accent-1)'; }}
            onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border-strong)'; }}
            placeholder="Опциональное описание…"
          />
        </div>

        {/* Priority + Deadline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
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

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Дедлайн
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ ...inputStyle, fontSize: '0.8rem', padding: '7px 10px' }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
            />
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Теги
          </label>
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 9px',
                    borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                    background: `hsl(${hashTag(tag)}, 70%, 15%)`,
                    color: `hsl(${hashTag(tag)}, 75%, 70%)`,
                    border: `1px solid hsl(${hashTag(tag)}, 65%, 30%)`,
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: '0.8rem', lineHeight: 1, opacity: 0.7 }}
                    aria-label={`Remove tag ${tag}`}
                  >×</button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {TAG_PRESETS.filter((t) => !tags.includes(t)).slice(0, 5).map((preset) => (
              <button
                key={preset}
                onClick={() => addTag(preset)}
                style={{
                  padding: '2px 9px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 600,
                  border: '1px dashed var(--border-strong)',
                  background: 'transparent', color: 'var(--text-tertiary)',
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-1)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
              >
                +{preset}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
                if (e.key === 'Escape') onClose();
              }}
              style={{ ...inputStyle, fontSize: '0.8rem', padding: '7px 10px' }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
              placeholder="Новый тег… Enter для добавления"
            />
          </div>
        </div>

        {/* Subtasks */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Подзадачи {totalSub > 0 && <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({doneSub}/{totalSub})</span>}
            </label>
            {totalSub > 0 && (
              <div style={{ height: 2, flex: 1, maxWidth: 80, marginLeft: 10, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, background: doneSub === totalSub ? '#10b981' : 'var(--accent-gradient)', width: `${Math.round((doneSub / totalSub) * 100)}%`, transition: 'width 0.3s' }} />
              </div>
            )}
          </div>

          {/* Existing subtasks */}
          {subtasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: sub.done ? 'rgba(16,185,129,0.06)' : 'var(--bg-base)',
                    border: `1px solid ${sub.done ? 'rgba(16,185,129,0.15)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <button
                    onClick={() => toggleSubtask(sub.id)}
                    style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${sub.done ? '#10b981' : 'var(--border-strong)'}`,
                      background: sub.done ? '#10b981' : 'transparent',
                      cursor: 'pointer', padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    aria-label={sub.done ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
                  >
                    {sub.done && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <span style={{
                    flex: 1, fontSize: '0.8rem',
                    color: sub.done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    textDecoration: sub.done ? 'line-through' : 'none',
                  }}>
                    {sub.title}
                  </span>
                  <button
                    onClick={() => removeSubtask(sub.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: 2, lineHeight: 1, opacity: 0.6, transition: 'opacity 0.1s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add subtask input */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addSubtask(); }
                if (e.key === 'Escape') onClose();
              }}
              style={{ ...inputStyle, flex: 1, fontSize: '0.8rem', padding: '7px 10px' }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent-1)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'; }}
              placeholder="Добавить подзадачу… Enter"
            />
            <button
              onClick={addSubtask}
              disabled={!subtaskInput.trim()}
              style={{
                padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: subtaskInput.trim() ? 'rgba(99,102,241,0.12)' : 'var(--border)',
                color: subtaskInput.trim() ? 'var(--accent-1)' : 'var(--text-tertiary)',
                fontWeight: 600, fontSize: '0.8rem',
                transition: 'all 0.15s',
              }}
            >
              +
            </button>
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

