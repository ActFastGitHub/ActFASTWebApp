"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import type { VideoCarouselSectionProps } from "@/app/components/VideoSection";

// ⏩ Hero loads first; heavier sections stream in later
const ServicesSection       = dynamic(() => import("@/app/components/servicesSection"));
const AboutSection          = dynamic(() => import("@/app/components/aboutSection"));
const TestimonialsSection   = dynamic(() => import("@/app/components/testimonialSection"));
const VideoCarouselSection  = dynamic<VideoCarouselSectionProps>(() => import("@/app/components/VideoSection"));
const ContactUsSection      = dynamic(() => import("@/app/components/ContactUs"));
const Footer                = dynamic(() => import("@/app/components/footer"));

import HeroSection          from "@/app/components/heroSection";
import StickyContactButtons from "@/app/components/stickyContactButtons";
import Modal                from "@/app/components/modal";

/** ------------------------------------------------------------------ */
/** Replace (or fetch) with your real video data                       */
/** ------------------------------------------------------------------ */
const videos = [  
  {
    title: "Client Success Story",
    embedUrl: "https://www.youtube.com/embed/sthdYDd4hPk?si=b3fkpUwD-OHvEgIu",
  },
] satisfies Array<{ title: string; embedUrl: string }>;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  /* 1️⃣ Always start at the top on first mount */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* 2️⃣ Handle auth redirects */
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");
    else if (session.user.isNewUser) router.push("/create-profile");
  }, [session, status, router]);

  /* 3️⃣ Track hero visibility for sticky call-to-action (CTA) */
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.25 });
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative">
      <div className={showModal ? "blur-sm" : ""}>
        {/* HERO */}
        <section ref={heroRef}>
          <HeroSection onPortalClick={() => setShowModal(true)} />
        </section>

        {/* MAIN CONTENT */}
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />

        {/* 🎬  NEW VIDEO GALLERY  */}
        <VideoCarouselSection videos={videos} />

        <ContactUsSection />
        <Footer />
      </div>

      {/* PORTAL & STICKY CTA */}
      <Modal showModal={showModal} onClose={() => setShowModal(false)} />
      <StickyContactButtons show={!heroInView} />
    </div>
  );
}
