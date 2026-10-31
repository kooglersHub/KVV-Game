import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

// PLAYWRIGHT_MODULE allows using a preinstalled browser-test runtime.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1024, height: 768 },
  hasTouch: true,
});
const errors = [];
page.on('pageerror', (error) => {
  errors.push(error.message);
  console.error(error.stack);
});
await mkdir('test-results', { recursive: true });
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
  await page.screenshot({ path: 'test-results/menu.png' });
  await page.locator('#help').tap();
  await page.locator('#dialog-primary').tap();
  await page.waitForTimeout(3500);
  assert.equal(await page.locator('canvas').count(), 1);
  assert.notEqual(await page.locator('#time').innerText(), '1:30');
  await page.locator('#pause').tap();
  const frozen = await page.locator('#time').innerText();
  await page.waitForTimeout(1300);
  assert.equal(await page.locator('#time').innerText(), frozen);
  await page.locator('#dialog-primary').tap();
  await page.locator('canvas').tap({ position: { x: 180, y: 145 } });
  await page.screenshot({ path: 'test-results/game.png' });
  await page.locator('#game-help').tap();
  await page.locator('#dialog-secondary').tap();
  assert.equal(await page.locator('#menu').isVisible(), true);
  await page.locator('#start').tap();
  const first = await page.evaluate(() => window.dispatches.at(-1));
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('#score').innerText(), '0');
  if (first.source === 'track2')
    await page.locator('canvas').tap({ position: { x: 180, y: 145 } });
  if (first.source === 'track4')
    await page.locator('canvas').tap({ position: { x: 180, y: 395 } });
  if (first.target === 'track2')
    await page.locator('canvas').tap({ position: { x: 430, y: 270 } });
  if (first.target === 'track4')
    await page.locator('canvas').tap({ position: { x: 680, y: 270 } });
  await page.clock.runFor(15000);
  assert.ok(
    Number(await page.locator('#score').innerText()) >= 10,
    'routing the first train to its destination earns points',
  );
  await page.screenshot({ path: 'test-results/gameplay.png' });
  await page.setViewportSize({ width: 800, height: 600 });
  await page.clock.runFor(100);
  const bounds = await page.locator('#kiosk').boundingBox();
  assert.ok(
    Math.abs(bounds.width - 800) < 1 && Math.abs(bounds.height - 600) < 1,
  );
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.clock.runFor(100);
  for (let step = 0; step < 7; step++) {
    await page.clock.runFor(15000);
    if (await page.locator('#overlay').isVisible()) break;
    await page.locator('.game-name').tap();
  }
  assert.equal(await page.locator('#overlay').isVisible(), true);
  assert.ok(Number(await page.locator('#score').innerText()) > 0);
  await page.screenshot({ path: 'test-results/result.png' });
  await page.locator('#dialog-primary').tap();
  await page.clock.runFor(1000);
  assert.equal(await page.locator('#overlay').isVisible(), false);
  await page.clock.fastForward(65000);
  await page.clock.runFor(2000);
  assert.equal(await page.locator('#menu').isVisible(), true);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: menu, help, start, timer, pause/resume, touch switch, home, restart, scaling, round result, scoring, idle reset; no browser errors.',
  );
} finally {
  await browser.close();
}
