'use client';

import { useEffect } from 'react';

/**
 * Global keyboard shortcuts:
 * - `n` → opens the QuickAddTask modal (dispatches click on the QuickAddTask button)
 * - `t` → scroll to top
 *
 * Ignores shortcuts when focus is on an input/textarea/select/contenteditable.
 */
export function GlobalKeyShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (e.target as HTMLElement).isContentEditable;
      if (isEditable) return;

      // Ignore when modifier keys are held (for ⌘K etc.)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        // Find the QuickAddTask "Добавить" button and click it
        const btn = document.querySelector<HTMLButtonElement>('[data-shortcut="new-task"]');
        if (btn) btn.click();
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        // Find the QuickAddHabit button
        const btn = document.querySelector<HTMLButtonElement>('[data-shortcut="new-habit"]');
        if (btn) btn.click();
      }

      if (e.key === 'Escape') {
        // Close any open modal by pressing Escape — each modal handles its own escape
      }
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
