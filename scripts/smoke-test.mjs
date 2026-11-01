import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 768, height: 1024 },
  hasTouch: true,
});
const errors = [];
page.on('pageerror', (error) => {
  errors.push(error.message);
  console.error(error.stack);
});
await mkdir('test-results', { recursive: true });
const shot = (name) => page.screenshot({ path: `test-results/${name}.png` });
try {
  await page.addInitScript(() => {
    window.dispatches = [];
    window.addEventListener('kvv:dispatch', (event) =>
      window.dispatches.push(event.detail),
    );
  });
  await page.clock.install();
  await page.goto('http://127.0.0.1:3000');
  await page.locator('#start').waitFor();
  await page.clock.runFor(200);
  await shot('menu');
  await page.locator('#help').tap();
  assert.ok(
    await page
      .locator('.dialog')
      .evaluate((dialog) => dialog.scrollHeight <= dialog.clientHeight),
    'help fits without scrolling',
  );
  await shot('help');
  await page.locator('#dialog-primary').tap();
  await page.clock.runFor(1100);
  assert.equal(await page.locator('canvas').count(), 1);
  assert.equal(await page.locator('#time').innerText(), '1:30');
  assert.equal(
    await page.evaluate(() => window.dispatches.length),
    0,
    'no trains during preparation',
  );
  await shot('preparation');
  await page.locator('#pause').tap();
  const frozen = await page.locator('#dispatch-status').innerText();
  await page.clock.runFor(4000);
  assert.equal(
    await page.locator('#dispatch-status').innerText(),
    frozen,
    'pause freezes countdown',
  );
  await shot('pause');
  await page.locator('#dialog-primary').tap();
  await page.clock.runFor(4500);
  assert.equal(await page.evaluate(() => window.dispatches.length), 1);
  assert.deepEqual(await page.evaluate(() => window.dispatches[0]), {
    source: 'track1',
    target: 'track2',
    name: 'Marktplatz',
  });
  await shot('first-tram');
  await page.clock.runFor(3000);
  assert.equal(await page.locator('#score').innerText(), '0');
  await page.locator('canvas').tap({ position: { x: 210, y: 210 } });
  await page.clock.runFor(120);
  await shot('game');
  await page.clock.runFor(21000);
  assert.ok(
    Number(await page.locator('#score').innerText()) >= 10,
    'first tram can still be routed after three seconds',
  );
  assert.equal(
    await page.evaluate(() => window.dispatches.length),
    1,
    'the learning tram runs alone until its first arrival',
  );
  await shot('gameplay');
  await page.locator('#game-help').tap();
  await page.locator('#dialog-secondary').tap();
  assert.equal(await page.locator('#menu').isVisible(), true);
  for (const [width, height] of [
    [600, 800],
    [1080, 1920],
    [1024, 768],
    [768, 1024],
  ]) {
    await page.setViewportSize({ width, height });
    const scale = Math.min(width / 768, height / 1024);
    let bounds;
    // Browser resize events can arrive after the controlled game clock advances.
    for (let attempt = 0; attempt < 10; attempt++) {
      await page.clock.runFor(100);
      bounds = await page.locator('#kiosk').boundingBox();
      if (
        Math.abs(bounds.width - 768 * scale) < 1 &&
        Math.abs(bounds.height - 1024 * scale) < 1
      )
        break;
      await page.waitForTimeout(50);
    }
    assert.ok(
      Math.abs(bounds.width - 768 * scale) < 1 &&
        Math.abs(bounds.height - 1024 * scale) < 1,
    );
    assert.ok(
      bounds.x >= -1 &&
        bounds.y >= -1 &&
        bounds.x + bounds.width <= width + 1 &&
        bounds.y + bounds.height <= height + 1,
    );
  }
  await page.locator('#start').tap();
  await page.clock.runFor(6000);
  await page.locator('canvas').tap({ position: { x: 210, y: 210 } });
  for (let step = 0; step < 9; step++) {
    await page.clock.runFor(15000);
    if (await page.locator('#overlay').isVisible()) break;
    await page.locator('.game-name').tap();
  }
  assert.equal(await page.locator('#overlay').isVisible(), true);
  assert.ok(Number(await page.locator('#score').innerText()) >= 10);
  await shot('result');
  await page.locator('#dialog-primary').tap();
  await page.clock.runFor(1000);
  assert.equal(await page.locator('#overlay').isVisible(), false);
  assert.equal(await page.locator('#time').innerText(), '1:30');
  assert.match(
    await page.locator('#dispatch-status').innerText(),
    /Abfahrt in/,
  );
  await page.clock.fastForward(65000);
  await page.clock.runFor(2000);
  assert.equal(await page.locator('#menu').isVisible(), true);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: portrait menu/help, five-second preparation, paused countdown, predictable slow first tram, touch routing and scoring, four viewport sizes, result, restart, idle reset; no browser errors.',
  );
} catch (error) {
  await shot('failure');
  console.error(
    await page.locator('#dispatch-status').innerText(),
    await page.locator('#score').innerText(),
    await page.locator('#dialog-title').innerText(),
  );
  throw error;
} finally {
  await browser.close();
}
