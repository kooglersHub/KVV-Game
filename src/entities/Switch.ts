import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/game.config';
import { TrackPosition } from '../types';

export type SwitchState = 'straight' | 'connected';

export class Switch extends Phaser.GameObjects.Container {
  private switchState: SwitchState = 'straight';
  private graphics: Phaser.GameObjects.Graphics;
  private hitArea: Phaser.GameObjects.Rectangle;
  private isHovered: boolean = false;
  private sourceTrack: TrackPosition;
  private destinationTrack: TrackPosition;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    sourceTrack: TrackPosition,
    destinationTrack: TrackPosition,
  ) {
    super(scene, x, y);

    this.sourceTrack = sourceTrack;
    this.destinationTrack = destinationTrack;

    // Create graphics for visual representation
    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    // Create invisible hit area for click detection
    this.hitArea = scene.add.rectangle(0, 0, 72, 72);
    this.hitArea.setInteractive({ cursor: 'pointer' });
    this.add(this.hitArea);

    // Setup interaction events
    this.setupInteraction();

    // Draw initial state
    this.draw();

    scene.add.existing(this);
  }

  private setupInteraction(): void {
    this.hitArea.on('pointerdown', () => {
      this.toggle();
    });

    this.hitArea.on('pointerover', () => {
      this.isHovered = true;
      this.draw();
    });

    this.hitArea.on('pointerout', () => {
      this.isHovered = false;
      this.draw();
    });
  }

  toggle(): void {
    this.switchState =
      this.switchState === 'straight' ? 'connected' : 'straight';
    this.draw();

    // Add toggle animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeInOut',
    });

    // Emit event for tracking
    this.scene.events.emit('switchToggled');
  }

  private draw(): void {
    this.graphics.clear();

    const color =
      this.switchState === 'straight'
        ? GAME_CONFIG.colors.switch
        : GAME_CONFIG.colors.switchActive;

    this.graphics.fillStyle(0x263d34, 0.1).fillCircle(0, 4, 33);
    this.graphics.lineStyle(3, 0xfffcf2);
    this.graphics.fillStyle(
      this.switchState === 'straight' ? 0xfffcf2 : color,
      this.isHovered ? 0.9 : 1,
    );
    this.graphics.fillCircle(0, 0, 31).strokeCircle(0, 0, 31);

    // Draw switch direction indicator
    this.graphics.lineStyle(
      4,
      this.switchState === 'straight' ? 0x4c6652 : 0xffffff,
    );
    this.graphics.beginPath();

    if (this.switchState === 'straight') {
      this.graphics.moveTo(-15, 0);
      this.graphics.lineTo(15, 0);
      this.graphics.moveTo(5, -9);
      this.graphics.lineTo(15, 0);
      this.graphics.lineTo(5, 9);
    } else {
      const direction =
        GAME_CONFIG.physics.tracks[this.destinationTrack] >
        GAME_CONFIG.physics.tracks[this.sourceTrack]
          ? 1
          : -1;
      this.graphics.moveTo(-14, -10 * direction);
      this.graphics.lineTo(12, 12 * direction);
      this.graphics.moveTo(12, 0);
      this.graphics.lineTo(12, 12 * direction);
      this.graphics.lineTo(0, 12 * direction);
    }

    this.graphics.strokePath();
  }

  getState(): SwitchState {
    return this.switchState;
  }

  setSwitchState(state: SwitchState): void {
    this.switchState = state;
    this.draw();
  }

  getTargetTrack(incomingTrack: TrackPosition): TrackPosition {
    // Only trains on the source track are affected by this switch
    if (incomingTrack !== this.sourceTrack) {
      return incomingTrack; // Train continues on current track
    }

    // Unidirectional switch logic: only trains from source track can be diverted
    if (this.switchState === 'straight') {
      return incomingTrack; // Continue on source track
    } else {
      // Divert from source track to destination track
      return this.destinationTrack;
    }
  }
}
