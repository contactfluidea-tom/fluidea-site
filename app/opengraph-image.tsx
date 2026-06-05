import { ImageResponse } from "next/og";
import { EMBLEM_SVG, EMBLEM_RATIO, svgToDataUri } from "@/lib/logo";

// Image Open Graph par défaut (1200×630), générée à la volée. Sert aussi de
// repli pour la Twitter Card. Logo orange (emblème circuit) sur fond sombre.
export const alt = "Fluidea — Automatisation IA sur-mesure (n8n + Claude)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0A0A0F",
          color: "#F5F5F7",
          backgroundImage:
            "radial-gradient(60% 80% at 100% 0%, rgba(255,107,44,0.35), transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(255,154,61,0.18), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={svgToDataUri(EMBLEM_SVG)}
            height={84}
            width={Math.round(84 * EMBLEM_RATIO)}
            alt=""
          />
          <div style={{ fontSize: 40, fontWeight: 600 }}>Fluidea</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 920 }}>
          Automatisation IA sur-mesure
        </div>
        <div style={{ fontSize: 36, color: "#A0A0AB", marginTop: 28 }}>
          n8n + Claude — pour entrepreneurs, freelances et PME
        </div>
      </div>
    ),
    { ...size }
  );
}
