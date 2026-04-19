'use client';

import { useState } from 'react';
import type { Habit } from '@/lib/api';
import { HabitCard } from './habit-card';
import { QuickAddHabit } from './quick-add-habit';

interface HabitListManagerProps {
  habits: Habit[];
  apiUrl?: string;
  token?: string;
}

export function HabitListManager({ habits: initialHabits, apiUrl, token }: HabitListManagerProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);

  function handleDelete(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  function handleCreated(habit: Habit) {
    setHabits((prev) => [habit, ...prev]);
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>Привычки</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Нажмите ✓ чтобы отметить сегодня</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', background: 'rgba(245,158,11,0.10)', borderRadius: 999, padding: '2px 10px', fontWeight: 600, color: '#d97706' }}>
            🔥 {totalStreak}д
          </span>
          <QuickAddHabit apiUrl={apiUrl} token={token} onCreated={handleCreated} />
        </div>
      </div>

      {habits.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '32px 20px', borderRadius: 12,
          background: 'var(--bg-base)', border: '1.5px dashed var(--border)',
          color: 'var(--text-tertiary)', textAlign: 'center',
        }}>
          <span style={{ fontSize: '2rem' }}>🌱</span>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 4 }}>Нет привычек</p>
            <p style={{ fontSize: '0.78rem' }}>Добавьте первую привычку — маленький шаг к большим изменениям</p>
          </div>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {habits.map((habit) => (
            <div key={habit.id} className="animate-slide-up">
              <HabitCard habit={habit} apiUrl={apiUrl} token={token} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
