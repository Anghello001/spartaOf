import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Bloqueo total de zoom (pellizco, doble tap y Ctrl+Rueda)
if (typeof window !== 'undefined') {
  // Prevenir zoom por gesto en iOS Safari (pinch gesture)
  document.addEventListener('gesturestart', (e: Event) => e.preventDefault());
  document.addEventListener('gesturechange', (e: Event) => e.preventDefault());
  document.addEventListener('gestureend', (e: Event) => e.preventDefault());

  // Prevenir zoom táctil multi-touch (pellizco en Android y Safari)
  document.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Prevenir zoom por doble tap rápido en pantallas táctiles
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );

  // Prevenir zoom con teclado / mouse (Ctrl + rueda, Ctrl + teclas +/-)
  document.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')
    ) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);

