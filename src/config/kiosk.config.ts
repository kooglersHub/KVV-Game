import type { GeneratedLayout } from '../types/layout';

export const ROUND_SECONDS = 90;
export const PREPARATION_SECONDS = 5;
export const KIOSK_DISPLAY = { width: 768, height: 1024 } as const;
export const SWITCH_COLUMNS = [240, 390, 540] as const;
export const STATION_X = 670;
export const ARRIVAL_X = STATION_X - 30;
export const KIOSK_IDLE_SECONDS = 60;
export const STATIONS = ['Durlach', 'Marktplatz', 'Hauptbahnhof'];

/** Fixed, spaced controls are easier to learn on a public touchscreen. */
export function createKioskLayout(): GeneratedLayout {
  const connections: GeneratedLayout['connections'] = [
    { id: 'w1', x: SWITCH_COLUMNS[0], source: 'track2', target: 'track3' },
    { id: 'w2', x: SWITCH_COLUMNS[0], source: 'track4', target: 'track3' },
    { id: 'w3', x: SWITCH_COLUMNS[1], source: 'track3', target: 'track2' },
    { id: 'w4', x: SWITCH_COLUMNS[2], source: 'track2', target: 'track3' },
    { id: 'w5', x: SWITCH_COLUMNS[2], source: 'track3', target: 'track4' },
    { id: 'w6', x: SWITCH_COLUMNS[2], source: 'track4', target: 'track3' },
  ];
  return {
    switches: Object.fromEntries(connections.map(({ id, x }) => [id, x])),
    connections,
    stops: {
      durlach: { x: STATION_X, track: 'track2', duration: 1700 },
      marktplatz: { x: STATION_X, track: 'track3', duration: 2300 },
      hauptbahnhof: { x: STATION_X, track: 'track4', duration: 1700 },
    },
  };
}
