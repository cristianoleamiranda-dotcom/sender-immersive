/**
 * Capturas de QA visual.
 *
 * Recorre la página entera y fotografía cada escena en escritorio y en móvil
 * —con el perfil real de un Galaxy S24: 360×780, DPR 3— para poder criticar lo
 * construido en vez de suponerlo.
 *
 * Uso:  node scripts/shots.mjs [url] [--solo=entrada,senal]
 */

import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const URL_BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:5173";
const soloArg = process.argv.find((a) => a.startsWith("--solo="));
const SOLO = soloArg ? soloArg.split("=")[1].split(",") : null;

const ESCENAS = [
  { id: "entrada", nombre: "00-entrada" },
  { id: "senal", nombre: "01-senal" },
  { id: "empresa", nombre: "02-empresa" },
  { id: "ingenieria", nombre: "03-ingenieria" },
  { id: "transmision", nombre: "04-transmision" },
  { id: "proyectos", nombre: "05-proyectos" },
  { id: "productos", nombre: "06-productos" },
  { id: "proceso", nombre: "07-proceso" },
  { id: "contacto", nombre: "08-contacto" },
];

const PERFILES = [
  {
    nombre: "escritorio",
    contexto: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  },
  {
    nombre: "movil",
    contexto: {
      viewport: { width: 360, height: 780 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
  },
];

/** Desplaza la página y espera a que el scroll suave se asiente. */
async function irA(page, y) {
  await page.evaluate((destino) => window.scrollTo({ top: destino, behavior: "auto" }), y);
  await page.waitForTimeout(900);
}

async function capturar(browser, perfil, lang) {
  const dir = `shots/${perfil.nombre}-${lang}`;
  await mkdir(dir, { recursive: true });

  const contexto = await browser.newContext({
    ...perfil.contexto,
    locale: lang === "es" ? "es-CL" : "en-US",
    reducedMotion: "no-preference",
  });
  const page = await contexto.newPage();

  const errores = [];
  page.on("console", (m) => {
    if (m.type() === "error") errores.push(m.text());
  });
  page.on("pageerror", (e) => errores.push(`PAGEERROR: ${e.message}`));

  await page.goto(`${URL_BASE}/${lang}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2200);

  const total = await page.evaluate(() => document.body.scrollHeight);
  console.log(`\n  ${perfil.nombre} · /${lang}/ · alto ${total}px`);

  for (const escena of ESCENAS) {
    if (SOLO && !SOLO.includes(escena.id)) continue;

    const box = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, alto: r.height };
    }, escena.id);

    if (!box) {
      console.log(`    ✗ #${escena.id} no existe`);
      continue;
    }

    // Tres cortes por escena: entrada, medio y salida.
    const cortes = [
      { sufijo: "a", y: box.top + 40 },
      { sufijo: "b", y: box.top + box.alto * 0.42 },
      { sufijo: "c", y: box.top + box.alto * 0.78 },
    ];

    for (const c of cortes) {
      await irA(page, c.y);
      await page.screenshot({
        path: `${dir}/${escena.nombre}-${c.sufijo}.jpg`,
        type: "jpeg",
        quality: 82,
      });
    }
    console.log(`    ✓ ${escena.nombre}  (${Math.round(box.alto)}px)`);
  }

  // Comprobaciones objetivas que no dependen de mi criterio.
  await irA(page, 0);
  const medidas = await page.evaluate(() => {
    const desborde = document.documentElement.scrollWidth > window.innerWidth + 1;
    const imgs = Array.from(document.images).map((i) => ({
      src: i.currentSrc.split("/").pop(),
      w: i.naturalWidth,
      ok: i.complete && i.naturalWidth > 0,
    }));
    return {
      desborde,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      imagenes: imgs.length,
      imagenesRotas: imgs.filter((i) => !i.ok).map((i) => i.src),
    };
  });

  console.log(`    desborde horizontal: ${medidas.desborde ? "SÍ ✗" : "no ✓"}`);
  if (medidas.imagenesRotas.length) {
    console.log(`    imágenes rotas: ${medidas.imagenesRotas.join(", ")} ✗`);
  } else {
    console.log(`    imágenes: ${medidas.imagenes} ok ✓`);
  }
  if (errores.length) {
    console.log(`    errores de consola (${errores.length}):`);
    errores.slice(0, 6).forEach((e) => console.log(`      · ${e.slice(0, 150)}`));
  } else {
    console.log("    sin errores de consola ✓");
  }

  await contexto.close();
  return { errores, medidas };
}

const browser = await chromium.launch();
try {
  for (const perfil of PERFILES) {
    for (const lang of ["es", "en"]) {
      await capturar(browser, perfil, lang);
    }
  }
} finally {
  await browser.close();
}

console.log("\n  Capturas en shots/<perfil>-<idioma>/\n");
