'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from './toast';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

interface TaskFormProps {
  apiUrl?: string;
  token?: string;
  onCreated?: (task: { id: string; title: string; priority: Priority }) => void;
  onClose: () => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'LOW',    label: 'Низкий',  color: '#10b981' },
  { value: 'MEDIUM', label: 'Средний', color: '#f59e0b' },
  { value: 'HIGH',   label: 'Высокий', color: '#ef4444' },
];

const TAG_SUGGESTIONS = ['работа', 'личное', 'urgent', 'dev', 'meeting'];

function hashTag(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return (h * 137) % 360;
}

// Inner form component — mounts fresh each time so state is clean
function TaskForm({ apiUrl, token, onCreated, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
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

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 30);
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    if (!token || !apiUrl) {
      const mockTask = { id: String(Date.now()), title: title.trim(), priority };
      await new Promise((r) => setTimeout(r, 400));
      onCreated?.(mockTask);
      toast.success('Задача добавлена', title.trim());
      onClose();
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          priority,
          tags,
          ...(deadline ? { deadline: new Date(deadline).toISOString() } : {}),
        }),
      });

      if (!res.ok) throw new Error('Failed to create task');

      const created = (await res.json()) as { data?: { id: string; title: string; priority: Priority } };
      const task = created.data ?? { id: String(Date.now()), title: title.trim(), priority };
      onCreated?.(task);
      toast.success('Задача добавлена', title.trim());
      onClose();
    } catch {
      toast.error('Не удалось создать задачу', 'Проверьте соединение и попробуйте снова');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => { void submit(e); }}>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.1rem' }}>✏️</span> Новая задача
      </h3>

      <div style={{ marginBottom: 14 }}>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название задачи..."
          maxLength={120}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-base)', color: 'var(--text-primary)',
            fontSize: '0.9rem', outline: 'none',
            transition: 'border-color 0.15s var(--ease)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-1)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Приоритет
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {priorities.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 8,
                border: `1.5px solid ${priority === p.value ? p.color : 'var(--border)'}`,
                background: priority === p.value ? `${p.color}15` : 'transparent',
                color: priority === p.value ? p.color : 'var(--text-secondary)',
                fontSize: '0.78rem', fontWeight: priority === p.value ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s var(--ease)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Теги
        </p>
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  padding: '1px 8px', borderRadius: 999,
                  fontSize: '0.68rem', fontWeight: 600,
                  background: `hsl(${hashTag(tag)}, 70%, 15%)`,
                  color: `hsl(${hashTag(tag)}, 75%, 70%)`,
                  border: `1px solid hsl(${hashTag(tag)}, 65%, 30%)`,
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: '0.75rem', lineHeight: 1, opacity: 0.7 }}
                >×</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 5 }}>
          {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).slice(0, 4).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              style={{
                padding: '2px 8px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 600,
                border: '1px dashed var(--border-strong)', background: 'transparent',
                color: 'var(--text-tertiary)', cursor: 'pointer',
              }}
            >+{s}</button>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }
            if (e.key === ',') { e.preventDefault(); addTag(tagInput); }
          }}
          placeholder="Новый тег… Enter"
          style={{
            width: '100%', padding: '7px 10px', borderRadius: 8,
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-base)', color: 'var(--text-primary)',
            fontSize: '0.8rem', outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-1)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Дедлайн (опционально)
        </p>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 10,
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-base)', color: 'var(--text-primary)',
            fontSize: '0.875rem', outline: 'none', colorScheme: 'dark light',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} className="btn btn-ghost">
          Отмена
        </button>
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="btn btn-primary"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Создание...' : 'Создать задачу'}
        </button>
      </div>
    </form>
  );
}

interface QuickAddTaskProps {
  apiUrl?: string;
  token?: string;
  onCreated?: (task: { id: string; title: string; priority: Priority }) => void;
}

export function QuickAddTask({ apiUrl, token, onCreated }: QuickAddTaskProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-primary"
        data-shortcut="new-task"
        style={{ gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Добавить
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
            width: '90%', maxWidth: 460,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-lg)',
            padding: '24px',
            animation: 'scale-in 0.2s var(--ease-spring) both',
            maxHeight: 'calc(100dvh - 48px)',
            overflowY: 'auto',
          }}
        >
          <TaskForm
            key="task-form"
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

