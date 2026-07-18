import { LandingHeader, Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { SecuritySection } from "@/components/landing/security-section";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta, Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <Hero />
      <Features />
      <SecuritySection />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
