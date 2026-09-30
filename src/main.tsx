import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@/i18n/language";
import App from "@/App";
import "@/styles/tokens.css";
import "@/styles/base.css";

const host = document.getElementById("raiz");
if (!host) throw new Error("Falta #raiz en el documento");

createRoot(host).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
