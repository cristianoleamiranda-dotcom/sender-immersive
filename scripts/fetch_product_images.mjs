#!/usr/bin/env node
/**
 * SENDER — fetch de imágenes reales de producto desde sender.cl
 *
 * Regla (Real Image Policy, brief §11): solo fotografías reales publicadas por
 * SENDER. Este script descarga originales de la librería de medios de
 * sender.cl (WordPress REST) a public/assets/images/products/. No genera,
 * no renombra, no inventa correspondencias entre archivos.
 *
 * Uso:  npm run assets:fetch  ·  Node >= 20 (fetch global).
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://www.sender.cl/wp-json/wp/v2/media";
const DEST = path.resolve("public/assets/images/products");
const UA = "sender-immersive-assets/1.0";

/** Un original no lleva el sufijo de tamaño de WordPress (-1024x682). */
const esOriginal = (url) => !/-\d+x\d+\.(png|jpe?g|webp|gif)$/i.test(url);

async function listar() {
  const urls = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${API}?per_page=100&page=${page}&_fields=source_url`, {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) throw new Error(`sender.cl respondió ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    for (const item of data) {
      const u = item.source_url;
      if (u && esOriginal(u)) urls.push(u);
    }
    if (data.length < 100) break;
  }
  return [...new Set(urls)];
}

/** Favicons, iconos y logos del sitio: no son material de producto. */
const ignorar = [/favicon|icon|logo|cropped-/i];

async function descargar(url) {
  const nombre = decodeURIComponent(new URL(url).pathname.split("/").pop());
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return { url, ok: false, estado: res.status };
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(DEST, nombre), buf);
  return { url, nombre, bytes: buf.length, ok: true };
}

async function main() {
  await mkdir(DEST, { recursive: true });
  const urls = (await listar()).filter((u) => !ignorar.some((re) => re.test(u)));
  console.log(`sender.cl: ${urls.length} originales candidatos`);
  let ok = 0;
  for (const u of urls) {
    const r = await descargar(u).catch((e) => ({ url: u, ok: false, error: String(e) }));
    if (r.ok) { ok++; console.log(`  + ${r.nombre} (${r.bytes} B)`); }
    else console.warn(`  x ${u} — ${r.error ?? "HTTP " + r.estado}`);
  }
  console.log(`Descargados ${ok}/${urls.length} en public/assets/images/products/`);
  if (ok === 0) process.exitCode = 1;
}

main();
