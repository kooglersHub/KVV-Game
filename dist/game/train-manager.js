import { chooseSpawn } from './dispatch-policy.js';
import { DESTINATIONS, MAX_TRAINS_PER_DESTINATION, SPAWN_X, TRACKS } from './network.js';

export function createTrainManager(Train) {
  return class TrainManager {
    constructor(scene) {
      this.scene = scene;
      this.trains = [];
      this.trainGroup = scene.physics.add.group({ runChildUpdate: false });
      this.speedMultiplier = 1;
      this.currentSpawnInterval = 4400;
      this.spawnTimer = null;
    }

    setGeneratedLayout(layout) { this.generatedLayout = layout; }
    getTrains() { return this.trains; }
    getTrainGroup() { return this.trainGroup; }

    startSpawning(interval = 4400) {
      this.replaceSpawnTimer(interval);
      this.spawnTrain();
    }

    replaceSpawnTimer(interval) {
      this.stopSpawning();
      this.currentSpawnInterval = interval;
      this.spawnTimer = this.scene.time.addEvent({
        delay: interval, callback: this.spawnTrain, callbackScope: this, loop: true,
      });
    }

    stopSpawning() {
      this.spawnTimer?.destroy();
      this.spawnTimer = null;
    }

    updateSpawnInterval(interval) {
      if (this.currentSpawnInterval !== interval) this.replaceSpawnTimer(interval);
    }

    updateSpeedMultiplier(multiplier) {
      this.speedMultiplier = multiplier;
      this.trains.forEach((train) => train.updateSpeedMultiplier(multiplier));
    }

    spawnTrain() {
      const visible = this.trains.filter((train) => train.active && !train.isOffScreen());
      if (visible.length >= DESTINATIONS.length * MAX_TRAINS_PER_DESTINATION) return;
      const snapshots = visible.map((train) => ({
        destination: train.getData('destination'), speed: train.getSpeed(),
        track: train.getCurrentTrack(), x: train.x,
      }));
      const firstTrack = Math.floor(Math.random() * TRACKS.length);
      for (let index = 0; index < TRACKS.length; index++) {
        const track = TRACKS[(firstTrack + index) % TRACKS.length];
        const plan = chooseSpawn(snapshots, track);
        if (!plan) continue;
        const train = new Train(this.scene, SPAWN_X, track, plan.speed);
        // Reserve the destination before another spawn or render can run.
        train.setData('destination', plan.destination);
        this.trains.push(train);
        this.trainGroup.add(train);
        train.updateSpeedMultiplier(this.speedMultiplier);
        return;
      }
      // Full destinations or blocked entries defer the spawn until the next tick.
    }

    update() {
      this.trains.forEach((train) => train.update());
      this.trains = this.trains.filter((train) => {
        if (!train.active || train.isOffScreen()) {
          this.trainGroup.remove(train);
          if (train.active) train.destroy();
          return false;
        }
        return true;
      });
    }

    pauseAllTrains() { this.trains.forEach((train) => train.pause()); }
    resumeAllTrains() { this.trains.forEach((train) => train.resume()); }

    clear() {
      this.stopSpawning();
      this.trains.forEach((train) => train.destroy());
      this.trains = [];
      this.trainGroup.clear(false, false);
    }
  };
}
