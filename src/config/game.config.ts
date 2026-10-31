export const GAME_CONFIG = {
  width: 1024,
  height: 540,
  backgroundColor: '#eef1e4',

  physics: {
    tracks: {
      track1: 70,
      track2: 145,
      track3: 270,
      track4: 395,
      track5: 465,
      track6: 510,
    },
    trainSpeed: 100, // base pixels per second
    trainSpeedVariants: [80, 100, 120, 140], // Different speed options
    speedProgression: {
      pointsPerSpeedIncrease: 50, // Every 50 points, increase speed
      maxSpeedMultiplier: 2.5, // Maximum 2.5x speed
      spawnIntervalDecrease: 0.8, // Each level reduces spawn interval by 20%
      minSpawnInterval: 800, // Minimum spawn interval (ms)
    },
    levelProgression: {
      level0Tracks: 3, // Number of tracks in beginner level
      level1Points: 222, // Points needed to progress from level 0 to level 1
      level2Points: 444, // Points needed for level 2
      level2StopMultiplier: 1.8, // Stops 80% longer in level 2
      level2SpawnMultiplier: 0.6, // 40% more frequent spawning in level 2
    },
  },

  graphics: {
    trackWidth: 4,
    trainWidth: 90,
    trainHeight: 38,
    switchSize: 25,
  },

  colors: {
    track: 0x333333,
    train: 0x4a90e2,
    trainSlow: 0x95a5a6, // Gray for slow trains
    trainFast: 0xe74c3c, // Red for fast trains
    trainVeryFast: 0x8e44ad, // Purple for very fast trains
    switch: 0xe74c3c,
    switchActive: 0x27ae60,
    stop: 0xf39c12, // Orange for stops
  },
} as const;

export function calculateSpeedMultiplier(score: number): number {
  const config = GAME_CONFIG.physics.speedProgression;
  const level = Math.floor(score / config.pointsPerSpeedIncrease);
  const multiplier = 1 + level * 0.15; // Each level adds 15% speed
  return Math.min(multiplier, config.maxSpeedMultiplier);
}

export function calculateSpawnInterval(
  score: number,
  baseInterval: number,
): number {
  const config = GAME_CONFIG.physics.speedProgression;
  const level = Math.floor(score / config.pointsPerSpeedIncrease);
  let interval = baseInterval;

  for (let i = 0; i < level; i++) {
    interval *= config.spawnIntervalDecrease;
  }

  return Math.max(interval, config.minSpawnInterval);
}

export function getSpeedLevel(score: number): number {
  return Math.floor(
    score / GAME_CONFIG.physics.speedProgression.pointsPerSpeedIncrease,
  );
}

// Level progression helper functions
export function getGameLevel(score: number): number {
  const levelProgression = GAME_CONFIG.physics.levelProgression;

  if (score >= levelProgression.level2Points) {
    return 2;
  } else if (score >= levelProgression.level1Points) {
    return 1;
  }
  return 0; // Beginner level
}

export function getAvailableTracks(score: number): string[] {
  const level = getGameLevel(score);

  if (level === 0) {
    // Beginner level: only 3 tracks (middle tracks for simplicity)
    return ['track2', 'track3', 'track4'];
  } else if (level === 1) {
    // Basic level: 5 tracks
    return ['track1', 'track2', 'track3', 'track4', 'track5'];
  } else if (level >= 2) {
    // Advanced level: all 6 tracks
    return ['track1', 'track2', 'track3', 'track4', 'track5', 'track6'];
  }

  return ['track2', 'track3', 'track4']; // Default to beginner
}

export function calculateStopDuration(
  baseDuration: number,
  score: number,
): number {
  const level = getGameLevel(score);
  if (level >= 2) {
    return (
      baseDuration * GAME_CONFIG.physics.levelProgression.level2StopMultiplier
    );
  }
  return baseDuration;
}

export function calculateLevelSpawnInterval(
  score: number,
  baseInterval: number,
): number {
  // First apply speed progression
  let interval = calculateSpawnInterval(score, baseInterval);

  // Then apply level-specific multipliers
  const level = getGameLevel(score);
  if (level >= 2) {
    interval *= GAME_CONFIG.physics.levelProgression.level2SpawnMultiplier;
  }

  return Math.max(
    interval,
    GAME_CONFIG.physics.speedProgression.minSpawnInterval,
  );
}
