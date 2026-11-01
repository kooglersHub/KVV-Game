import { GAME_CONFIG } from '../config/game.config';
import {
  ACTIVE_TRACKS,
  DESTINATIONS,
  MAX_PHASE_MULTIPLIER,
  MAX_TRAINS_PER_DESTINATION,
  SPAWN_X,
  TRAIN_CLEARANCE,
} from '../config/network.config';
import type { TrackPosition } from '../types';

export interface TrafficSnapshot {
  destination: number;
  speed: number;
  track: TrackPosition;
  x: number;
  active?: boolean;
}

export interface SpawnPlan {
  destination: number;
  speed: number;
}

function isEntrySafe(
  trains: TrafficSnapshot[],
  track: TrackPosition,
  speed: number,
): boolean {
  // Leave room for a two-second brake, even after the next traffic phase.
  const clearance = TRAIN_CLEARANCE + speed * MAX_PHASE_MULTIPLIER * 2;
  return trains
    .filter((train) => train.track === track)
    .every((train) => speed <= train.speed && train.x - SPAWN_X >= clearance);
}

/** Port of GitHub's dispatch policy; destinations are reserved before rendering. */
export function chooseSpawn(
  trains: TrafficSnapshot[],
  source: TrackPosition,
  random = Math.random,
): SpawnPlan | null {
  if (!ACTIVE_TRACKS.some((track) => track === source)) return null;
  const visible = trains.filter(
    (train) =>
      train.active !== false &&
      train.x <= GAME_CONFIG.width + GAME_CONFIG.graphics.trainWidth,
  );
  const choices: SpawnPlan[] = [];
  DESTINATIONS.forEach((destination, index) => {
    if (destination.track === source) return;
    const matching = visible.filter((train) => train.destination === index);
    if (matching.length >= MAX_TRAINS_PER_DESTINATION) return;
    const speedLimit = Math.min(...matching.map((train) => train.speed));
    for (const speed of GAME_CONFIG.physics.trainSpeedVariants) {
      if (speed <= speedLimit && isEntrySafe(visible, source, speed))
        choices.push({ destination: index, speed });
    }
  });
  return choices.length ? choices[Math.floor(random() * choices.length)] : null;
}
