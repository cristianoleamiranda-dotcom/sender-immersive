// middleware.ts — i18n Routing (ES `/` | EN `/en`)
// Compatible con Edge Runtime / Next.js Middleware y entornos basados en Web Fetch API.

const LOCALES = ['es', 'en'] as const;
const DEFAULT_LOCALE = 'es';
const PUBLIC_FILES = [
  '/assets',
  '/media',
  '/og',
  '/_next',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/robots.txt',
  '/sitemap.xml',
  '/sw.js',
  '/_headers',
];

export interface EdgeRequest extends Request {
  nextUrl?: URL & { locale?: string };
}

export function middleware(request: EdgeRequest): Response | undefined {
  const url = request.nextUrl ? new URL(request.nextUrl.toString()) : new URL(request.url);
  const { pathname } = url;

  // 1. Ignorar archivos estáticos públicos y rutas internas de assets
  if (
    PUBLIC_FILES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    /\.[^/]+$/.test(pathname)
  ) {
    return undefined;
  }

  // 2. Redirecciones legadas (/soluciones -> /productos, /en/soluciones -> /en/productos)
  if (pathname === '/soluciones' || pathname === '/soluciones/') {
    url.pathname = '/productos';
    return Response.redirect(url, 308);
  }
  if (pathname === '/en/soluciones' || pathname === '/en/soluciones/') {
    url.pathname = '/en/productos';
    return Response.redirect(url, 308);
  }

  // 3. Normalizar prefijo explícito del idioma por defecto (/es -> /, /es/... -> /...)
  // Regla de AGENTS.md: ES vive en `/`, EN vive en `/en`.
  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const stripped = pathname.replace(new RegExp(`^/${DEFAULT_LOCALE}(?=/|$)`), '') || '/';
    url.pathname = stripped;
    return Response.redirect(url, 308);
  }

  // 4. Determinar locale activo (EN en `/en` o `/en/*`; ES en `/` o `/*`)
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const locale =
    firstSegment && (LOCALES as readonly string[]).includes(firstSegment)
      ? firstSegment
      : DEFAULT_LOCALE;

  // Propagar encabezado de idioma resuelto para consumidores downstream
  const headers = new Headers(request.headers);
  headers.set('x-sender-locale', locale);

  return undefined;
}

export const config = {
  matcher: [
    '/((?!_next|assets|media|og|favicon.ico|favicon.svg|apple-touch-icon.png|robots.txt|sitemap.xml|sw.js|_headers).*)',
  ],
};
