import Phaser from 'phaser';
import { Train } from '../entities/Train';
import {
  ACTIVE_TRACKS,
  DESTINATIONS,
  MAX_TRAINS_PER_DESTINATION,
  SPAWN_X,
} from '../config/network.config';
import type { TrackPosition } from '../types';
import { chooseSpawn, type SpawnPlan } from './DispatchPolicy';

type FirstTrain = SpawnPlan & { x: number; track: TrackPosition };

export class TrainManager {
  private trains: Train[] = [];
  private trainGroup: Phaser.Physics.Arcade.Group;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private speedMultiplier = 1;
  private currentSpawnInterval = 6500;

  constructor(private scene: Phaser.Scene) {
    this.trainGroup = scene.physics.add.group({ runChildUpdate: false });
  }

  startSpawning(interval = 6500, firstTrain?: FirstTrain): void {
    this.replaceSpawnTimer(interval);
    if (firstTrain) this.addTrain(firstTrain.x, firstTrain.track, firstTrain);
    else this.spawnTrain();
  }

  private replaceSpawnTimer(interval: number): void {
    const wasPaused = this.spawnTimer?.paused ?? false;
    this.stopSpawning();
    this.currentSpawnInterval = interval;
    this.spawnTimer = this.scene.time.addEvent({
      delay: interval,
      callback: this.spawnTrain,
      callbackScope: this,
      loop: true,
    });
    this.spawnTimer.paused = wasPaused;
  }

  stopSpawning(): void {
    this.spawnTimer?.destroy();
    this.spawnTimer = undefined;
  }

  pauseSpawning(): void {
    if (this.spawnTimer) this.spawnTimer.paused = true;
  }
  resumeSpawning(): void {
    if (this.spawnTimer) this.spawnTimer.paused = false;
  }

  updateSpawnInterval(interval: number): void {
    if (interval !== this.currentSpawnInterval && this.spawnTimer)
      this.replaceSpawnTimer(interval);
  }

  updateSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier;
    this.trains.forEach((train) => train.updateSpeedMultiplier(multiplier));
  }

  private spawnTrain(): void {
    const visible = this.trains.filter(
      (train) => train.active && !train.isOffScreen(),
    );
    if (visible.length >= DESTINATIONS.length * MAX_TRAINS_PER_DESTINATION)
      return;
    const snapshots = visible.map((train) => ({
      destination: train.getData('destination') as number,
      speed: train.getSpeed(),
      track: train.getCurrentTrack(),
      x: train.x,
    }));
    const firstTrack = Math.floor(Math.random() * ACTIVE_TRACKS.length);
    for (let index = 0; index < ACTIVE_TRACKS.length; index++) {
      const track = ACTIVE_TRACKS[(firstTrack + index) % ACTIVE_TRACKS.length];
      const plan = chooseSpawn(snapshots, track);
      if (!plan) continue;
      this.addTrain(SPAWN_X, track, plan);
      return;
    }
  }

  private addTrain(x: number, track: TrackPosition, plan: SpawnPlan): void {
    const train = new Train(this.scene, x, track, plan.speed);
    // Reserve before another spawn or frame can run, including the slow intro.
    train.setData('destination', plan.destination);
    this.trains.push(train);
    this.trainGroup.add(train);
    train.updateSpeedMultiplier(this.speedMultiplier);
  }

  update(): void {
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

  getTrains(): Train[] {
    return this.trains;
  }
  getTrainGroup(): Phaser.Physics.Arcade.Group {
    return this.trainGroup;
  }
  pauseAllTrains(): void {
    this.trains.forEach((train) => train.pause());
  }
  resumeAllTrains(): void {
    this.trains.forEach((train) => train.resume());
  }

  clear(): void {
    this.stopSpawning();
    this.trains.forEach((train) => train.destroy());
    this.trains = [];
    this.trainGroup.clear(false, false);
  }
}
