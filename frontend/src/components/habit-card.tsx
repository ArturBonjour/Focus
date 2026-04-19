import type { Habit } from '@/lib/api';

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getDayShort(iso: string) {
  return new Date(iso).toLocaleDateString('ru', { weekday: 'short' }).slice(0, 2);
}

export function HabitCard({ habit }: { habit: Habit }) {
  const last7 = getLast7Days();
  const doneSet = new Set(habit.completedDays);
  const todayDone = doneSet.has(last7[6]);

  return (
    <div
      style={{
        padding: '14px 14px',
        borderRadius: 14,
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        transition: 'all 0.15s var(--ease)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.3)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{habit.name}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
            🔥 Серия: <span style={{ fontWeight: 700, color: habit.streak > 0 ? '#f59e0b' : 'var(--text-tertiary)' }}>{habit.streak}</span> дней
          </p>
        </div>
        {todayDone ? (
          <span className="badge badge-done" style={{ fontSize: '0.7rem' }}>✓ сегодня</span>
        ) : (
          <span className="badge badge-todo" style={{ fontSize: '0.7rem' }}>• сегодня</span>
        )}
      </div>

      {/* Last 7 days mini-calendar */}
      <div style={{ display: 'flex', gap: 5 }}>
        {last7.map((day) => {
          const done = doneSet.has(day);
          const isToday = day === last7[6];
          return (
            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.6rem', color: isToday ? 'var(--accent-1)' : 'var(--text-tertiary)', fontWeight: isToday ? 700 : 400 }}>
                {getDayShort(day)}
              </span>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: done ? 'var(--accent-1)' : 'var(--border)',
                border: isToday ? '2px solid var(--accent-1)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s var(--ease)',
              }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
