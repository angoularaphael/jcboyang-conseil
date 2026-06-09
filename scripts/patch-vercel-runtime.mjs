/**
 * @astrojs/vercel 7.x génère nodejs18.x ou nodejs20.x — on force nodejs22.x
 * (WebSocket natif requis par @supabase/realtime-js).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const OUTPUT = ".vercel/output/functions";
const TARGET_RUNTIME = "nodejs22.x";
const LEGACY_RUNTIMES = new Set(["nodejs18.x", "nodejs20.x"]);

function patchVcConfig(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const cfgPath = join(full, ".vc-config.json");
      try {
        const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
        if (LEGACY_RUNTIMES.has(cfg.runtime)) {
          cfg.runtime = TARGET_RUNTIME;
          writeFileSync(cfgPath, JSON.stringify(cfg, null, "\t") + "\n");
          console.log(`✓ ${cfgPath} → ${TARGET_RUNTIME}`);
        }
      } catch {
        /* pas de .vc-config.json */
      }
    }
  }
}

try {
  patchVcConfig(OUTPUT);
} catch (e) {
  console.warn("patch-vercel-runtime:", e.message);
}
