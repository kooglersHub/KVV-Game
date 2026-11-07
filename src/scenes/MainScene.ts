import Phaser from 'phaser';
import { TrainManager } from '../systems/TrainManager';
import { CollisionManager } from '../systems/CollisionManager';
import { TrackSystem } from '../systems/TrackSystem';
import { StorageManager } from '../systems/StorageManager';
import { Train } from '../entities/Train';
import { INTRO_TRAIN } from '../config/network.config';
import { ARRIVAL_X } from '../config/kiosk.config';
import { GAME_CONFIG } from '../config/game.config';
import { RoundClock } from '../systems/RoundClock';
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
  private clock = new RoundClock();
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
    this.clock = new RoundClock();
    this.finished = false;
    this.paused = false;
    this.trainArt.clear();
    this.labels.clear();
    prepareTramTexture(this);
    this.tracks = new TrackSystem(this);
    this.tracks.drawTracksWithSwitches();
    this.feedback = this.add
      .text(32, 77, this.preparationHint(), {
        fontFamily: 'Arial',
        fontSize: '21px',
        color: '#3f6149',
        align: 'left',
        lineSpacing: 6,
      })
      .setOrigin(0, 0);
    Train.setGeneratedStops(this.tracks.getGeneratedStops());
    this.trains = new TrainManager(this);
    const collisions = new CollisionManager(this);
    collisions.setupCollisions(this.trains.getTrainGroup());
    collisions.onCollision(() => this.finish('collision'));
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.paused || this.finished || this.clock.remaining === 0) return;
        const wasPreparing = this.clock.preparing;
        this.clock.tick();
        if (wasPreparing) {
          this.feedback.setText(this.preparationHint());
          if (!this.clock.preparing) {
            const traffic = trafficAt(0);
            this.trains.updateSpeedMultiplier(traffic.speed);
            // The short guide and countdown precede a visible, predictable first tram.
            this.trains.startSpawning(traffic.interval, INTRO_TRAIN);
            // Let the learning tram arrive before faster traffic can catch it.
            this.trains.pauseSpawning();
          }
          this.report();
          return;
        }
        const traffic = trafficAt(this.clock.elapsed);
        this.trains.updateSpeedMultiplier(traffic.speed);
        if (this.clock.remaining > 0)
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
        // Physics rectangles stay active for collisions but never appear as artwork.
        train.setVisible(false);
        art = this.add.image(train.x, train.y, 'kvv-tram').setDepth(5);
        this.assignDestination(train, art);
        this.trainArt.set(train, art);
      }
      art.setPosition(train.x, train.y).setAlpha(train.alpha);
      this.labels
        .get(train)
        ?.setPosition(
          Phaser.Math.Clamp(train.x, 96, GAME_CONFIG.width - 96),
          train.y + (train.getData('scored') ? 36 : -43),
        );
      this.tracks.getSwitches().forEach((point) => train.checkSwitch(point));
      if (train.x >= ARRIVAL_X && !train.getData('scored')) {
        train.setData('scored', true);
        const target = DESTINATIONS[train.getData('destination') as number];
        const points = this.rules.arrive(train.getCurrentTrack(), target.track);
        if (this.dispatchCount === 1) this.trains.resumeSpawning();
        const label = this.labels.get(train);
        label?.setText(
          points
            ? `+${points} · ${this.rules.streak > 1 ? `${this.rules.streak}er-Kombo!` : 'Angekommen!'}`
            : `Ziel: ${target.name}`,
        );
        label?.setBackgroundColor(points ? '#326745' : '#b52c40');
        label
          ?.setFontSize(13)
          .setOrigin(0.5, 0)
          .setY(train.y + 36);
        this.feedback.setText(
          points
            ? `+${points} · ${target.name}\n${this.rules.streak > 1 ? `${this.rules.streak}er-Kombo · weiter so!` : 'Richtig! Die nächste Ankunft bringt +20.'}`
            : `Falscher Halt! Ziel: ${target.name}\n${this.rules.mistakes} von 3 Fehlleitungen`,
        );
        this.report();
        if (this.rules.mistakes >= 3) this.finish('mistakes');
      }
    });
    if (
      !this.finished &&
      this.clock.remaining === 0 &&
      this.trains.getTrains().every((train) => train.getData('scored'))
    )
      this.finish('complete');
  }

  private assignDestination(train: Train, art: Phaser.GameObjects.Image): void {
    const targetIndex = train.getData('destination') as number;
    const target = DESTINATIONS[targetIndex];
    this.dispatchCount++;
    notifyUI('dispatch', {
      source: train.getCurrentTrack(),
      target: target.track,
      name: target.name,
    });
    const label = this.add
      .text(train.x, train.y - 39, `→ ${target.badge} · ${target.name}`, {
        fontFamily: 'Arial',
        fontSize: '20px',
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

  private preparationHint(): string {
    return this.clock.preparing
      ? `Abfahrt in ${this.clock.preparation} · Schau dir die Weichen an.\nErstes Ziel: M · Weiche oben links antippen.`
      : 'Los geht’s! Erste Bahn → M Marktplatz.\nDie Weiche oben links führt zum Marktplatz.';
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
      seconds: this.clock.remaining,
      paused: this.paused,
      streak: this.rules.streak,
      mistakes: this.rules.mistakes,
      preparation: this.clock.preparation,
      phase: this.clock.preparing
        ? `Abfahrt in ${this.clock.preparation}`
        : this.clock.remaining === 0
          ? 'Letzte Bahnen'
          : trafficAt(this.clock.elapsed).name,
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
