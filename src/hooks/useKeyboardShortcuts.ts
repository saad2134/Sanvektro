import { useEffect } from 'react';

interface ShortcutActions {
  onTogglePlay: () => void;
  onSelectPreset: (index: number) => void;
  onFocusSimulator: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onPrint: () => void;
  onToggleMute: () => void;
  onToggleShortcutsModal: () => void;
  onToggleReportCard?: () => void;
  onCloseModals: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in an input, textarea, or select
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        actions.onCloseModals();
        return;
      }

      if (isInput) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          actions.onTogglePlay();
          break;
        case '1':
          actions.onSelectPreset(0);
          break;
        case '2':
          actions.onSelectPreset(1);
          break;
        case '3':
          actions.onSelectPreset(2);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          actions.onFocusSimulator();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          actions.onToggleReportCard?.();
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          actions.onExportCSV();
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          actions.onExportJSON();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          actions.onPrint();
          break;
        case 'm':
        case 'M':
          actions.onToggleMute();
          break;
        case '?':
          e.preventDefault();
          actions.onToggleShortcutsModal();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}
