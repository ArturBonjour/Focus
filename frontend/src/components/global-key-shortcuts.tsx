'use client';

import { useEffect, useState } from 'react';
import { KeyboardShortcutsModal } from './keyboard-shortcuts-modal';

/**
 * Global keyboard shortcuts:
 * - `n` → opens the QuickAddTask modal
 * - `h` → opens the QuickAddHabit modal
 * - `?` → opens the keyboard shortcuts modal
 *
 * Ignores shortcuts when focus is on an input/textarea/select/contenteditable.
 */
export function GlobalKeyShortcuts() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (e.target as HTMLElement).isContentEditable;
      if (isEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        const btn = document.querySelector<HTMLButtonElement>('[data-shortcut="new-task"]');
        if (btn) btn.click();
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        const btn = document.querySelector<HTMLButtonElement>('[data-shortcut="new-habit"]');
        if (btn) btn.click();
      }
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />;
}


