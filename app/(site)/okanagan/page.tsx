"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

import { LightboxProvider, useLightbox } from "@/app/context/LightboxProvider";
import HeroSection from "@/app/components/heroSection";
import StickyContactButtons from "@/app/components/stickyContactButtons";
import Modal from "@/app/components/modal";
import BranchLocationSection from "@/app/components/branchLocationSection";

import { OKANAGAN_BRANCH } from "@/app/config/branches";

const ContactUsSection = dynamic(() => import("@/app/components/ContactUs"));
const Footer = dynamic(() => import("@/app/components/footer"));

function OkanaganContent() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.25 });
  const [showModal, setShowModal] = useState(false);

  const { isOpen: isLightboxOpen } = useLightbox();

  useEffect(() => {
    if (showModal || isLightboxOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, isLightboxOpen]);

  return (
    <div className="relative">
      <div
        className={`overflow-hidden ${showModal ? "overflow-hidden blur-3xl filter" : ""}`}
      >
        {/* HERO */}
        <section ref={heroRef}>
          <HeroSection
            onPortalClick={() => setShowModal(true)}
            phone={OKANAGAN_BRANCH.phone}
            badgeText={`OKANAGAN BRANCH • ${OKANAGAN_BRANCH.sinceLabel ?? ""}`}
          />
        </section>

        {/* BRANCH LOCATION */}
        <BranchLocationSection
          title="Okanagan Branch"
          sinceLabel={OKANAGAN_BRANCH.sinceLabel}
          addressText={OKANAGAN_BRANCH.addressText}
          addressUrl={OKANAGAN_BRANCH.addressUrl}
          mapEmbedSrc={OKANAGAN_BRANCH.mapEmbedSrc}
          phone={OKANAGAN_BRANCH.phone}
          email={OKANAGAN_BRANCH.email}
          serviceAreas={OKANAGAN_BRANCH.serviceAreas}
        />

        {/* Keep same contact + footer */}
        <ContactUsSection />
        <Footer />
      </div>

      <Modal showModal={showModal} onClose={() => setShowModal(false)} />

      <StickyContactButtons
        show={!heroInView && !showModal && !isLightboxOpen}
        phone={OKANAGAN_BRANCH.phone}
        email={OKANAGAN_BRANCH.email}
      />
    </div>
  );
}

export default function OkanaganPage() {
  return (
    <LightboxProvider>
      <OkanaganContent />
    </LightboxProvider>
  );
}
