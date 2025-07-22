"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

import { LightboxProvider, useLightbox } from "@/app/context/LightboxProvider";
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

function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");
    else if (session.user.isNewUser) router.push("/create-profile");
  }, [session, status, router]);

  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.25 });
  const [showModal, setShowModal] = useState(false);

  // 👇 Get lightbox open state from context!
  const { isOpen: isLightboxOpen } = useLightbox();

  // Centralized scroll lock for modal and lightbox
  useEffect(() => {
    if (showModal || isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, isLightboxOpen]);

  return (
    <div className="relative">
      <div className={`overflow-hidden ${showModal ? "filter blur-3xl overflow-hidden" : ""}`}>
        {/* HERO */}
        <section ref={heroRef}>
          <HeroSection onPortalClick={() => setShowModal(true)} />
        </section>
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <VideoCarouselSection videos={videos} />
        <ContactUsSection />
        <Footer />
      </div>
      <Modal showModal={showModal} onClose={() => setShowModal(false)} />
      <StickyContactButtons show={!heroInView && !showModal && !isLightboxOpen} />
    </div>
  );
}

export default function Home() {
  return (
    <LightboxProvider>
      <HomeContent />
    </LightboxProvider>
  );
}
