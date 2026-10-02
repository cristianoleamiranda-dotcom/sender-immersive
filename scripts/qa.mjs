// scripts/qa.mjs — Orquestador de QA
import { execSync } from 'node:child_process';

execSync('node qa/check.mjs', { stdio: 'inherit' });
execSync('python3 scripts/audit_palette.py', { stdio: 'inherit' });
execSync('python3 scripts/audit.py --estricto', { stdio: 'inherit' });
execSync('python3 scripts/contraste.py', { stdio: 'inherit' });
