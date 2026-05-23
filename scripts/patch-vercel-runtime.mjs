/**
 * @astrojs/vercel 7.x génère encore nodejs18.x — Vercel ne l'accepte plus.
 * Ce script met à jour le runtime vers nodejs20.x après `astro build`.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const OUTPUT = ".vercel/output/functions";

function patchVcConfig(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const cfgPath = join(full, ".vc-config.json");
      try {
        const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
        if (cfg.runtime === "nodejs18.x") {
          cfg.runtime = "nodejs20.x";
          writeFileSync(cfgPath, JSON.stringify(cfg, null, "\t") + "\n");
          console.log(`✓ ${cfgPath} → nodejs20.x`);
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
