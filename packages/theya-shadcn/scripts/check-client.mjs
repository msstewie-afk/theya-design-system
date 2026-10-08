#!/usr/bin/env node
/**
 * React Server Components check: every module that needs the browser has
 * `'use client'` at the top, so apps on the Next.js App Router can import
 * Theya from server components (without it they fail at build time with
 * "useState only works in Client Components" and similar).
 *
 * A module needs the directive when it (read from the TypeScript AST):
 * - calls a hook (`useX(...)`) or creates a context;
 * - passes an event handler in JSX (`onClick={…}`);
 * - touches `window` / `document` / `localStorage` / `navigator`;
 * - imports a client-only library (Radix, cmdk, Recharts, Embla, …).
 *
 *   node scripts/check-client.mjs          list modules missing it (exit 1)
 *   node scripts/check-client.mjs --fix    add it
 *
 * Runs as part of `pnpm api:check`, so CI enforces it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIX = process.argv.includes('--fix');
const DIRS = ['src/components', 'src/lib'];
const SKIP = /\.(stories|guidelines|test)\.tsx?$/;
const CLIENT_LIBS = /^(@radix-ui\/|cmdk$|recharts$|embla-carousel|@dnd-kit\/|@tiptap\/|vaul$|sonner$|react-day-picker|input-otp$|@codemirror\/|react-resizable-panels$|react-hook-form$|@tanstack\/react-table$)/;
const BROWSER_GLOBALS = new Set(['window', 'document', 'localStorage', 'sessionStorage', 'navigator', 'matchMedia']);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.tsx?$/.test(e.name) && !SKIP.test(e.name) && !e.name.endsWith('.d.ts') ? [p] : [];
  });

function hasDirective(sf) {
  const first = sf.statements[0];
  return Boolean(first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression) && first.expression.text === 'use client');
}

/** The first reason this module must run on the client, or null. */
function clientReason(sf) {
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier) && CLIENT_LIBS.test(st.moduleSpecifier.text) && !st.importClause?.isTypeOnly) {
      return `imports ${st.moduleSpecifier.text}`;
    }
  }
  let reason = null;
  const visit = (n) => {
    if (reason) return;
    if (ts.isCallExpression(n)) {
      const callee = ts.isPropertyAccessExpression(n.expression) ? n.expression.name : n.expression;
      if (ts.isIdentifier(callee) && /^use[A-Z]/.test(callee.text)) reason = `calls ${callee.text}()`;
      else if (ts.isIdentifier(callee) && callee.text === 'createContext') reason = 'creates a context';
    } else if (ts.isJsxAttribute(n) && /^on[A-Z]/.test(n.name.getText(sf)) && n.initializer) {
      reason = `passes ${n.name.getText(sf)}`;
    } else if (ts.isIdentifier(n) && BROWSER_GLOBALS.has(n.text) && (ts.isPropertyAccessExpression(n.parent) ? n.parent.expression === n : ts.isTypeOfExpression(n.parent))) {
      reason = `uses ${n.text}`;
    }
    if (!reason) ts.forEachChild(n, visit);
  };
  visit(sf);
  return reason;
}

const missing = [];
for (const file of DIRS.flatMap((d) => walk(path.join(ROOT, d))).sort()) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  if (hasDirective(sf)) continue;
  const reason = clientReason(sf);
  if (!reason) continue;
  missing.push(`${path.relative(ROOT, file)} — ${reason}`);
  if (FIX) fs.writeFileSync(file, `'use client';\n\n${src}`);
}

if (missing.length && !FIX) {
  console.error(`${missing.length} module(s) need 'use client' (run \`node scripts/check-client.mjs --fix\`):\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log(FIX ? `'use client' added to ${missing.length} module(s)` : "'use client': ok");
