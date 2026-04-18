import { ProductivityChart } from '@/components/productivity-chart';
import { getDashboardData } from '@/lib/api';

interface HomeProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const token = params?.token;
  const data = await getDashboardData(token);

  const doneTasks = data.tasks.filter((task) => task.status === 'DONE').length;
  const totalTasks = data.tasks.length;
  const completion = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-zinc-900 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-zinc-500">NeuroTrack · AI Productivity System</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">Интеллектуальный дашборд продуктивности</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Режим: <span className="font-medium text-zinc-900">{data.mode === 'live' ? 'Live API' : 'Demo'}</span>
                {data.mode === 'demo' && (
                  <span className="ml-2 text-zinc-500">(добавьте `?token=YOUR_JWT` в URL для live-данных)</span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <KpiCard label="Выполнено" value={`${doneTasks}/${totalTasks}`} />
              <KpiCard label="Completion" value={`${completion}%`} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card title="Продуктивность по дням" subtitle="Сравнение выполненных и всех задач">
            <ProductivityChart data={data.weekly} />
          </Card>

          <Card title="AI рекомендации" subtitle="Rule-based аналитика поведения">
            <ul className="space-y-2 text-sm text-zinc-700">
              {data.recommendations.recommendations.map((recommendation) => (
                <li key={recommendation} className="rounded-xl bg-zinc-50 p-3">
                  🧠 {recommendation}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Задачи" subtitle="Task management">
            <div className="space-y-2">
              {data.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-zinc-500">Priority: {task.priority}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Привычки" subtitle="Habit streak tracking">
            <div className="space-y-2">
              {data.habits.map((habit) => (
                <div key={habit.id} className="rounded-xl border border-zinc-200 p-3">
                  <p className="font-medium">{habit.name}</p>
                  <p className="text-sm text-zinc-600">🔥 Серия: {habit.streak} дней</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-zinc-500">{subtitle}</p>
      {children}
    </article>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: 'TODO' | 'IN_PROGRESS' | 'DONE' }) {
  const label = status === 'DONE' ? 'Done' : status === 'IN_PROGRESS' ? 'In Progress' : 'Todo';
  const style =
    status === 'DONE'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'IN_PROGRESS'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-zinc-100 text-zinc-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}>{label}</span>;
}
