import Phaser from 'phaser';
import { Switch } from '../entities/Switch';
import { GAME_CONFIG } from '../config/game.config';
import { createKioskLayout, STATIONS } from '../config/kiosk.config';
import type { GeneratedLayout, StopsMap } from '../types/layout';
import { DESTINATIONS } from './DispatchRules';

export class TrackSystem {
  private switches: Switch[] = [];
  private generatedLayout = createKioskLayout();

  constructor(private scene: Phaser.Scene) {}

  drawTracksWithSwitches(): void {
    const graphics = this.scene.add.graphics();
    const tracks = ['track2', 'track3', 'track4'] as const;
    tracks.forEach((track, index) => {
      const y = GAME_CONFIG.physics.tracks[track];
      graphics.fillStyle(0xdde3d3).fillRoundedRect(0, y - 22, 1024, 44, 12);
      graphics.lineStyle(3, 0xa4afa0);
      for (let x = 10; x < 1024; x += 22)
        graphics.lineBetween(x, y - 12, x, y + 12);
      graphics.lineStyle(3, 0x7d8d82);
      graphics.lineBetween(0, y - 7, 1024, y - 7);
      graphics.lineBetween(0, y + 7, 1024, y + 7);
      this.scene.add.text(24, y - 59, ['S2', 'S1', 'S4'][index], {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#42644e',
        backgroundColor: '#d8e6cd',
        padding: { x: 10, y: 4 },
      });
      graphics.fillStyle(0xfffcf1).fillRoundedRect(775, y - 65, 225, 37, 8);
      this.scene.add.text(
        811,
        y - 57,
        `${DESTINATIONS[index].badge} · ${STATIONS[index]}`,
        {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: DESTINATIONS[index].color,
        },
      );
      graphics.fillStyle(0xf5c640).fillCircle(793, y - 47, 11);
      this.scene.add.text(786, y - 57, 'H', {
        fontSize: '18px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#496d49',
      });
      graphics.fillStyle(0xecc768).fillRoundedRect(815, y + 24, 90, 9, 4);
    });
    this.generatedLayout.connections.forEach(({ x, source, target }) => {
      const from = GAME_CONFIG.physics.tracks[source];
      const to = GAME_CONFIG.physics.tracks[target];
      graphics.lineStyle(7, 0xa3b29a, 0.7);
      graphics.beginPath().moveTo(x, from);
      for (let i = 1; i <= 16; i++) {
        const t = i / 16;
        graphics.lineTo(x + 80 * t, from + (to - from) * t * t);
      }
      graphics.strokePath();
      this.switches.push(new Switch(this.scene, x, from, source, target));
    });
    this.scene.add.text(24, 20, 'DEIN STELLWERK', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#728477',
      letterSpacing: 3,
    });
    this.scene.add.text(24, 43, 'Freie Fahrt durch Karlsruhe.', {
      fontSize: '27px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#263d34',
    });
    this.scene.add
      .text(
        1000,
        495,
        'ZIEL ERREICHEN  ·  SERIE AUFBAUEN  ·  BAHN ANTIPPEN ZUM BREMSEN',
        {
          fontSize: '13px',
          fontFamily: 'Arial',
          color: '#62776a',
        },
      )
      .setOrigin(1, 0);
  }

  getSwitchAtPosition(x: number): Switch | undefined {
    return this.switches.find((item) => Math.abs(item.x - x) < 40);
  }
  getSwitches(): Switch[] {
    return this.switches;
  }
  getGeneratedStops(): StopsMap {
    return this.generatedLayout.stops;
  }
  getGeneratedLayout(): GeneratedLayout {
    return this.generatedLayout;
  }
}
