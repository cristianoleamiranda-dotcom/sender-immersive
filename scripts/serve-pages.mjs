/**
 * SENDER — simulador local de GitHub Pages.
 *
 * Sirve `dist/` montado en un subdirectorio, con el mismo comportamiento que
 * Pages: archivos estáticos, `index.html` en las carpetas, 404.html para rutas
 * desconocidas y —esto es lo que casi siempre se olvida— **soporte de
 * peticiones por rangos**, que es lo que necesita un `<video>` para reproducir
 * y hacer *scrub* sin descargarse el archivo entero.
 *
 * Sirve para comprobar el despliegue de verdad antes de publicarlo, en vez de
 * descubrir los fallos de ruta en el sitio ya en vivo.
 *
 * Uso:  node scripts/serve-pages.mjs [puerto] [prefijo]
 *       node scripts/serve-pages.mjs 8899 /sender-immersive
 */

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const PUERTO = Number(process.argv[2] || 8899);
/**
 * Prefijo del subdirectorio. Se normaliza SIEMPRE con barra inicial: pasar
 * "sender-immersive" sin ella deja el servidor devolviendo 404 en todo, porque
 * ninguna ruta de verdad empieza así. Mejor aceptar las dos formas.
 */
const PREFIJO = (() => {
  const crudo = (process.argv[3] || "sender-immersive").replace(/\/+$/, "");
  return crudo.startsWith("/") ? crudo : `/${crudo}`;
})();
const RAIZ = "dist";

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

async function resolver(url) {
  let ruta = decodeURIComponent(url.split("?")[0]);
  if (!ruta.startsWith(PREFIJO)) return null;

  // Igual que Pages: la carpeta del proyecto se comporta como raíz del sitio.
  ruta = ruta.slice(PREFIJO.length) || "/";
  const destino = join(RAIZ, normalize(ruta).replace(/^(\.\.[/\\])+/, ""));

  try {
    const s = await stat(destino);
    return s.isDirectory() ? join(destino, "index.html") : destino;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const archivo = await resolver(req.url ?? "/");

  if (!archivo) {
    // Pages devuelve el 404.html del proyecto con estado 404.
    try {
      const html = await readFile(join(RAIZ, "404.html"));
      res.writeHead(404, { "content-type": TIPOS[".html"] });
      res.end(html);
    } catch {
      res.writeHead(404, { "content-type": TIPOS[".txt"] });
      res.end("404");
    }
    return;
  }

  const info = await stat(archivo);
  const tipo = TIPOS[extname(archivo)] ?? "application/octet-stream";

  /**
   * Rangos. Sin esto, el <video> no puede pedir trozos y el navegador aborta
   * la petición: en las pruebas parece que el video está roto cuando en
   * realidad lo que está roto es el simulador.
   */
  const rango = req.headers.range;
  if (rango && info.size > 0) {
    const m = /bytes=(\d*)-(\d*)/.exec(rango);
    if (m) {
      const inicio = m[1] ? Number(m[1]) : 0;
      const fin = m[2] ? Math.min(Number(m[2]), info.size - 1) : info.size - 1;

      if (inicio >= info.size || inicio > fin) {
        res.writeHead(416, { "content-range": `bytes */${info.size}` });
        res.end();
        return;
      }

      res.writeHead(206, {
        "content-type": tipo,
        "content-length": fin - inicio + 1,
        "content-range": `bytes ${inicio}-${fin}/${info.size}`,
        "accept-ranges": "bytes",
        "cache-control": "public, max-age=3600",
      });
      createReadStream(archivo, { start: inicio, end: fin }).pipe(res);
      return;
    }
  }

  res.writeHead(200, {
    "content-type": tipo,
    "content-length": info.size,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=3600",
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(archivo).pipe(res);
}).listen(PUERTO, "0.0.0.0", () => {
  console.log(`  Pages simulado`);
  console.log(`  http://localhost:${PUERTO}${PREFIJO}/`);
  console.log(`  sirviendo ${RAIZ}/ como ${PREFIJO}/`);
});
