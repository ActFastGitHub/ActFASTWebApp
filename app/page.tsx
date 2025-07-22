/* ------------------------------------------------------------------
   page.tsx  (or Home.tsx)
   ------------------------------------------------------------------ */
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

import { LightboxProvider } from "@/app/context/LightboxProvider";
import HeroSection from "@/app/components/heroSection";
import StickyContactButtons from "@/app/components/stickyContactButtons";
import Modal from "@/app/components/modal";

/* ---------- lazy‑loaded sections ---------------------------------- */
const ServicesSection = dynamic(
  () => import("@/app/components/servicesSection")
);
const AboutSection = dynamic(() => import("@/app/components/aboutSection"));
const TestimonialsSection = dynamic(
  () => import("@/app/components/testimonialSection")
);
const VideoCarouselSection = dynamic(
  () => import("@/app/components/VideoSection")
);
const ContactUsSection = dynamic(() => import("@/app/components/ContactUs"));
const Footer = dynamic(() => import("@/app/components/footer"));

/* ---------- sample video data ------------------------------------- */
const videos = [
  {
    title: "ActFast Services",
    embedUrl: "https://www.youtube.com/embed/ucaVv-l8HNA?si=lLsRxhbsokLwQxnw",
  },
  {
    title: "Client Success Story",
    embedUrl: "https://www.youtube.com/embed/MsBvmce8z5U?si=CmEkoa8XB5Px6hf9",
  },
  {
    title: "Promotional Video",
    embedUrl: "https://www.youtube.com/embed/sthdYDd4hPk?si=ZL6KMJNfndfJGvGl",
  },
];

/* ------------------------------------------------------------------
   main page component
   ------------------------------------------------------------------ */
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  /* 1️⃣ always start at the top */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* 2️⃣ auth redirects */
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");
    else if (session.user.isNewUser) router.push("/create-profile");
  }, [session, status, router]);

  /* 3️⃣ hero visibility for sticky CTA */
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.25 });
  const [showModal, setShowModal] = useState(false);

  // lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  return (
    <LightboxProvider>
      <div className="relative">
        {/* blurred & scroll‑locked background when showModal=true */}
        <div
          className={`overflow-x-hidden touch-pan-y ${
            showModal ? "filter blur-3xl overflow-hidden" : ""
          }`}
        >
          {/* HERO */}
          <section ref={heroRef}>
            <HeroSection onPortalClick={() => setShowModal(true)} />
          </section>

          {/* MAIN CONTENT */}
          <ServicesSection />
          <AboutSection />
          <TestimonialsSection />

          {/* 🎬 VIDEO GALLERY */}
          <VideoCarouselSection videos={videos} />

          <ContactUsSection />
          <Footer />
        </div>

        {/* PORTAL & STICKY CTA */}
        <Modal showModal={showModal} onClose={() => setShowModal(false)} />

        {/* Only show the sticky buttons if both:
             • the hero is out of view (heroInView = false), AND
             • the modal is closed (showModal = false) */}
        <StickyContactButtons show={!heroInView && !showModal} />
      </div>
    </LightboxProvider>
  );
}