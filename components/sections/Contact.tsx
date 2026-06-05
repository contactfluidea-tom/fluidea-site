"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuCircleCheck, LuLoaderCircle, LuMail, LuSend } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SOCIALS } from "@/lib/socials";

const CONTACT_EMAIL = "contact.fluidea@gmail.com";
const NEED_OPTIONS = ["Audit", "Système sur-mesure", "Formation", "Autre"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EASE = [0.22, 1, 0.36, 1] as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

// Réseaux affichés dans l'ordre demandé (Instagram en tête), sans modifier la
// source partagée `lib/socials.ts`.
const SOCIAL_ORDER = ["instagram", "facebook", "tiktok", "linkedin"];
const CONTACT_SOCIALS = [...SOCIALS].sort(
  (a, b) => SOCIAL_ORDER.indexOf(a.key) - SOCIAL_ORDER.indexOf(b.key)
);

type Field = "name" | "email" | "need" | "message";
type Values = Record<Field, string> & { company: string };
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "submitting" | "success" | "error";

const INITIAL_VALUES: Values = { name: "", email: "", need: "", message: "", company: "" };

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) {
    errors.name = "Indiquez votre nom (au moins 2 caractères).";
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Indiquez une adresse e-mail valide.";
  }
  if (!values.need) {
    errors.need = "Sélectionnez un type de besoin.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Votre message doit faire au moins 10 caractères.";
  }
  return errors;
}

/**
 * Envoie le message. Bascule automatiquement :
 * - vers **Web3Forms** (sans backend) si `NEXT_PUBLIC_WEB3FORMS_KEY` est définie
 *   — utile en export statique ;
 * - sinon vers la **route interne** `/api/contact` (Resend).
 */
async function sendMessage(values: Values): Promise<void> {
  const web3Key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  const genericError = "L'envoi a échoué. Réessayez ou écrivez-nous directement.";

  if (web3Key) {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: web3Key,
        subject: `Nouveau message Fluidea — ${values.need || "Contact"} · ${values.name}`,
        from_name: values.name,
        email: values.email,
        "Type de besoin": values.need || "Non précisé",
        message: values.message,
        botcheck: "", // champ anti-bot natif de Web3Forms
      }),
    });
    const json = (await response.json().catch(() => ({}))) as { success?: boolean };
    if (!response.ok || !json.success) throw new Error(genericError);
    return;
  }

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!response.ok) {
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error || genericError);
  }
}

/** Message d'erreur lié à un champ (référencé via `aria-describedby`). */
function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
      <LuCircleAlert aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}

/** Coordonnées : e-mail cliquable (mailto) + réseaux sociaux. */
function ContactInfo() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-base leading-relaxed text-text-muted">
        Vous préférez écrire ? Posez votre question ou décrivez votre projet : on vous
        répond <span className="text-text">personnellement</span>, généralement sous 24 h
        ouvrées.
      </p>

      {/* E-mail en lien mailto */}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className={cn(
          "glass group flex items-center gap-3.5 rounded-2xl p-4 transition-[border-color,box-shadow,transform]",
          "duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow-sm",
          FOCUS_RING
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
            "shadow-glow-sm ring-1 ring-primary/20 transition-[background-color,box-shadow]",
            "duration-300 group-hover:bg-primary/15 group-hover:shadow-glow-md"
          )}
        >
          <LuMail className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs text-text-muted">Écrivez-nous à</span>
          <span className="block break-all font-medium text-text">{CONTACT_EMAIL}</span>
        </span>
      </a>

      {/* Réseaux sociaux */}
      <div>
        <p className="mb-3 text-sm font-medium text-text">Suivez Fluidea</p>
        <ul className="flex flex-wrap gap-3">
          {CONTACT_SOCIALS.map((social) => {
            const Icon = social.icon;
            return (
              <li key={social.key}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.name} (ouvre dans un nouvel onglet)`}
                  className={cn(
                    "glass grid h-11 w-11 place-items-center rounded-full text-text-muted",
                    "transition-[color,border-color,box-shadow,transform] duration-300",
                    "hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-glow-sm",
                    FOCUS_RING
                  )}
                >
                  <Icon aria-hidden="true" className="h-[1.05rem] w-[1.05rem]" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Panneau de confirmation affiché après un envoi réussi. */
function SuccessPanel({
  onReset,
  reducedMotion,
}: {
  onReset: () => void;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      key="success"
      role="status"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: EASE }}
      className="flex flex-col items-center gap-4 py-8 text-center"
    >
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary shadow-glow-md ring-1 ring-primary/30"
      >
        <LuCircleCheck className="h-7 w-7" />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl font-semibold text-text">Message envoyé !</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-text-muted">
          Merci, on a bien reçu votre message. On vous répond personnellement sous 24 h
          ouvrées.
        </p>
      </div>
      <Button type="button" variant="secondary" onClick={onReset}>
        Envoyer un autre message
      </Button>
    </motion.div>
  );
}

/**
 * Section « Contact » : formulaire accessible (labels liés, erreurs annoncées,
 * `aria-live`) avec nom, e-mail, type de besoin, message et honeypot anti-spam.
 * Validation côté client, états de chargement / succès / erreur animés (Framer
 * Motion, `prefers-reduced-motion` respecté). À côté, l'e-mail en lien mailto et
 * les réseaux sociaux. L'envoi passe par `/api/contact` (Resend) ou Web3Forms.
 */
export function Contact() {
  const reducedMotion = useReducedMotion();
  const uid = useId();
  const animate = !reducedMotion;

  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");

  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    need: useRef<HTMLSelectElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };
  // Mémorise une première tentative d'envoi (déclenche la revalidation en direct).
  // Un ref suffit : cette information ne change pas l'affichage par elle-même.
  const submittedOnceRef = useRef(false);

  const fieldId = (field: string) => `${uid}-${field}`;
  const errorId = (field: string) => `${uid}-${field}-error`;

  const handleChange = (field: keyof Values, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Après une première tentative, on revalide en direct pour un retour immédiat.
    if (submittedOnceRef.current && field !== "company") {
      setErrors(validate(next));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submittedOnceRef.current = true;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const order: Field[] = ["name", "email", "need", "message"];
      const firstInvalid = order.find((field) => nextErrors[field]);
      if (firstInvalid) refs[firstInvalid].current?.focus();
      return;
    }

    // Honeypot rempli → bot : on simule un succès sans rien envoyer.
    if (values.company.trim()) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setSubmitError("");
    try {
      await sendMessage(values);
      setStatus("success");
      setValues(INITIAL_VALUES);
      setErrors({});
      submittedOnceRef.current = false;
    } catch (error) {
      setStatus("error");
      setSubmitError(
        error instanceof Error
          ? error.message
          : "L'envoi a échoué. Réessayez ou écrivez-nous directement."
      );
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setSubmitError("");
  };

  const isSubmitting = status === "submitting";

  return (
    <Section id="contact" aria-label="Formulaire de contact">
      <Container>
        <SectionHeading
          eyebrow="Contact"
          eyebrowIcon={<LuMail />}
          title="Une question ? Écrivez-nous"
          subtitle="Un projet en tête, une simple curiosité ? Laissez-nous un message — on vous répond personnellement et rapidement."
        />

        <div className="mt-12 grid grid-cols-1 items-start gap-8 sm:mt-16 lg:grid-cols-5 lg:gap-10">
          {/* Coordonnées */}
          <motion.div
            initial={animate ? { opacity: 0, y: 24 } : false}
            whileInView={animate ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="lg:col-span-2"
          >
            <ContactInfo />
          </motion.div>

          {/* Formulaire */}
          <motion.div
            initial={animate ? { opacity: 0, y: 24 } : false}
            whileInView={animate ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, ease: EASE, delay: animate ? 0.1 : 0 }}
            className="glass relative overflow-hidden rounded-2xl p-6 shadow-glow-sm sm:p-8 lg:col-span-3"
          >
            {/* Halo orange discret */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 50% at 100% 0%, rgba(255,107,44,0.12), transparent 72%)",
              }}
            />

            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <SuccessPanel key="success" onReset={resetForm} reducedMotion={reducedMotion} />
                ) : (
                  <motion.form
                    key="form"
                    noValidate
                    onSubmit={handleSubmit}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: EASE }}
                    className="flex flex-col gap-5"
                  >
                    {/* Bandeau d'erreur d'envoi (annoncé via role="alert") */}
                    <AnimatePresence>
                      {status === "error" ? (
                        <motion.div
                          key="error"
                          role="alert"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: EASE }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            <LuCircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                            <span>{submitError}</span>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    {/* Nom + e-mail */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor={fieldId("name")} className="mb-1.5 block text-sm font-medium text-text">
                          Nom <span aria-hidden="true" className="text-primary">*</span>
                        </label>
                        <input
                          ref={refs.name}
                          id={fieldId("name")}
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={values.name}
                          onChange={(event) => handleChange("name", event.target.value)}
                          aria-invalid={errors.name ? true : undefined}
                          aria-describedby={errors.name ? errorId("name") : undefined}
                          className={cn(
                            "w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-text transition-[border-color,background-color,box-shadow]",
                            "placeholder:text-text-muted/60 focus:outline-none focus:ring-2",
                            errors.name
                              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                              : "border-white/10 focus:border-primary/50 focus:ring-primary/30"
                          )}
                          placeholder="Votre nom"
                        />
                        {errors.name ? <FieldError id={errorId("name")}>{errors.name}</FieldError> : null}
                      </div>

                      <div>
                        <label htmlFor={fieldId("email")} className="mb-1.5 block text-sm font-medium text-text">
                          E-mail <span aria-hidden="true" className="text-primary">*</span>
                        </label>
                        <input
                          ref={refs.email}
                          id={fieldId("email")}
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          inputMode="email"
                          value={values.email}
                          onChange={(event) => handleChange("email", event.target.value)}
                          aria-invalid={errors.email ? true : undefined}
                          aria-describedby={errors.email ? errorId("email") : undefined}
                          className={cn(
                            "w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-text transition-[border-color,background-color,box-shadow]",
                            "placeholder:text-text-muted/60 focus:outline-none focus:ring-2",
                            errors.email
                              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                              : "border-white/10 focus:border-primary/50 focus:ring-primary/30"
                          )}
                          placeholder="vous@exemple.com"
                        />
                        {errors.email ? <FieldError id={errorId("email")}>{errors.email}</FieldError> : null}
                      </div>
                    </div>

                    {/* Type de besoin */}
                    <div>
                      <label htmlFor={fieldId("need")} className="mb-1.5 block text-sm font-medium text-text">
                        Type de besoin <span aria-hidden="true" className="text-primary">*</span>
                      </label>
                      <select
                        ref={refs.need}
                        id={fieldId("need")}
                        name="need"
                        required
                        value={values.need}
                        onChange={(event) => handleChange("need", event.target.value)}
                        aria-invalid={errors.need ? true : undefined}
                        aria-describedby={errors.need ? errorId("need") : undefined}
                        className={cn(
                          "w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm transition-[border-color,background-color,box-shadow]",
                          "focus:outline-none focus:ring-2",
                          values.need ? "text-text" : "text-text-muted/70",
                          errors.need
                            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                            : "border-white/10 focus:border-primary/50 focus:ring-primary/30"
                        )}
                      >
                        <option value="" disabled className="bg-surface text-text-muted">
                          Sélectionnez…
                        </option>
                        {NEED_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-surface text-text">
                            {option}
                          </option>
                        ))}
                      </select>
                      {errors.need ? <FieldError id={errorId("need")}>{errors.need}</FieldError> : null}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor={fieldId("message")} className="mb-1.5 block text-sm font-medium text-text">
                        Message <span aria-hidden="true" className="text-primary">*</span>
                      </label>
                      <textarea
                        ref={refs.message}
                        id={fieldId("message")}
                        name="message"
                        required
                        rows={5}
                        value={values.message}
                        onChange={(event) => handleChange("message", event.target.value)}
                        aria-invalid={errors.message ? true : undefined}
                        aria-describedby={errors.message ? errorId("message") : undefined}
                        className={cn(
                          "w-full resize-y rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-text transition-[border-color,background-color,box-shadow]",
                          "min-h-[120px] placeholder:text-text-muted/60 focus:outline-none focus:ring-2",
                          errors.message
                            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                            : "border-white/10 focus:border-primary/50 focus:ring-primary/30"
                        )}
                        placeholder="Décrivez votre activité, vos tâches chronophages, ce que vous aimeriez automatiser…"
                      />
                      {errors.message ? (
                        <FieldError id={errorId("message")}>{errors.message}</FieldError>
                      ) : null}
                    </div>

                    {/* Honeypot anti-spam : caché aux humains, laissé vide. */}
                    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                      <label htmlFor={fieldId("company")}>Ne pas remplir</label>
                      <input
                        id={fieldId("company")}
                        name="company"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={values.company}
                        onChange={(event) => handleChange("company", event.target.value)}
                      />
                    </div>

                    {/* Soumission */}
                    <div className="flex flex-col gap-3 pt-1">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        leftIcon={
                          isSubmitting ? (
                            <LuLoaderCircle className="animate-spin" />
                          ) : (
                            <LuSend />
                          )
                        }
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? "Envoi en cours…" : "Envoyer le message"}
                      </Button>
                      <p className="text-xs text-text-muted/80">
                        Vos informations restent confidentielles et ne servent qu&apos;à vous
                        recontacter.
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
