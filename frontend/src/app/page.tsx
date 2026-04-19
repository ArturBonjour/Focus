import { Sidebar } from '@/components/sidebar';
import { StatCard } from '@/components/stat-card';
import { ProductivityChart } from '@/components/productivity-chart';
import { TaskCard } from '@/components/task-card';
import { HabitCard } from '@/components/habit-card';
import { ActivityHeatmap } from '@/components/activity-heatmap';
import { FocusTimer } from '@/components/focus-timer';
import { getDashboardData } from '@/lib/api';

interface HomeProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const token = params?.token;
  const data = await getDashboardData(token);

  const doneTasks = data.tasks.filter((t) => t.status === 'DONE').length;
  const totalTasks = data.tasks.length;
  const inProgressTasks = data.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completion = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const highPriority = data.tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE').length;
  const totalStreak = data.habits.reduce((acc, h) => acc + h.streak, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <Sidebar />

      <main className="main-content" style={{ flex: 1 }}>
        {/* ── Header ── */}
        <header className="animate-fade-in" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{
                  fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                }}>
                  Дашборд продуктивности
                </h1>
                {data.mode === 'demo' && (
                  <span className="badge badge-progress" style={{ fontSize: '0.7rem' }}>Demo</span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
                {data.mode === 'live' && <span style={{ marginLeft: 8, color: '#10b981', fontWeight: 600 }}>● Live</span>}
              </p>
            </div>
            {data.mode === 'demo' && (
              <div className="card animate-scale-in" style={{ padding: '10px 16px', borderRadius: 12, maxWidth: 280 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  💡 Добавьте <code style={{ fontFamily: 'monospace', background: 'var(--border)', padding: '1px 6px', borderRadius: 4, color: 'var(--accent-1)' }}>?token=JWT</code> в URL для live-данных
                </p>
              </div>
            )}
          </div>
        </header>

        {/* ── KPI Cards ── */}
        <section className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatCard label="Задач выполнено" value={`${doneTasks}/${totalTasks}`} subtitle={`Completion: ${completion}%`} icon="✅" accent="#6366f1" delay={0} />
          <StatCard label="В процессе" value={inProgressTasks} subtitle="Активных задач" icon="⚡" accent="#f59e0b" delay={60} />
          <StatCard label="Высокий приоритет" value={highPriority} subtitle="Требуют внимания" icon="🔴" accent="#ef4444" delay={120} />
          <StatCard label="Streak суммарно" value={`${totalStreak}д`} subtitle={`${data.habits.length} привычек`} icon="🔥" accent="#f59e0b" delay={180} />
          <StatCard label="Completion Rate" value={`${completion}%`} subtitle="За текущий период" icon="🎯" accent="#10b981" delay={240} />
        </section>

        {/* ── Chart + Focus Timer ── */}
        <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card animate-slide-up" style={{ padding: '22px 22px', animationDelay: '80ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 2 }}>Продуктивность</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Выполненные vs всего задач</p>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: '0.72rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-tertiary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: '#6366f1', display: 'inline-block' }} />
                  Выполнено
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-tertiary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: '#8b5cf6', display: 'inline-block', opacity: 0.5 }} />
                  Всего
                </span>
              </div>
            </div>
            <ProductivityChart data={data.weekly} />
          </div>

          <div className="card animate-slide-up" style={{ padding: '22px', animationDelay: '140ms', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', alignSelf: 'flex-start', width: '100%' }}>Focus Timer</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', alignSelf: 'flex-start', width: '100%', marginBottom: 4 }}>Pomodoro 25/5</p>
            <FocusTimer />
          </div>
        </section>

        {/* ── Tasks + Habits ── */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Tasks */}
          <div className="card animate-slide-up" style={{ padding: '22px', animationDelay: '160ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>Задачи</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{totalTasks} задач</p>
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px',
                borderRadius: 999,
                background: completion === 100 ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.10)',
                color: completion === 100 ? '#059669' : 'var(--accent-1)',
              }}>
                {completion}% done
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: 'var(--accent-gradient)',
                width: `${completion}%`,
                transition: 'width 0.6s var(--ease)',
              }} />
            </div>

            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.tasks.map((task) => (
                <div key={task.id} className="animate-slide-up">
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </div>

          {/* Habits */}
          <div className="card animate-slide-up" style={{ padding: '22px', animationDelay: '200ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>Привычки</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Ежедневные ритуалы</p>
              </div>
            </div>

            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.habits.map((habit) => (
                <div key={habit.id} className="animate-slide-up">
                  <HabitCard habit={habit} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Activity Heatmap ── */}
        {data.habits.length > 0 && (
          <section className="card animate-slide-up" style={{ padding: '22px', animationDelay: '240ms', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 4 }}>
              История активности
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 18 }}>
              Выполнение привычек за последние 18 недель
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowX: 'auto', paddingBottom: 4 }}>
              {data.habits.map((habit) => (
                <ActivityHeatmap key={habit.id} completedDays={habit.completedDays} habitName={habit.name} />
              ))}
            </div>
          </section>
        )}

        {/* ── AI Recommendations ── */}
        <section className="card animate-slide-up" style={{ padding: '22px', animationDelay: '280ms', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem',
            }}>
              🧠
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>AI-инсайты</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Персональные рекомендации</p>
            </div>
          </div>

          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {data.recommendations.recommendations.map((rec, i) => (
              <div
                key={rec}
                className="animate-scale-in"
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: `rgba(99,102,241,${0.04 + i * 0.02})`,
                  border: '1px solid rgba(99,102,241,0.12)',
                  fontSize: '0.85rem',
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                }}
              >
                {rec}
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ textAlign: 'center', padding: '16px 0 4px', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
          NeuroTrack · AI Productivity System · v1.0
        </footer>
      </main>
    </div>
  );
}
