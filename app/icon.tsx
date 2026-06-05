import { ImageResponse } from "next/og";
import { EMBLEM_SVG_DARK, EMBLEM_RATIO, svgToDataUri } from "@/lib/logo";

// Icône de l'app générée à la volée : emblème « F » circuit (sombre) sur carré
// arrondi en dégradé orange. Next l'expose en <link rel="icon"> ; le favicon.ico
// existant reste le repli pour les très petites tailles.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const h = Math.round(size.height * 0.56);
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
          borderRadius: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={svgToDataUri(EMBLEM_SVG_DARK)} width={w} height={h} alt="" />
      </div>
    ),
    { ...size }
  );
}
