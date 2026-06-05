import { ImageResponse } from "next/og";
import { EMBLEM_SVG_DARK, EMBLEM_RATIO, svgToDataUri } from "@/lib/logo";

// Icône « apple-touch » (écran d'accueil iOS) : emblème « F » sombre sur carré
// arrondi en dégradé orange, avec un peu plus de marge qu'un favicon.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const h = Math.round(size.height * 0.52);
  const w = Math.round(h * EMBLEM_RATIO);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF6B2C, #FF9A3D)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={svgToDataUri(EMBLEM_SVG_DARK)} width={w} height={h} alt="" />
      </div>
    ),
    { ...size }
  );
}
