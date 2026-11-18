import type { TrackPosition } from '../types';
import { ROUND_SECONDS } from '../config/kiosk.config';
import { MAX_PHASE_MULTIPLIER } from '../config/network.config';

export { DESTINATIONS } from '../config/network.config';

const ACCELERATION_START_SECOND = 45;
const START_PHASE_MULTIPLIER = 0.68;

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
  const progress = Math.max(
    0,
    Math.min(
      1,
      (elapsed - ACCELERATION_START_SECOND) /
        (ROUND_SECONDS - ACCELERATION_START_SECOND),
    ),
  );
  const speed =
    START_PHASE_MULTIPLIER +
    progress * (MAX_PHASE_MULTIPLIER - START_PHASE_MULTIPLIER);
  if (elapsed < ACCELERATION_START_SECOND)
    return { interval: 6500, speed, name: 'Einfahren' };
  if (elapsed < 75) return { interval: 5500, speed, name: 'Stadtverkehr' };
  return { interval: 4800, speed, name: 'Feierabendverkehr' };
}
