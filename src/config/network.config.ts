import { GAME_CONFIG } from './game.config';

export const ACTIVE_TRACKS = ['track1', 'track2', 'track3', 'track4'] as const;
export const MAX_TRAINS_PER_DESTINATION = 2;
export const SPAWN_X = -100;
export const MAX_PHASE_MULTIPLIER = 0.95;
export const DESTINATIONS = [
  {
    track: 'track1',
    name: 'Durlach',
    badge: 'D',
    color: '#286b9b',
    line: 'S2',
  },
  {
    track: 'track2',
    name: 'Marktplatz',
    badge: 'M',
    color: '#8d387e',
    line: 'S1',
  },
  {
    track: 'track3',
    name: 'Hauptbahnhof',
    badge: 'H',
    color: '#966012',
    line: 'S4',
  },
  {
    track: 'track4',
    name: 'Europaplatz',
    badge: 'E',
    color: '#287764',
    line: 'S5',
  },
] as const;

export const INTRO_TRAIN = {
  x: 64,
  track: 'track1',
  speed: 42,
  destination: 1,
} as const;
export const TRAIN_CLEARANCE = GAME_CONFIG.graphics.trainWidth + 48;
