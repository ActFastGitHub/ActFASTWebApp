"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Components
import HeroSection from "@/app/components/heroSection";
import ServicesSection from "@/app/components/servicesSection";
import AboutSection from "@/app/components/aboutSection";
import TestimonialsSection from "@/app/components/testimonialSection";
import Footer from "@/app/components/footer";
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

  return (
    <div className="relative">
      <div className={`${showModal ? "blur-sm" : ""}`}>
        <HeroSection onPortalClick={handlePortalClick} />
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <Footer />
      </div>
      {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
    </div>
  );
}
