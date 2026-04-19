import type { Task } from '@/lib/api';

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

export function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';

  return (
    <div
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '12px 14px',
        borderRadius: 12,
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        transition: 'all 0.15s var(--ease)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-base)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
      }}
    >
      {/* Priority bar */}
      <div style={{
        width: 3, borderRadius: 3, alignSelf: 'stretch', flexShrink: 0,
        background: priorityColors[task.priority],
      }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <p style={{
            fontWeight: 500,
            color: task.status === 'DONE' ? 'var(--text-tertiary)' : 'var(--text-primary)',
            textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
            fontSize: '0.875rem',
            flex: 1,
          }}>
            {task.title}
          </p>
          <span className={statusBadge[task.status]}>{statusLabel[task.status]}</span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            Приоритет: <span style={{ color: priorityColors[task.priority], fontWeight: 600 }}>{priorityLabel[task.priority]}</span>
          </span>
          {task.deadline && (
            <span style={{ fontSize: '0.72rem', color: isOverdue ? '#ef4444' : 'var(--text-tertiary)', fontWeight: isOverdue ? 600 : 400 }}>
              📅 {new Date(task.deadline).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              {isOverdue && ' · просрочено'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
