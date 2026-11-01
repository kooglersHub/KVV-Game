import Phaser from 'phaser';

/** Reuse one small texture for every tram instead of redrawing each frame. */
export function prepareTramTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('kvv-tram')) return;
  const art = scene.make.graphics({ x: 0, y: 0 });
  art.fillStyle(0x35483e).fillRoundedRect(13, 32, 65, 10, 5);
  art.fillStyle(0xf4c63d).fillRoundedRect(4, 3, 86, 34, 13);
  art.fillStyle(0xc32b3e).fillRect(7, 26, 79, 7);
  art.fillStyle(0x8cc8c3).fillRoundedRect(12, 7, 47, 16, 4);
  art.fillStyle(0x476963).fillRoundedRect(66, 7, 17, 16, 4);
  art
    .lineStyle(2, 0xf4c63d)
    .lineBetween(30, 7, 30, 23)
    .lineBetween(48, 7, 48, 23);
  art
    .fillStyle(0xffffff)
    .fillEllipse(77, 17, 10, 13)
    .fillEllipse(86, 17, 9, 13);
  art.fillStyle(0x263d34).fillCircle(79, 18, 2.5).fillCircle(88, 18, 2.5);
  art
    .lineStyle(2, 0x263d34)
    .lineBetween(78, 29, 83, 31)
    .lineBetween(83, 31, 88, 28);
  art
    .lineStyle(2, 0x4a6358)
    .lineBetween(38, 3, 44, 0)
    .lineBetween(44, 0, 54, 0);
  art.generateTexture('kvv-tram', 96, 44);
  art.destroy();
}
