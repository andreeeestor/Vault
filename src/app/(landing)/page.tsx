import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LandingHeader, Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { SecuritySection } from "@/components/landing/security-section";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta, Footer } from "@/components/landing/footer";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/vault");

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
