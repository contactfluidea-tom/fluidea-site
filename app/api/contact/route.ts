import { NextResponse } from "next/server";

// Conformité UE (RGPD) : exécuter cette fonction serverless à Francfort (fra1)
// pour que les données du formulaire de contact transitent par l'Union européenne.
export const preferredRegion = "fra1";
export const runtime = "nodejs";

/**
 * Route d'envoi du formulaire de contact.
 *
 * Backend par défaut : **Resend** via son API HTTP (pas de SDK requis),
 * authentifiée par `RESEND_API_KEY`. L'e-mail part vers `CONTACT_TO`
 * (défaut : contact.fluidea@gmail.com), avec `reply_to` = e-mail du visiteur.
 * - **Repli** : si `RESEND_API_KEY` est absente, le message est journalisé et la
 *   réponse renvoie `delivered: false` (pratique en local / preview).
 *
 * Alternative **sans backend** (export statique, où les route handlers
 * n'existent pas) : le formulaire poste directement vers Web3Forms si
 * `NEXT_PUBLIC_WEB3FORMS_KEY` est définie — voir `components/sections/Contact.tsx`.
 * Cette route n'est alors jamais appelée.
 */

const CONTACT_TO = process.env.CONTACT_TO || "contact.fluidea@gmail.com";
// Resend exige un expéditeur sur un domaine vérifié ; `onboarding@resend.dev`
// est l'expéditeur de test fourni par Resend en attendant la vérification.
const RESEND_FROM = process.env.RESEND_FROM || "Fluidea <onboarding@resend.dev>";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  need?: unknown;
  message?: unknown;
  company?: unknown; // honeypot anti-spam (doit rester vide)
}

/** Échappe le HTML pour intégrer du texte utilisateur dans le corps de l'e-mail. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const need = typeof body.need === "string" ? body.need.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const honeypot = typeof body.company === "string" ? body.company.trim() : "";

  // Honeypot rempli → un bot. On répond « succès » sans rien envoyer.
  if (honeypot) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  // Validation serveur (miroir de la validation client).
  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 422 });
  }

  const subject = `Nouveau message Fluidea — ${need || "Contact"} · ${name}`;
  const text = [
    `Nom : ${name}`,
    `E-mail : ${email}`,
    `Type de besoin : ${need || "Non précisé"}`,
    "",
    message,
  ].join("\n");
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0a0a0f">
  <h2 style="margin:0 0 12px">Nouveau message depuis fluidea</h2>
  <p style="margin:0"><strong>Nom :</strong> ${escapeHtml(name)}</p>
  <p style="margin:0"><strong>E-mail :</strong> ${escapeHtml(email)}</p>
  <p style="margin:0"><strong>Type de besoin :</strong> ${escapeHtml(need || "Non précisé")}</p>
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0" />
  <p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>
</div>`;

  const apiKey = process.env.RESEND_API_KEY;

  // Repli : aucune clé configurée → on journalise et on renvoie un succès « non délivré ».
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY absente — message journalisé, non envoyé.");
    console.info("[contact] Message reçu :", { name, email, need, message });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [CONTACT_TO],
        reply_to: email,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[contact] Échec Resend :", response.status, detail);
      return NextResponse.json(
        { error: "L'envoi a échoué. Réessayez ou écrivez-nous directement." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("[contact] Erreur réseau Resend :", error);
    return NextResponse.json(
      { error: "L'envoi a échoué. Réessayez ou écrivez-nous directement." },
      { status: 502 }
    );
  }
}
