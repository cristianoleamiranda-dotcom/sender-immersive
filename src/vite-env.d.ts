/// <reference types="vite/client" />

/** Variables de entorno del proyecto. */
interface ImportMetaEnv {
  /** Base pública del sitio: "/" o "/sender-immersive/". */
  readonly BASE_URL: string;
  /** Dominio absoluto del sitio publicado, para canónicas y JSON-LD. */
  readonly VITE_SITE_URL?: string;
  /** Prefijo de despliegue, equivalente a BASE_URL. */
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
