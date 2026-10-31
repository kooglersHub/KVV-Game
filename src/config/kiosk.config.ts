import type { GeneratedLayout } from '../types/layout';

export const ROUND_SECONDS = 90;
export const KIOSK_IDLE_SECONDS = 60;
export const STATIONS = ['Durlach', 'Marktplatz', 'Hauptbahnhof'];

/** Fixed, spaced controls are easier to learn on a public touchscreen. */
export function createKioskLayout(): GeneratedLayout {
  const connections: GeneratedLayout['connections'] = [
    { id: 'w1', x: 180, source: 'track2', target: 'track3' },
    { id: 'w2', x: 180, source: 'track4', target: 'track3' },
    { id: 'w3', x: 430, source: 'track3', target: 'track2' },
    { id: 'w4', x: 680, source: 'track2', target: 'track3' },
    { id: 'w5', x: 680, source: 'track3', target: 'track4' },
    { id: 'w6', x: 680, source: 'track4', target: 'track3' },
  ];
  return {
    switches: Object.fromEntries(connections.map(({ id, x }) => [id, x])),
    connections,
    stops: {
      durlach: { x: 850, track: 'track2', duration: 1700 },
      marktplatz: { x: 850, track: 'track3', duration: 2300 },
      hauptbahnhof: { x: 850, track: 'track4', duration: 1700 },
    },
  };
}
