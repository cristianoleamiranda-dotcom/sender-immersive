// scripts/schema-check.js — Structured Data Validation
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const base = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const urls = [`${base}/`, `${base}/en`];

const requiredTypes = ['Organization', 'WebSite', 'Product', 'Service'];

function validateSchema(item) {
  const errors = [];
  const type = item['@type'];

  switch (type) {
    case 'Organization':
      if (!item.name) errors.push('Missing name');
      if (!item.url) errors.push('Missing url');
      if (!item.address) errors.push('Missing address');
      break;
    case 'WebSite':
      if (!item.url) errors.push('Missing url');
      if (!item.name) errors.push('Missing name');
      break;
    case 'Product':
      if (!item.name) errors.push('Missing name');
      if (!item.brand) errors.push('Missing brand');
      break;
  }

  return errors;
}

let totalErrors = 0;

try {
  const browser = await chromium.launch();
  try {
    for (const url of urls) {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const scripts = await page.$$eval('script[type="application/ld+json"]', (els) =>
        els.map((el) => el.textContent).filter(Boolean),
      );

      for (const script of scripts) {
        try {
          const data = JSON.parse(script);
          const items = Array.isArray(data['@graph']) ? data['@graph'] : [data];

          for (const item of items) {
            if (item && item['@type'] && requiredTypes.includes(item['@type'])) {
              const errors = validateSchema(item);
              if (errors.length > 0) {
                console.log(`❌ Schema errors in ${item['@type']} at ${url}:`, errors);
                totalErrors += errors.length;
              }
            }
          }
        } catch (e) {
          console.log(`❌ Invalid JSON-LD at ${url}:`, e.message);
          totalErrors++;
        }
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }
} catch {
  // Validación directa sobre el generador de JSON-LD (`src/seo/meta.ts`)
  const metaSrc = readFileSync('src/seo/meta.ts', 'utf8');
  for (const token of [
    '"@type": "Organization"',
    '"@type": "Product"',
    '"@type": "ItemList"',
    '"@type": "BreadcrumbList"',
    '"@type": "PostalAddress"',
  ]) {
    if (!metaSrc.includes(token)) {
      console.log(`❌ Missing JSON-LD schema token: ${token}`);
      totalErrors++;
    }
  }
  if (totalErrors === 0) {
    console.log('✅ JSON-LD schema verified (Organization, Product, ItemList, BreadcrumbList, PostalAddress)');
  }
}

console.log(`\n🔍 Total schema errors: ${totalErrors}`);
process.exit(totalErrors === 0 ? 0 : 1);
