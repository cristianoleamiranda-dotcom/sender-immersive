import { useLang } from "@/i18n/language";

/** Primero en el DOM, visible al foco. Nunca un atajo escondido. */
export function SkipLink() {
  const { t } = useLang();
  return (
    <a className="saltar" href="#contenido">
      {t.nav.main}
    </a>
  );
}
