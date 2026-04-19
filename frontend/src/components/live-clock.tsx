'use client';

import { useEffect, useState } from 'react';

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (time === null) return null;

  return (
    <span
      style={{
        fontFamily: 'monospace',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '0.04em',
        background: 'var(--border)',
        borderRadius: 8,
        padding: '3px 10px',
        minWidth: 80,
        display: 'inline-block',
        textAlign: 'center',
      }}
    >
      {time}
    </span>
  );
}
