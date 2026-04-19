import type { ProductivityPoint } from '@/lib/api';
import { LiveClock } from './live-clock';

const QUOTES = [
  '\"Делайте сегодня то, чем гордится завтрашнее вы.\"',
  '\"Маленький прогресс каждый день складывается в большие результаты.\"',
  '\"Продуктивность — это не случайность, это результат обязательства перед качеством.\"',
  '\"Сосредоточьтесь на том, что под вашим контролем.\"',
  '\"Начните там, где вы есть. Используйте то, что есть. Делайте что можете.\"',
  '\"Дисциплина — это свобода.\"',
  '\"Каждый день — это новый шанс стать лучше вчерашнего себя.\"',
];

function getTimeContext() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)
    return {
      text: 'Доброе утро',
      emoji: '☀️',
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(99,102,241,0.06) 100%)',
      accent: '#f59e0b',
    };
  if (h >= 12 && h < 17)
    return {
      text: 'Добрый день',
      emoji: '🌤',
      bg: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)',
      accent: '#6366f1',
    };
  if (h >= 17 && h < 22)
    return {
      text: 'Добрый вечер',
      emoji: '🌙',
      bg: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.10) 100%)',
      accent: '#8b5cf6',
    };
  return {
    text: 'Доброй ночи',
    emoji: '🌃',
    bg: 'linear-gradient(135deg, rgba(30,27,75,0.12) 0%, rgba(99,102,241,0.08) 100%)',
    accent: '#6366f1',
  };
}

interface WelcomeBannerProps {
  doneTasks: number;
  totalTasks: number;
  totalStreak: number;
  habitsCount: number;
  todayProgress: number; // 0–100
  weekly: ProductivityPoint[];
}

export function WelcomeBanner({
  doneTasks,
  totalTasks,
  totalStreak,
  habitsCount,
  todayProgress,
  weekly,
}: WelcomeBannerProps) {
  const ctx = getTimeContext();
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  // Determine weekly change
  const last = weekly[weekly.length - 1];
  const prev = weekly[weekly.length - 2];
  const weeklyChange =
    last && prev && prev.completedTasksCount > 0
      ? Math.round(
          ((last.completedTasksCount - prev.completedTasksCount) /
            prev.completedTasksCount) *
            100,
        )
      : null;

  return (
    <div
      className="card animate-fade-in"
      style={{
        marginBottom: 24,
        padding: '24px 28px',
        background: ctx.bg,
        position: 'relative',
        overflow: 'hidden',
        borderColor: `${ctx.accent}20`,
      }}
    >
      {/* Decorative glow orb */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: ctx.accent,
          opacity: 0.06,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          left: '30%',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: '#8b5cf6',
          opacity: 0.05,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* Greeting */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{ctx.emoji}</span>
          <h2
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            {ctx.text}!
          </h2>
          {weeklyChange !== null && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: weeklyChange >= 0 ? '#10b981' : '#ef4444',
                background:
                  weeklyChange >= 0
                    ? 'rgba(16,185,129,0.12)'
                    : 'rgba(239,68,68,0.12)',
                borderRadius: 999,
                padding: '2px 8px',
              }}
            >
              {weeklyChange >= 0 ? '↑' : '↓'} {Math.abs(weeklyChange)}%
            </span>
          )}
          {/* Live clock */}
          <span style={{ marginLeft: 'auto' }}>
            <LiveClock />
          </span>
        </div>

        {/* Quote */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginBottom: 18,
            lineHeight: 1.55,
            maxWidth: 540,
          }}
        >
          {quote}
        </p>

        {/* Today's progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <span
              style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}
            >
              Прогресс сегодня
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: ctx.accent,
              }}
            >
              {todayProgress}%
            </span>
          </div>
          <div
            style={{
              height: 5,
              background: 'var(--border)',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${todayProgress}%`,
                background: `linear-gradient(90deg, ${ctx.accent}, #8b5cf6)`,
                borderRadius: 99,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(16,185,129,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
              }}
            >
              ✅
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {doneTasks}
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-tertiary)',
                    fontWeight: 400,
                    marginLeft: 4,
                  }}
                >
                  / {totalTasks}
                </span>
              </p>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-tertiary)',
                  marginTop: 1,
                }}
              >
                задач выполнено
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(245,158,11,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
              }}
            >
              🔥
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {totalStreak}
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-tertiary)',
                    fontWeight: 400,
                    marginLeft: 4,
                  }}
                >
                  дней
                </span>
              </p>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-tertiary)',
                  marginTop: 1,
                }}
              >
                суммарный streak
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(99,102,241,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
              }}
            >
              ⚡
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {habitsCount}
              </p>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-tertiary)',
                  marginTop: 1,
                }}
              >
                привычек активных
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
