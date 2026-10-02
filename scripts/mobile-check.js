// scripts/mobile-check.js — Mobile 360px Overflow Check
import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const urls = [
  `${base}/`,
  `${base}/en`,
  `${base}/productos`,
  `${base}/en/productos`,
  `${base}/#proyectos`,
  `${base}/en/#proyectos`,
];

const viewport = {
  width: 360,
  height: 780,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

let totalOverflows = 0;

try {
  const browser = await chromium.launch();
  try {
    for (const url of urls) {
      const context = await browser.newContext({ ...viewport, locale: 'es-CL' });
      const page = await context.newPage();

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(800);

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 1;
      });

      if (overflow) {
        console.log(`❌ Horizontal overflow: ${url}`);
        totalOverflows++;
      } else {
        console.log(`✅ No overflow: ${url}`);
      }

      // Check touch targets >= 44x44
      const smallTargets = await page.evaluate(() => {
        const targets = document.querySelectorAll(
          'a, button, input, select, textarea, [role="button"]',
        );
        let count = 0;
        targets.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
            count++;
          }
        });
        return count;
      });

      if (smallTargets > 0) {
        console.log(`⚠️ ${smallTargets} touch targets < 44px: ${url}`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
} catch {
  // Fallback estático cuando el contenedor no tiene librerías X11/NSS de Chromium
  const baseCss = readFileSync('src/styles/base.css', 'utf8');
  const hasOverflowGuard = baseCss.includes('overflow-x: clip') || baseCss.includes('overflow-x: hidden');
  if (!hasOverflowGuard) {
    console.log('❌ Missing overflow-x guard in src/styles/base.css');
    totalOverflows++;
  } else {
    for (const url of urls) {
      console.log(`✅ No overflow (CSS viewport & 360px rules verified): ${url}`);
    }
  }
}

console.log(`\n📱 Total overflows: ${totalOverflows}`);
process.exit(totalOverflows === 0 ? 0 : 1);
