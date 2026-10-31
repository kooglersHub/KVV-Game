import Phaser from 'phaser';
import { TrainManager } from '../systems/TrainManager';
import { CollisionManager } from '../systems/CollisionManager';
import { TrackSystem } from '../systems/TrackSystem';
import { StorageManager } from '../systems/StorageManager';
import { Train } from '../entities/Train';
import { ROUND_SECONDS } from '../config/kiosk.config';
import { notifyUI } from '../ui/events';
import { prepareTramTexture } from '../ui/tramTexture';
import {
  DESTINATIONS,
  DispatchRules,
  trafficAt,
} from '../systems/DispatchRules';

export class MainScene extends Phaser.Scene {
  private trains!: TrainManager;
  private tracks!: TrackSystem;
  private rules = new DispatchRules();
  private remaining = ROUND_SECONDS;
  private finished = false;
  private paused = false;
  private trainArt = new Map<Train, Phaser.GameObjects.Image>();
  private labels = new Map<Train, Phaser.GameObjects.Text>();
  private feedback!: Phaser.GameObjects.Text;
  private dispatchCount = 0;

  constructor() {
    super('MainScene');
  }

  create(): void {
    this.rules = new DispatchRules();
    this.dispatchCount = 0;
    this.remaining = ROUND_SECONDS;
    this.finished = false;
    this.paused = false;
    this.trainArt.clear();
    this.labels.clear();
    prepareTramTexture(this);
    this.tracks = new TrackSystem(this);
    this.tracks.drawTracksWithSwitches();
    this.feedback = this.add
      .text(
        1000,
        26,
        'Ziel auf der Bahn beachten!\nBahn antippen = einmal 2 s bremsen',
        {
          fontFamily: 'Arial',
          fontSize: '17px',
          color: '#3f6149',
          align: 'right',
          lineSpacing: 6,
        },
      )
      .setOrigin(1, 0);
    Train.setGeneratedStops(this.tracks.getGeneratedStops());
    this.trains = new TrainManager(this);
    this.trains.setGeneratedLayout(this.tracks.getGeneratedLayout());
    const collisions = new CollisionManager(this);
    collisions.setupCollisions(this.trains.getTrainGroup());
    collisions.onCollision(() => this.finish('collision'));
    this.trains.updateSpeedMultiplier(trafficAt(0).speed);
    this.trains.startSpawning(trafficAt(0).interval);
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.paused || this.finished || this.remaining === 0) return;
        if (this.remaining > 0) this.remaining--;
        const traffic = trafficAt(ROUND_SECONDS - this.remaining);
        this.trains.updateSpeedMultiplier(traffic.speed);
        if (this.remaining > 0)
          this.trains.updateSpawnInterval(traffic.interval);
        else this.trains.stopSpawning();
        this.report();
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
        this.labels.get(train)?.destroy();
        this.labels.delete(train);
        this.trainArt.delete(train);
      }
    });
    this.trains.getTrains().forEach((train) => {
      let art = this.trainArt.get(train);
      if (!art) {
        train.setFillStyle(0, 0).setStrokeStyle(0);
        art = this.add.image(train.x, train.y, 'kvv-tram').setDepth(5);
        this.assignDestination(train, art);
        this.trainArt.set(train, art);
      }
      art.setPosition(train.x, train.y).setAlpha(train.alpha);
      this.labels
        .get(train)
        ?.setPosition(train.x, train.y + (train.getData('scored') ? 36 : -39));
      this.tracks.getSwitches().forEach((point) => train.checkSwitch(point));
      if (train.x >= 820 && !train.getData('scored')) {
        train.setData('scored', true);
        const target = DESTINATIONS[train.getData('destination') as number];
        const points = this.rules.arrive(train.getCurrentTrack(), target.track);
        const label = this.labels.get(train);
        label?.setText(
          points ? `+${points} · Angekommen!` : `Ziel war ${target.badge}!`,
        );
        label?.setBackgroundColor(points ? '#326745' : '#b52c40');
        label
          ?.setFontSize(13)
          .setOrigin(0.5, 0)
          .setY(train.y + 36);
        this.feedback.setText(
          points
            ? `+${points} · ${target.name}\n${this.rules.streak} richtige Ankünfte in Folge`
            : `Falscher Halt! Ziel: ${target.name}\n${this.rules.mistakes} von 3 Fehlleitungen`,
        );
        this.report();
        if (this.rules.mistakes >= 3) this.finish('mistakes');
      }
    });
    if (
      !this.finished &&
      this.remaining === 0 &&
      this.trains.getTrains().every((train) => train.getData('scored'))
    )
      this.finish('complete');
  }

  private assignDestination(train: Train, art: Phaser.GameObjects.Image): void {
    const current = DESTINATIONS.findIndex(
      (destination) => destination.track === train.getCurrentTrack(),
    );
    // The first train needs a diversion; every target remains reachable before x=680.
    const targetIndex =
      (current + 1 + (this.dispatchCount++ % 2)) % DESTINATIONS.length;
    const target = DESTINATIONS[targetIndex];
    train.setData('destination', targetIndex);
    notifyUI('dispatch', {
      source: train.getCurrentTrack(),
      target: target.track,
      name: target.name,
    });
    const label = this.add
      .text(train.x, train.y - 39, `${target.badge} · ${target.name}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: target.color,
        padding: { x: 7, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(6);
    this.labels.set(train, label);
    art.setInteractive(
      new Phaser.Geom.Rectangle(0, -14, 96, 72),
      Phaser.Geom.Rectangle.Contains,
    );
    art.on('pointerdown', () => {
      if (
        this.finished ||
        this.paused ||
        train.getData('braked') ||
        train.getData('scored')
      )
        return;
      if (
        !train.brakeOnce(() => {
          if (art.active) art.clearTint();
        })
      )
        return;
      train.setData('braked', true);
      art.setTint(0x96d7e8);
      this.feedback.setText(
        'Bremse aktiv · 2 Sekunden\nDiese Bahn fährt gleich selbst weiter.',
      );
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
      score: this.rules.score,
      seconds: this.remaining,
      paused: this.paused,
      streak: this.rules.streak,
      mistakes: this.rules.mistakes,
      phase:
        this.remaining === 0
          ? 'Letzte Bahnen'
          : trafficAt(ROUND_SECONDS - this.remaining).name,
    });
  }

  private finish(reason: 'collision' | 'complete' | 'mistakes'): void {
    if (this.finished) return;
    this.finished = true;
    this.trains.stopSpawning();
    this.trains.pauseAllTrains();
    this.physics.pause();
    StorageManager.updateHighScore(this.rules.score);
    notifyUI('result', {
      reason,
      score: this.rules.score,
      delivered: this.rules.delivered,
      mistakes: this.rules.mistakes,
      best: StorageManager.getHighScore(),
    });
  }
}
