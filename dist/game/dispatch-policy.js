import {
  DESTINATIONS, MAP_WIDTH, MAX_PHASE_MULTIPLIER, MAX_TRAINS_PER_DESTINATION,
  SPAWN_X, SPEEDS, TRACKS, TRAIN_WIDTH,
} from './network.js';

function isEntrySafe(trains, track, speed) {
  const ahead = trains.filter((train) => train.track === track);
  // Reserve a full two-second brake even after the busiest phase accelerates.
  const clearance = TRAIN_WIDTH + 48 + speed * MAX_PHASE_MULTIPLIER * 2;
  return ahead.every((train) => speed <= train.speed && train.x - SPAWN_X >= clearance);
}

export function chooseSpawn(trains, sourceTrack, random = Math.random) {
  if (!TRACKS.includes(sourceTrack)) return null;
  const visible = trains.filter((train) => train.active !== false && train.x <= MAP_WIDTH + TRAIN_WIDTH);
  const choices = [];

  DESTINATIONS.forEach((destination, destinationIndex) => {
    // A round should require a routing decision, rather than a straight ride.
    if (destination.track === sourceTrack) return;
    const matching = visible.filter((train) => train.destination === destinationIndex);
    if (matching.length >= MAX_TRAINS_PER_DESTINATION) return;

    const speedLimit = Math.min(...matching.map((train) => train.speed));
    for (const speed of SPEEDS) {
      if (speed <= speedLimit && isEntrySafe(visible, sourceTrack, speed)) {
        choices.push({ destination: destinationIndex, speed });
      }
    }
  });

  return choices.length ? choices[Math.floor(random() * choices.length)] : null;
}
