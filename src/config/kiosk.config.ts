import type { GeneratedLayout } from '../types/layout';
import { ACTIVE_TRACKS, DESTINATIONS } from './network.config';

export const ROUND_SECONDS = 90;
export const PREPARATION_SECONDS = 5;
export const KIOSK_DISPLAY = { width: 768, height: 1024 } as const;
export const SWITCH_COLUMNS = [210, 340, 470, 600] as const;
export const STATION_X = 720;
export const ARRIVAL_X = STATION_X - 30;
export const KIOSK_IDLE_SECONDS = 60;
export const STATIONS = DESTINATIONS.map((destination) => destination.name);

/** Fixed, spaced controls are easier to learn on a public touchscreen. */
export function createKioskLayout(): GeneratedLayout {
  const pairs = [
    [
      [0, 1],
      [1, 0],
      [2, 3],
      [3, 2],
    ],
    [
      [1, 2],
      [2, 1],
    ],
    [
      [0, 1],
      [1, 0],
      [2, 3],
      [3, 2],
    ],
    [
      [1, 2],
      [2, 1],
    ],
  ];
  const connections: GeneratedLayout['connections'] = SWITCH_COLUMNS.flatMap(
    (x, stage) =>
      pairs[stage].map(([source, target]) => ({
        id: `w-${stage}-${source}`,
        x,
        source: ACTIVE_TRACKS[source],
        target: ACTIVE_TRACKS[target],
      })),
  );
  return {
    switches: Object.fromEntries(connections.map(({ id, x }) => [id, x])),
    connections,
    stops: Object.fromEntries(
      DESTINATIONS.map((destination) => [
        destination.badge,
        {
          x: STATION_X,
          track: destination.track,
          duration: 1700,
        },
      ]),
    ),
  };
}
