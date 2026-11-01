import Phaser from 'phaser';
import { Switch } from '../entities/Switch';
import { GAME_CONFIG } from '../config/game.config';
import { createKioskLayout, STATION_X } from '../config/kiosk.config';
import type { GeneratedLayout, StopsMap } from '../types/layout';
import { DESTINATIONS } from './DispatchRules';

export class TrackSystem {
  private switches: Switch[] = [];
  private connections!: Phaser.GameObjects.Graphics;
  private generatedLayout = createKioskLayout();

  constructor(private scene: Phaser.Scene) {}

  drawTracksWithSwitches(): void {
    const graphics = this.scene.add.graphics();
    const tracks = DESTINATIONS.map((destination) => destination.track);
    tracks.forEach((track, index) => {
      const y = GAME_CONFIG.physics.tracks[track];
      graphics
        .fillStyle(0xdde3d3)
        .fillRoundedRect(0, y - 22, GAME_CONFIG.width, 44, 12);
      graphics.lineStyle(3, 0xa4afa0);
      for (let x = 10; x < GAME_CONFIG.width; x += 22)
        graphics.lineBetween(x, y - 12, x, y + 12);
      graphics.lineStyle(3, 0x7d8d82);
      graphics.lineBetween(0, y - 7, GAME_CONFIG.width, y - 7);
      graphics.lineBetween(0, y + 7, GAME_CONFIG.width, y + 7);
      this.scene.add.text(24, y + 24, DESTINATIONS[index].line, {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#42644e',
        backgroundColor: '#d8e6cd',
        padding: { x: 10, y: 4 },
      });
      graphics.fillStyle(0xfffcf1).fillRoundedRect(520, y - 100, 224, 42, 10);
      this.scene.add.text(569, y - 88, DESTINATIONS[index].name, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: DESTINATIONS[index].color,
      });
      const color = Phaser.Display.Color.HexStringToColor(
        DESTINATIONS[index].color,
      ).color;
      graphics.fillStyle(color).fillRoundedRect(520, y - 100, 38, 42, 10);
      this.scene.add.text(531, y - 92, DESTINATIONS[index].badge, {
        fontSize: '23px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#ffffff',
      });
      graphics
        .fillStyle(0xecc768)
        .fillRoundedRect(STATION_X - 42, y + 24, 68, 9, 4);
    });
    this.connections = this.scene.add.graphics().setDepth(-1);
    this.generatedLayout.connections.forEach(({ x, source, target }) => {
      const from = GAME_CONFIG.physics.tracks[source];
      this.switches.push(new Switch(this.scene, x, from, source, target));
    });
    this.drawConnections();
    const redraw = () => this.drawConnections();
    this.scene.events.on('switchToggled', redraw);
    this.scene.events.once('shutdown', () =>
      this.scene.events.off('switchToggled', redraw),
    );
    this.scene.add.text(32, 24, 'DEIN STELLWERK', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#728477',
      letterSpacing: 3,
    });
    this.scene.add.text(32, 45, 'Nächster Halt: dein Rekord.', {
      fontSize: '25px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#263d34',
    });
    graphics.fillStyle(0xfffcf1).fillRoundedRect(24, 652, 720, 36, 12);
    graphics.fillStyle(0x27ae60).fillCircle(47, 670, 8);
    this.scene.add.text(65, 660, 'Grün = Abzweig', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#3e6149',
    });
    this.scene.add.text(368, 660, '→ Geradeaus    ↗ Gleiswechsel', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#3e6149',
    });
  }

  private drawConnections(): void {
    this.connections.clear();
    this.generatedLayout.connections.forEach(({ x, source, target }, index) => {
      const from = GAME_CONFIG.physics.tracks[source];
      const to = GAME_CONFIG.physics.tracks[target];
      const active = this.switches[index].getState() === 'connected';
      this.connections.lineStyle(
        active ? 8 : 5,
        active ? 0x27ae60 : 0xa3b29a,
        active ? 1 : 0.65,
      );
      this.connections.beginPath().moveTo(x, from);
      for (let i = 1; i <= 16; i++) {
        const t = i / 16;
        this.connections.lineTo(x + 80 * t, from + (to - from) * t * t);
      }
      this.connections.strokePath();
    });
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
