"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Diagramme de workflow stylisé : une suite de nœuds (étapes d'automatisation)
 * reliés par des connexions lumineuses orange, avec un flux animé qui parcourt
 * les liaisons pour évoquer la circulation de la donnée. Purement décoratif et
 * paramétrable — aucune capture d'écran réelle.
 *
 * Réutilisable : on le pilote par le nombre et les libellés des nœuds (`nodes`).
 * Le SVG est responsive (`viewBox` + `width:100%`). Le flux animé est désactivé
 * sous `prefers-reduced-motion` (hook + neutralisation CSS globale).
 */
export interface WorkflowDiagramProps {
  /** Libellés des nœuds, dans l'ordre du flux (2 à 6 recommandés). */
  nodes: string[];
  /** Description accessible ; par défaut « étape puis étape… ». */
  ariaLabel?: string;
  className?: string;
}

/** Découpe un libellé en 1 à 2 lignes pour tenir dans un nœud. */
function wrapLabel(label: string): string[] {
  if (label.length <= 11 || !label.includes(" ")) return [label];
  const words = label.split(" ");
  const half = Math.ceil(label.length / 2);
  let first = words[0];
  let i = 1;
  while (i < words.length && (first + " " + words[i]).length <= half) {
    first += " " + words[i];
    i += 1;
  }
  const second = words.slice(i).join(" ");
  return second ? [first, second] : [first];
}

// Géométrie du canevas (unités viewBox, mises à l'échelle de façon responsive).
const W = 520;
const H = 240;
const PAD_X = 92;
const Y_TOP = 86;
const Y_BOT = 158;
const CHAR_W = 8.2;

export function WorkflowDiagram({ nodes, ariaLabel, className }: WorkflowDiagramProps) {
  const reducedMotion = useReducedMotion();
  // Identifiant unique par instance : évite les collisions d'<defs> quand
  // plusieurs diagrammes coexistent sur la page (références url(#…)).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = Math.max(nodes.length, 1);

  const points = nodes.map((label, i) => ({
    x: count === 1 ? W / 2 : PAD_X + ((W - PAD_X * 2) * i) / (count - 1),
    y: count === 1 ? H / 2 : i % 2 === 0 ? Y_TOP : Y_BOT,
    lines: wrapLabel(label),
  }));

  // Liaisons : courbe de Bézier douce entre nœuds consécutifs (tracées sous
  // les nœuds, qui masquent proprement les extrémités).
  const connectors = points.slice(1).map((b, i) => {
    const a = points[i];
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel ?? `Schéma d'automatisation : ${nodes.join(" puis ")}`}
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id={`${uid}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF6B2C" />
          <stop offset="100%" stopColor="#FF9A3D" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      {/* Connexions lumineuses (halo flou + trait net en dégradé + flux animé) */}
      {connectors.map((d, i) => (
        <g key={`c-${i}`}>
          <path
            d={d}
            fill="none"
            stroke="#FF6B2C"
            strokeOpacity={0.35}
            strokeWidth={7}
            strokeLinecap="round"
            filter={`url(#${uid}-glow)`}
          />
          <path
            d={d}
            fill="none"
            stroke={`url(#${uid}-line)`}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          {!reducedMotion && (
            <motion.path
              d={d}
              fill="none"
              stroke="#FFD9A8"
              strokeWidth={2.6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.14 0.86"
              initial={{ strokeDashoffset: 1 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{
                duration: 2.2,
                ease: "linear",
                repeat: Infinity,
                delay: i * 0.25,
              }}
            />
          )}
        </g>
      ))}

      {/* Nœuds : pastilles sombres cerclées d'orange, labellisées */}
      {points.map((p, i) => {
        const longest = Math.max(...p.lines.map((l) => l.length));
        const w = Math.min(160, Math.max(76, longest * CHAR_W + 30));
        const h = p.lines.length > 1 ? 50 : 44;
        return (
          <g key={`n-${i}`}>
            <rect
              x={p.x - w / 2}
              y={p.y - h / 2}
              width={w}
              height={h}
              rx={13}
              fill="rgba(18,18,26,0.94)"
              stroke="#FF6B2C"
              strokeOpacity={0.4}
              strokeWidth={1.2}
            />
            {p.lines.map((line, li) => (
              <text
                key={li}
                x={p.x}
                y={p.y + (li - (p.lines.length - 1) / 2) * 15}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-text font-sans"
                fontSize={13.5}
                fontWeight={500}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
