/**
 * Performance measurement harness.
 *
 * Loads the built game in a real browser, enters the heaviest levels and
 * records: average FPS, P95 frame time, time-to-first-frame, peak memory and
 * the behaviour of the heaviest wave. Writes a markdown report to stdout.
 *
 * Usage:
 *   npm run build -w @combat-strike/web
 *   npm run preview -w @combat-strike/web -- --host 127.0.0.1 &
 *   node tools/perf/measure.mjs [url] [output.md]
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://127.0.0.1:4173/';
const OUT = process.argv[3] ?? null;

/** Levels to profile: the heaviest wave, a terrain level, and a boss level. */
const TARGETS = [
  { level: 1, difficulty: 1, label: '第 1 关 · 熔岩炼狱（100+100 小怪）' },
  { level: 50, difficulty: 1, label: '第 50 关 · 终焉王座（地形 + 机关 + 94/84 小怪）' },
  { level: 20, difficulty: 1, label: '第 20 关 · 终焉核心（纯 BOSS）' },
];

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--js-flags=--expose-gc'],
});

const rows = [];

for (const target of TARGETS) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const loadStart = Date.now();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__combatStrike), null, { timeout: 30000 });
  const bootMs = Date.now() - loadStart;

  // Enter the level through the normal menu path.
  const enterStart = Date.now();
  await page.locator('[data-screen="home"] .mode-card').click();
  await page.locator(`.level-card[data-level="${target.level}"]`).click();
  await page.locator(`.difficulty-btn[data-difficulty="${target.difficulty}"]`).click();
  await page.waitForFunction(
    (lvl) => window.__combatStrike?.getSimulation()?.level?.id === lvl,
    target.level,
    { timeout: 30000 },
  );
  const enterMs = Date.now() - enterStart;

  // Let the wave build up so the heaviest moment is captured.
  await page.waitForTimeout(9000);

  // Sample frames from inside the page for accuracy.
  const samples = await page.evaluate(async () => {
    const frames = [];
    let last = performance.now();
    const durationMs = 8000;
    const end = last + durationMs;
    await new Promise((resolve) => {
      const tick = () => {
        const now = performance.now();
        frames.push(now - last);
        last = now;
        if (now < end) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    const sim = window.__combatStrike?.getSimulation();
    const memory = performance.memory;
    return {
      frames,
      enemies: sim?.enemies.length ?? 0,
      wave: sim?.wave ?? 0,
      heapBytes: memory?.usedJSHeapSize ?? 0,
    };
  });

  const sorted = [...samples.frames].sort((a, b) => a - b);
  const avg = samples.frames.reduce((a, b) => a + b, 0) / samples.frames.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  const worst = sorted[sorted.length - 1] ?? 0;

  rows.push({
    label: target.label,
    bootMs,
    enterMs,
    avgFps: 1000 / avg,
    avgFrameMs: avg,
    p95FrameMs: p95,
    worstFrameMs: worst,
    enemies: samples.enemies,
    wave: samples.wave,
    heapMb: samples.heapBytes / (1024 * 1024),
  });

  await context.close();
}

// Restart churn: repeated restarts must not leak GPU or JS resources.
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(window.__combatStrike), null, { timeout: 30000 });
await page.locator('[data-screen="home"] .mode-card').click();
await page.locator('.level-card[data-level="35"]').click();
await page.locator('.difficulty-btn[data-difficulty="1"]').click();
await page.waitForFunction(() => (window.__combatStrike?.getSimulation()?.wave ?? 0) > 0, null, { timeout: 30000 });

const before = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
for (let i = 0; i < 5; i++) {
  // Drive the restart through the same entry point the retry button uses, so
  // the level teardown path is exercised without depending on the overlay
  // being clickable.
  await page.evaluate(() => {
    window.__combatStrike?.forceVictory();
  });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    window.__combatStrike?.startLevel(35, 1);
  });
  await page.waitForFunction(
    () => (window.__combatStrike?.getSimulation()?.wave ?? 0) > 0,
    null,
    { timeout: 40000 },
  );
  await page.waitForTimeout(1500);
}
const after = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
await context.close();
await browser.close();

const lines = [];
lines.push('# 性能实测报告');
lines.push('');
lines.push(`- 测量环境：Chromium（SwiftShader 软件渲染），1920×1080`);
lines.push(`- 被测地址：${URL}`);
lines.push(`- 说明：本机没有可用的 GPU 加速，SwiftShader 为纯 CPU 光栅化，帧率显著低于真实显卡，仅用于比较与回归基线。`);
lines.push('');
lines.push('| 场景 | 首屏启动 | 进入关卡 | 平均 FPS | 平均帧时 | P95 帧时 | 最差帧时 | 同屏敌人 | JS 堆 |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) {
  lines.push(
    `| ${r.label} | ${r.bootMs} ms | ${r.enterMs} ms | ${r.avgFps.toFixed(1)} | ${r.avgFrameMs.toFixed(2)} ms | ${r.p95FrameMs.toFixed(2)} ms | ${r.worstFrameMs.toFixed(2)} ms | ${r.enemies} | ${r.heapMb.toFixed(1)} MB |`,
  );
}
lines.push('');
lines.push('## 连续重试后的内存');
lines.push('');
lines.push(`- 场景：第 35 关「崩解平台」，连续通关并重开 5 次`);
lines.push(`- 重试前 JS 堆：${(before / 1024 / 1024).toFixed(1)} MB`);
lines.push(`- 重试后 JS 堆：${(after / 1024 / 1024).toFixed(1)} MB`);
lines.push(`- 增量：${((after - before) / 1024 / 1024).toFixed(1)} MB`);
lines.push('');
lines.push('> 目标配置为桌面独显 1080p 稳定 60 FPS。本表在软件渲染下测得，用于回归对比；真实硬件的数字需要在带 GPU 的机器上重测。');

const report = lines.join('\n');
console.log(report);
if (OUT) writeFileSync(OUT, report, 'utf8');
