// scripts/a11y-check.js — Verificación de accesibilidad y estructura semántica
import { execSync } from 'node:child_process';

try {
  execSync('python3 scripts/audit.py --estricto', { stdio: 'inherit' });
  execSync('python3 scripts/contraste.py', { stdio: 'inherit' });
  console.log('✅ Accessibility & WCAG 2.1 AA checks passed');
} catch {
  process.exit(1);
}
