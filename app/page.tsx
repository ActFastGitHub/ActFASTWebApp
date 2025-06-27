"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";

// dynamic-load heavy sections so hero JS runs first
import dynamic from "next/dynamic";
const ServicesSection   = dynamic(() => import("@/app/components/servicesSection"));
const AboutSection      = dynamic(() => import("@/app/components/aboutSection"));
const TestimonialsSection = dynamic(() => import("@/app/components/testimonialSection"));
const Footer            = dynamic(() => import("@/app/components/footer"));
const ContactUsSection = dynamic(() => import("@/app/components/ContactUs"));

import HeroSection        from "@/app/components/heroSection";
import StickyContactButtons from "@/app/components/stickyContactButtons";
// import ContactUsSection from "@/app/components/ContactUs";
import Modal               from "@/app/components/modal";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  /* 1️⃣ always start at the top on first mount */
  useEffect(() => {
    window.scrollTo(0, 0);
    // if you *only* want this on hard reloads, guard with
    // if (performance?.navigation?.type === 1 /* TYPE_RELOAD */) ...
  }, []);

  /* 2️⃣ handle auth redirects (unchanged) */
  useEffect(() => {
    if (status === "loading") return;
    if (!session)           router.push("/");
    else if (session.user.isNewUser) router.push("/create-profile");
  }, [session, status, router]);

  /* 3️⃣ hero in-view state = sticky CTA */
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.25 });
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative">
      <div className={showModal ? "blur-sm" : ""}>
        <section ref={heroRef}>
          <HeroSection onPortalClick={() => setShowModal(true)} />
        </section>

        {/* large sections are now client-side streamed; JS parsed *after* hero */}
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactUsSection />
        <Footer />
      </div>

      <Modal showModal={showModal} onClose={() => setShowModal(false)} />
      <StickyContactButtons show={!heroInView} />
    </div>
  );
}
