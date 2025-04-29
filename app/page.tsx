"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

// Components
import HeroSection from "@/app/components/heroSection";
import ServicesSection from "@/app/components/servicesSection";
import AboutSection from "@/app/components/aboutSection";
import TestimonialsSection from "@/app/components/testimonialSection";
import VideoSection from "@/app/components/VideoSection";
import Footer from "@/app/components/footer";
import StickyContactButtons from "@/app/components/stickyContactButtons";
import Modal from "@/app/components/modal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
    } else if (session.user.isNewUser) {
      router.push("/create-profile");
    }

    setIsMounted(true);
  }, [session, status, router]);

  const handlePortalClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const videoList = [
    {
      title: "Client Testimonial – Family Restoration",
      embedUrl: "https://www.youtube.com/embed/0aC4SnM3HDI?si=Up6QQoim1Zvm8ZXW",
    },
    {
      title: "Before & After: Water Damage Repair",
      embedUrl: "https://www.youtube.com/embed/0aC4SnM3HDI?si=KCczt_koGhYYoeEY",
    },
    {
      title: "Project Highlight: Basement Renovation",
      embedUrl: "https://www.youtube.com/embed/0aC4SnM3HDI?si=KCczt_koGhYYoeEY",
    },
    {
      title: "Project Highlight: Basement Renovation AAAA",
      embedUrl: "https://www.youtube.com/embed/0aC4SnM3HDI?si=KCczt_koGhYYoeEY",
    },
    {
      title: "Project Highlight: Basement Renovation BBBB",
      embedUrl: "https://www.youtube.com/embed/0aC4SnM3HDI?si=KCczt_koGhYYoeEY",
    },
  ];

  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.2, // 20 % visible counts as “in view”
  });

  return (
    <div className="relative">
      <div className={`${showModal ? "blur-sm" : ""}`}>
        <section ref={heroRef}>
          <HeroSection onPortalClick={handlePortalClick} />
        </section>
        <ServicesSection />
        <AboutSection />
        {/* <VideoSection videos={videoList} /> */}
        <TestimonialsSection />
        <Footer />
      </div>
      {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
      <StickyContactButtons show={!heroInView} />
    </div>
  );
}
