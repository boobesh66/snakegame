/**
 * Tactile haptic feedback utility for mobile touch interactions.
 */

let hapticsAllowed = true;

try {
  const stored = localStorage.getItem('play_to_play_haptics');
  if (stored !== null) {
    hapticsAllowed = stored === 'true';
  }
} catch {}

export function setHapticsEnabled(enabled: boolean) {
  hapticsAllowed = enabled;
  try {
    localStorage.setItem('play_to_play_haptics', String(enabled));
  } catch {}
}

export function getHapticsEnabled(): boolean {
  return hapticsAllowed;
}

export function triggerHaptic(type: 'tap' | 'eat' | 'powerup' | 'collision') {
  if (!hapticsAllowed || typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(10);
        break;
      case 'eat':
        navigator.vibrate(25);
        break;
      case 'powerup':
        navigator.vibrate([20, 30, 40]);
        break;
      case 'collision':
        navigator.vibrate([60, 40, 80]);
        break;
    }
  } catch {}
}
