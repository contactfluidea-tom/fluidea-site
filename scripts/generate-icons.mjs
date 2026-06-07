/**
 * Génère les icônes statiques de Fluidea (favicon + icônes app/manifest) à
 * partir des SVG sources, en réutilisant le rasteriseur embarqué de `next/og`
 * (Satori + resvg) — aucune dépendance externe (ImageMagick, sharp…) requise.
 *
 *   node scripts/generate-icons.mjs
 *
 * Sorties :
 *   public/icon.png       512×512  — « F » orange, fond transparent (raster de repli)
 *   app/favicon.ico       16/32/48 — « F » orange, fond transparent (Google + legacy)
 *   app/apple-icon.png    180×180  — emblème orange sur carré sombre (iOS)
 *   public/icon-192.png   192×192  — idem, maskable (manifest)
 *   public/icon-512.png   512×512  — idem, maskable (manifest)
 *
 * `app/icon.svg` (favicon vectoriel principal, lié par Next) est écrit à la main,
 * pas ici. Le PNG 512 vit dans `public/` pour ne pas éclipser le SVG : Next ne
 * référence qu'un seul fichier de base `icon.*` dans `app/`, et le SVG prime.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import React from "react";
// Import direct du module compilé : `next/og` n'est pas résoluble hors bundler.
import { ImageResponse } from "../node_modules/next/dist/compiled/@vercel/og/index.node.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const DARK = "#0A0A0F";

/** SVG simplifié et épaissi (favicon), lisible jusqu'à 16×16. */
const FAVICON_SVG = readFileSync(join(ROOT, "app/icon.svg"), "utf8");
/** Emblème « circuit » détaillé (logo de marque), pour les grandes icônes app. */
const EMBLEM_SVG = readFileSync(join(ROOT, "public/assets/logo-fluidea-mark.svg"), "utf8");

/** Ratio largeur/hauteur lu depuis le viewBox d'un SVG. */
function ratioOf(svg) {
  const m = svg.match(/viewBox="([\d.\s-]+)"/);
  const [, , w, h] = m[1].trim().split(/\s+/).map(Number);
  return w / h;
}

const svgToDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/** Rend un PNG (Buffer) de `size`px à partir d'un élément React. */
async function toPng(element, size) {
  const res = new ImageResponse(element, { width: size, height: size });
  return Buffer.from(await res.arrayBuffer());
}

/** Emblème orange sur fond transparent, plein cadre (favicon). */
function transparentEmblem(svg, size) {
  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    React.createElement("img", {
      src: svgToDataUri(svg),
      width: size,
      height: size,
      alt: "",
    })
  );
}

/** Emblème orange centré sur un carré sombre plein cadre (app icon, maskable). */
function darkSquareEmblem(svg, size) {
  const h = Math.round(size * 0.56);
  const w = Math.round(h * ratioOf(svg));
  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: DARK,
      },
    },
    React.createElement("img", { src: svgToDataUri(svg), width: w, height: h, alt: "" })
  );
}

/** Empaquète des PNG (≤256px) dans un conteneur ICO (PNG embarqué). */
function buildIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type = icône
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  images.forEach((img, i) => {
    const e = 16 * i;
    entries.writeUInt8(img.size >= 256 ? 0 : img.size, e + 0); // largeur
    entries.writeUInt8(img.size >= 256 ? 0 : img.size, e + 1); // hauteur
    entries.writeUInt8(0, e + 2); // palette
    entries.writeUInt8(0, e + 3); // réservé
    entries.writeUInt16LE(1, e + 4); // plans
    entries.writeUInt16LE(32, e + 6); // bits/pixel
    entries.writeUInt32LE(img.png.length, e + 8);
    entries.writeUInt32LE(offset, e + 12);
    offset += img.png.length;
  });

  return Buffer.concat([header, entries, ...images.map((i) => i.png)]);
}

async function main() {
  // 1) Favicon vectoriel → PNG 512 (fond transparent), servi depuis public/.
  writeFileSync(join(ROOT, "public/icon.png"), await toPng(transparentEmblem(FAVICON_SVG, 512), 512));

  // 2) favicon.ico multi-tailles (16/32/48), fond transparent.
  const icoSizes = [16, 32, 48];
  const icoImages = [];
  for (const size of icoSizes) {
    icoImages.push({ size, png: await toPng(transparentEmblem(FAVICON_SVG, size), size) });
  }
  writeFileSync(join(ROOT, "app/favicon.ico"), buildIco(icoImages));

  // 3) apple-touch icon 180 (emblème sur carré sombre).
  writeFileSync(
    join(ROOT, "app/apple-icon.png"),
    await toPng(darkSquareEmblem(EMBLEM_SVG, 180), 180)
  );

  // 4) Icônes manifest 192 / 512 (maskable).
  writeFileSync(
    join(ROOT, "public/icon-192.png"),
    await toPng(darkSquareEmblem(EMBLEM_SVG, 192), 192)
  );
  writeFileSync(
    join(ROOT, "public/icon-512.png"),
    await toPng(darkSquareEmblem(EMBLEM_SVG, 512), 512)
  );

  console.log("Icônes générées : public/icon.png, app/favicon.ico, app/apple-icon.png, public/icon-192.png, public/icon-512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
