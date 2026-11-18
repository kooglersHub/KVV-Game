import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browserName = process.env.KVV_BROWSER || 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(browserName));
const gameUrl = process.env.KVV_GAME_URL || 'http://127.0.0.1:3000';
const browser = await playwright[browserName].launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 768, height: 1024 },
  hasTouch: true,
  isMobile: browserName === 'webkit',
});
const errors = [];
page.on('pageerror', (error) => {
  errors.push(error.message);
  console.error(error.stack);
});
const screenshotDirectory = `test-results/${browserName}`;
await mkdir(screenshotDirectory, { recursive: true });
const shot = (name) =>
  page.screenshot({ path: `${screenshotDirectory}/${name}.png` });

async function checkLayout(landscape) {
  const display = landscape
    ? { width: 1120, height: 704 }
    : { width: 768, height: 1024 };
  const viewport = await page.locator('#game-viewport').boundingBox();
  const scale = Math.min(
    viewport.width / display.width,
    viewport.height / display.height,
  );
  const deadline = Date.now() + 2000;
  let bounds;
  let layout;
  do {
    bounds = await page.locator('#kiosk').boundingBox();
    layout = await page
      .locator('#kiosk')
      .evaluate((kiosk) => kiosk.classList.contains('landscape'));
    if (
      layout === landscape &&
      Math.abs(bounds.width - display.width * scale) < 1
    )
      break;
    await page.waitForTimeout(40);
  } while (Date.now() < deadline);

  assert.equal(layout, landscape, 'layout follows the available aspect ratio');
  assert.ok(
    Math.abs(bounds.width - display.width * scale) < 1,
    'game fits the width',
  );
  assert.ok(
    Math.abs(bounds.height - display.height * scale) < 1,
    'game fits the height',
  );
  assert.ok(
    Math.abs(bounds.x - viewport.x - (viewport.width - bounds.width) / 2) < 1,
    'game is centered horizontally',
  );
  assert.ok(
    Math.abs(bounds.y - viewport.y - (viewport.height - bounds.height) / 2) < 1,
    'game is centered vertically',
  );
}

async function tapFirstSwitch() {
  const canvas = page.locator('canvas');
  const { width, height } = await canvas.boundingBox();
  await canvas.tap({
    position: { x: (210 * width) / 768, y: (210 * height) / 704 },
  });
}
try {
  await page.addInitScript(() => {
    window.dispatches = [];
    window.addEventListener('kvv:dispatch', (event) =>
      window.dispatches.push(event.detail),
    );
  });
  await page.clock.install();
  const response = await page.goto(gameUrl);
  assert.ok(response?.ok(), `Game page failed to load: ${gameUrl}`);
  await page.locator('#start').waitFor();
  await page.clock.runFor(200);
  await checkLayout(false);
  await shot('menu');
  await page.locator('#help').tap();
  assert.ok(
    await page
      .locator('.dialog')
      .evaluate((dialog) => dialog.scrollHeight <= dialog.clientHeight),
    'help fits without scrolling',
  );
  await shot('help');
  await page.keyboard.press('Shift+Tab');
  assert.equal(
    await page
      .locator('#practice-switch')
      .evaluate((button) => button === document.activeElement),
    true,
  );
  await page.keyboard.press('Shift+Tab');
  assert.equal(
    await page
      .locator('#dialog-secondary')
      .evaluate((button) => button === document.activeElement),
    true,
  );
  await page.locator('#practice-switch').tap();
  assert.equal(
    await page.locator('#practice-switch').getAttribute('aria-pressed'),
    'true',
  );
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
  await page.setViewportSize({ width: 844, height: 390 });
  await checkLayout(true);
  await page.locator('#dialog-primary').tap();
  await page.clock.runFor(4500);
  assert.equal(await page.evaluate(() => window.dispatches.length), 1);
  assert.deepEqual(await page.evaluate(() => window.dispatches[0]), {
    source: 'track1',
    target: 'track2',
    name: 'Marktplatz',
  });
  await page.clock.runFor(3000);
  assert.equal(await page.locator('#score').innerText(), '0');
  await tapFirstSwitch();
  await page.clock.runFor(120);
  await shot('game');
  await page.clock.runFor(15000);
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
  for (const [width, height, landscape] of [
    [320, 568, false],
    [390, 844, false],
    [667, 375, true],
    [844, 390, true],
    [600, 800, false],
    [1080, 1920, false],
    [1024, 768, true],
    [1440, 900, true],
    [2560, 1080, true],
    [768, 1024, false],
  ]) {
    await page.setViewportSize({ width, height });
    await checkLayout(landscape);
  }
  // A smaller safe area can arrive without changing the layout viewport dimensions.
  await page.evaluate(() => {
    document.body.style.padding = '20px 12px 64px 40px';
  });
  await checkLayout(false);
  await page.evaluate(() => document.body.style.removeProperty('padding'));
  await checkLayout(false);
  await page.locator('#start').tap();
  assert.equal(await page.locator('#overlay').isVisible(), true);
  await page.locator('#dialog-primary').tap();
  await page.clock.runFor(6000);
  await tapFirstSwitch();
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
    `PASS (${browserName}): ten viewport sizes, safe area, touch routing after rotation, menu/help, pause, scoring, result, restart, idle reset; no browser errors.`,
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
