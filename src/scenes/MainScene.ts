import Phaser from 'phaser';
import { TrainManager } from '../systems/TrainManager';
import { CollisionManager } from '../systems/CollisionManager';
import { TrackSystem } from '../systems/TrackSystem';
import { StorageManager } from '../systems/StorageManager';
import { Train } from '../entities/Train';
import { ROUND_SECONDS } from '../config/kiosk.config';
import { notifyUI } from '../ui/events';
import { prepareTramTexture } from '../ui/tramTexture';

export class MainScene extends Phaser.Scene {
  private trains!: TrainManager;
  private tracks!: TrackSystem;
  private score = 0;
  private remaining = ROUND_SECONDS;
  private finished = false;
  private paused = false;
  private trainArt = new Map<Train, Phaser.GameObjects.Image>();

  constructor() {
    super('MainScene');
  }

  create(): void {
    this.score = 0;
    this.remaining = ROUND_SECONDS;
    this.finished = false;
    this.paused = false;
    this.trainArt.clear();
    prepareTramTexture(this);
    this.tracks = new TrackSystem(this);
    this.tracks.drawTracksWithSwitches();
    Train.setGeneratedStops(this.tracks.getGeneratedStops());
    this.trains = new TrainManager(this);
    this.trains.setGeneratedLayout(this.tracks.getGeneratedLayout());
    const collisions = new CollisionManager(this);
    collisions.setupCollisions(this.trains.getTrainGroup());
    collisions.onCollision(() => this.finish('collision'));
    this.trains.startSpawning(2400);
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.paused || this.finished) return;
        this.remaining--;
        this.report();
        if (this.remaining <= 0) this.finish('complete');
      },
    });
    // Phaser destroys the physics group during shutdown; only stop our timer here.
    this.events.once('shutdown', () => this.trains.stopSpawning());
    this.report();
  }

  update(): void {
    if (this.paused || this.finished) return;
    this.trains.update();
    this.trainArt.forEach((art, train) => {
      if (!train.active) {
        art.destroy();
        this.trainArt.delete(train);
      }
    });
    this.trains.getTrains().forEach((train) => {
      let art = this.trainArt.get(train);
      if (!art) {
        train.setFillStyle(0, 0).setStrokeStyle(0);
        art = this.add.image(train.x, train.y, 'kvv-tram').setDepth(5);
        this.trainArt.set(train, art);
      }
      art.setPosition(train.x, train.y).setAlpha(train.alpha);
      this.tracks.getSwitches().forEach((point) => train.checkSwitch(point));
      if (train.x > 1060 && !train.getData('scored')) {
        train.setData('scored', true);
        this.score += 10;
        this.trains.updateSpeedMultiplier(Math.min(1.5, 1 + this.score / 500));
        this.trains.updateSpawnInterval(Math.max(1500, 2400 - this.score * 4));
        this.report();
      }
    });
  }

  setPaused(paused: boolean): void {
    if (this.finished) return;
    this.paused = paused;
    // The whole scene freezes, including station timers, physics and touch input.
    if (paused) this.scene.pause();
    else this.scene.resume();
    this.report();
  }

  private report(): void {
    notifyUI('status', {
      score: this.score,
      seconds: this.remaining,
      paused: this.paused,
    });
  }

  private finish(reason: 'collision' | 'complete'): void {
    if (this.finished) return;
    this.finished = true;
    this.trains.stopSpawning();
    this.trains.pauseAllTrains();
    this.physics.pause();
    StorageManager.updateHighScore(this.score);
    notifyUI('result', {
      reason,
      score: this.score,
      best: StorageManager.getHighScore(),
    });
  }
}
