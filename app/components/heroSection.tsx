"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Navbar from "@/app/components/siteNavBar";

import AFBuilding from "@/app/images/actfast-building.jpg";
import PhoneIcon from "@/app/images/phone-icon.svg";

/* ------------------------------------------------------------------ */
/*  1️⃣  lazy-load the heavy parallax bundle, client-side only         */
/* ------------------------------------------------------------------ */
const ParallaxProvider = dynamic(
  () => import("react-scroll-parallax").then((m) => m.ParallaxProvider),
  { ssr: false },
);
const ParallaxBanner = dynamic(
  () => import("react-scroll-parallax").then((m) => m.ParallaxBanner),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/*  2️⃣  motion variants (cached outside component = no re-creation)   */
/* ------------------------------------------------------------------ */
const textVariants: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
};

interface HeroSectionProps {
  onPortalClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onPortalClick }) => {
  /* view-triggered animation (run once → smoother) */
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.25 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <ParallaxProvider>
      <ParallaxBanner
        layers={[
          {
            /* priority, responsive, better decoding */
            children: (
              <Image
                src={AFBuilding}
                alt="ActFAST restoration headquarters"
                fill
                priority
                placeholder="blur"
                sizes="100vw"
                className="object-cover"
              />
            ),
            speed: -15, // slightly less extreme than -20 = fewer re-flows
          },
        ]}
        className="relative h-screen"
      >
        {/* Sticky nav rendered immediately (no motion) */}
        <Navbar onPortalClick={onPortalClick} />

        {/* Overlay text */}
        <div
          ref={ref}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center text-white"
        >
          <motion.h1
            className="mb-4 text-5xl font-black italic md:text-6xl"
            initial="hidden"
            animate={controls}
            variants={textVariants}
            transition={{ duration: 0.6 }}
          >
            24/7 EMERGENCY SERVICE
          </motion.h1>

          <motion.p
            className="mb-6 text-lg md:text-2xl"
            initial="hidden"
            animate={controls}
            variants={textVariants}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Bringing your home back to life
          </motion.p>

          <motion.a
            layoutId="call-button"
            href="tel:+16045185129"
            className="flex items-center justify-center rounded bg-red-800 px-4 py-2 font-bold text-white hover:bg-red-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Image
              src={PhoneIcon}
              alt="phone"
              width={24}
              height={24}
              priority
              className="mr-2"
            />
            CALL NOW
          </motion.a>
        </div>
      </ParallaxBanner>
    </ParallaxProvider>
  );
};

export default HeroSection;