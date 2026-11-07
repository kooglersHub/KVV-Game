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
      this.drawStation(graphics, index, y);
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

  private drawStation(
    graphics: Phaser.GameObjects.Graphics,
    index: number,
    y: number,
  ): void {
    const destination = DESTINATIONS[index];
    const color = Phaser.Display.Color.HexStringToColor(
      destination.color,
    ).color;
    // The signpost terminates on its own rail, so the destination cannot float between lanes.
    graphics
      .lineStyle(3, color, 0.7)
      .lineBetween(STATION_X, y - 38, STATION_X, y + 10);
    graphics.fillStyle(0xfffcf1).fillRoundedRect(500, y - 80, 244, 42, 10);
    graphics.fillStyle(color).fillRoundedRect(500, y - 80, 44, 42, 10);
    this.scene.add.text(512, y - 74, destination.badge, {
      fontFamily: 'Arial',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffffff',
    });
    this.scene.add.text(555, y - 72, destination.name, {
      fontFamily: 'Arial',
      fontSize: '23px',
      fontStyle: 'bold',
      color: '#263d34',
    });
    graphics.fillStyle(color).fillCircle(STATION_X, y, 17);
    this.scene.add
      .text(STATION_X, y, destination.badge, {
        fontFamily: 'Arial',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    graphics
      .fillStyle(color, 0.55)
      .fillRoundedRect(STATION_X - 42, y + 24, 68, 9, 4);
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
