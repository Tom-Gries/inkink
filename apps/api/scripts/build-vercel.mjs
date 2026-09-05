/**
 * Vercel-Build für die Hono-API (Build Output API, v3).
 *
 * Was hier passiert:
 *  1. Die komplette API (src/index.ts + alle importierten lokalen Module)
 *     sowie das Workspace-Package @inkink/auth werden mit esbuild in EINE
 *     selbstständige ESM-Datei gebündelt.
 *  2. Das Ergebnis landet als einzige Serverless Function in
 *     .vercel/output/functions/__server.func/ – dort liest Vercel es beim
 *     Deployment aus (Framework Preset "Other", Root Directory apps/api,
 *     Build Command `pnpm build`).
 *  3. config.json definiert das Routing (Vercel Build Output API v3):
 *     - Funktionen im `.vercel/output/functions`-Verzeichnis werden per
 *       Ordnerpfad auf URL-Pfade geroutet. `index.func` wäre also NUR `/` –
 *       `/api/health` käme dort nie an (Vercel-404). Deshalb heißt der Ordner
 *       `__server.func` → Route `/__server`.
 *     - `routes: [{ "handle": "filesystem" }, { "src": "/api/(.*)", "dest":
 *       "/__server" }]` fängt jeden Request unter `/api/*` ab und rewritet ihn
 *       auf die Function (gleiches Muster wie der Nitro-Vercel-Preset, den
 *       Nuxt auf Vercel produktiv nutzt). Die Function bekommt dabei den
 *       ORIGINAL-Pfad (z. B. `/api/health`), sodass Hono mit
 *       `new Hono().basePath('/api')` wie gewohnt routet.
 *
 * Warum Bundling?
 *  - Unter Node.js-ESM (type: "module") müssen relative Imports eine explizite
 *    Endung haben (./auth → ./auth.js). Die API nutzt im gesamten Monorepo den
 *    bundler-Style ohne Endungen (./auth, ../../db, ...) – das ist nur mit
 *    einem Bundler korrekt auflösbar.
 *  - Workspace-Packages (z. B. @inkink/auth) exportieren rohes TypeScript
 *    ("exports": "./src/index.ts"). Vanilla-Node.js kann das nicht laden;
 *    esbuild kann es bündeln.
 *  - Das Ergebnis ist 100 % selbstständig: Zur Laufzeit existieren keine
 *    relativen/TS-Imports mehr, nur noch node:-Builtins und optionale,
 *    als external markierte MongoDB-Nebendependencies.
 */

import { build } from 'esbuild'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, '.vercel', 'output')
const functionDir = join(outputDir, 'functions', '__server.func')
const functionRoute = '/__server'

// Altes Build-Artefakt entfernen (sonst landen verwaiste Dateien im Deploy).
rmSync(outputDir, { recursive: true, force: true })
mkdirSync(functionDir, { recursive: true })

// Optionale, teils native MongoDB-Nebendependencies werden NICHT mitgebündelt,
// sondern bleiben external. Der MongoDB-Treiber lädt sie nur bei Bedarf und
// fängt fehlende Module selbst ab (try/catch).
// WICHTIG: @mongodb-js/saslprep ist eine REGULÄRE (pure-JS) Abhängigkeit von
// mongodb und wird beim Laden von scram.js hart benötigt – sie bleibt im Bundle.
const external = [
  'kerberos',
  '@mongodb-js/zstd',
  '@aws-sdk/credential-providers',
  'snappy',
  'socks',
  'aws4',
  'gcp-metadata',
  'mongodb-client-encryption',
]

await build({
  entryPoints: [join(root, 'src', 'index.ts')],
  outfile: join(functionDir, 'index.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external,
  // esbuild erzeugt fuer CJS-Module (mongodb, ...) evtl. dynamische
  // require()-Aufrufe (z. B. require("timers/promises")). In ESM existiert
  // kein require – daher hier ein createRequire-Shim auf Modulebene.
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  logLevel: 'info',
})

// Config der Serverless Function (Node.js-Runtime, Handler = index.mjs).
// supportsResponseStreaming ist nötig für SSE (/api/realtime/events).
// maxDuration 300 = Fluid-Compute-/Streaming-Obergrenze; das hält den
// SSE-Stream so lange wie die Plattform erlaubt (Client reconnectet sonst).
writeFileSync(
  join(functionDir, '.vc-config.json'),
  `${JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.mjs',
      launcherType: 'Nodejs',
      supportsResponseStreaming: true,
      maxDuration: 300,
    },
    null,
    2,
  )}\n`,
)

// Build-Output-API-Metadaten-File (Pflicht) inkl. Routing.
//
// Vercel-Build-Output-API-v3-Routing:
//  - Jede `.func`-Directory unter `.vercel/output/functions` ist eine Function,
//    deren Ordnerpfad den URL-Pfad bestimmt (`functions/index.func` -> `/`,
//    `functions/__server.func` -> `/__server`). `/api/health` würde also von
//    keinem Dateisystem-Pfad getroffen -> ohne Route unten kam der Vercel-404.
//  - `{ "handle": "filesystem" }` prüft zuerst statische Dateien/Functions;
//    danach rewritten das Regex `/api/(.*)` sämtliche API-Pfade auf die
//    `__server`-Function (Battle-tested-Muster des Nitro/Nuxt-Presets).
//    Die Function erhält den Original-Pfad (`/api/health`) und Hono routet
//    über `basePath('/api')` wie lokal.
writeFileSync(
  join(outputDir, 'config.json'),
  `${JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '/api/(.*)', dest: functionRoute },
        // TEMPORÄR (Diagnose): Fängt `/` und `/error` auf der API-Domain ab,
        // damit die OAuth-Fehler-Redirects (/?error=state_mismatch) in der
        // Function landen statt im Vercel-404. Nach der Fehlersuche entfernen.
        { src: '/(.*)', dest: functionRoute },
      ],
    },
    null,
    2,
  )}\n`,
)

console.log('[build-vercel] Funktion geschrieben nach:')
console.log(`  ${functionDir}`)
console.log(`[build-vercel] Route: "${functionRoute}" via config.json (${outputDir}/config.json)`)