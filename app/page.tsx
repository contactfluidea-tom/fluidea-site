import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { SocialProof } from "@/components/sections/SocialProof";
import { Process } from "@/components/sections/Process";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { Booking } from "@/components/sections/Booking";
import { Contact } from "@/components/sections/Contact";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute:
      "Fluidea — Automatisation IA sur-mesure pour entrepreneurs, freelances et PME",
  },
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <Process />
      <Work />
      <About />
      <Testimonials />
      <Pricing />
      <Booking />
      <Contact />
      {/* La FAQ vit désormais sur une page dédiée : /faq */}
    </main>
  );
}
