import type { TrackPosition } from '../types';

export { DESTINATIONS } from '../config/network.config';

export function pointsForStreak(streak: number): number {
  return 10 * Math.min(5, Math.max(1, streak));
}

export class DispatchRules {
  score = 0;
  streak = 0;
  delivered = 0;
  mistakes = 0;

  arrive(actual: TrackPosition, target: TrackPosition): number {
    if (actual !== target) {
      this.streak = 0;
      this.mistakes++;
      return 0;
    }
    this.streak++;
    this.delivered++;
    const points = pointsForStreak(this.streak);
    this.score += points;
    return points;
  }
}

export function trafficAt(elapsed: number): {
  interval: number;
  speed: number;
  name: string;
} {
  // Accelerate gradually, while changing spawn intervals only at phase boundaries.
  const progress = Math.max(0, Math.min(1, (elapsed - 45) / 45));
  const speed = 0.65 + progress * 0.15;
  if (elapsed < 45) return { interval: 6500, speed, name: 'Einfahren' };
  if (elapsed < 75) return { interval: 5500, speed, name: 'Stadtverkehr' };
  return { interval: 4800, speed, name: 'Feierabendverkehr' };
}
