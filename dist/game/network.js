export const TRACK_Y = Object.freeze({ track1: 142, track2: 237, track3: 332, track4: 427 });
export const TRACKS = Object.freeze(Object.keys(TRACK_Y));
export const SPEEDS = Object.freeze([80, 100, 120, 140]);
export const MAX_TRAINS_PER_DESTINATION = 2;
export const SPAWN_X = -100;
export const MAP_WIDTH = 1024;
export const TRAIN_WIDTH = 90;
export const MAX_PHASE_MULTIPLIER = 1.15;

export const DESTINATIONS = Object.freeze([
  { track: 'track1', name: 'Durlach', badge: 'D', color: '#286b9b', line: 'S2' },
  { track: 'track2', name: 'Marktplatz', badge: 'M', color: '#8d387e', line: 'S1' },
  { track: 'track3', name: 'Hauptbahnhof', badge: 'H', color: '#966012', line: 'S4' },
  { track: 'track4', name: 'Europaplatz', badge: 'E', color: '#287764', line: 'S5' },
]);

export function createLayout() {
  // Alternating outer and inner pairs permit three lane changes before arrival.
  const stages = [
    { x: 150, pairs: [[0, 1], [1, 0], [2, 3], [3, 2]] },
    { x: 330, pairs: [[1, 2], [2, 1]] },
    { x: 510, pairs: [[0, 1], [1, 0], [2, 3], [3, 2]] },
    { x: 690, pairs: [[1, 2], [2, 1]] },
  ];
  const connections = stages.flatMap(({ x, pairs }) => pairs.map(([source, target]) => ({
    id: `w-${x}-${source}`, x, source: TRACKS[source], target: TRACKS[target],
  })));
  return {
    switches: Object.fromEntries(connections.map(({ id, x }) => [id, x])),
    connections,
    stops: Object.fromEntries(DESTINATIONS.map((destination) => [destination.badge, {
      x: 850, track: destination.track, duration: 1700,
    }])),
  };
}
