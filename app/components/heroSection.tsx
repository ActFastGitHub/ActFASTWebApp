// app/components/heroSection.tsx

"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Navbar from "@/app/components/siteNavBar";

import AFBuilding from "@/app/images/actfast-building.jpg";
import PhoneIcon from "@/app/images/phone-icon.svg";
import FilipinoSunStars from "@/app/images/3-stars-and-a-sun-1.png";

const ParallaxProvider = dynamic(
  () => import("react-scroll-parallax").then((m) => m.ParallaxProvider),
  { ssr: false },
);

const ParallaxBanner = dynamic(
  () => import("react-scroll-parallax").then((m) => m.ParallaxBanner),
  { ssr: false },
);

const textVariants: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
};

interface HeroSectionProps {
  onPortalClick: () => void;
  phone?: string;
  badgeText?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onPortalClick,
  phone = "+16045185129",
  badgeText,
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  return (
    <ParallaxProvider>
      <ParallaxBanner
        layers={[
          {
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
            speed: -15,
          },
        ]}
        className="relative h-screen overflow-hidden"
      >
        {/* Navbar */}
        <Navbar onPortalClick={onPortalClick} />

        {/* Main Hero Overlay */}
        <div
          ref={ref}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center text-white"
        >
          {/* Filipino 3 Stars and Sun Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-20 z-0 h-[140px] w-[140px] sm:top-20 sm:h-[180px] sm:w-[180px] md:top-24 md:h-[240px] md:w-[240px] lg:top-24 lg:h-[300px] lg:w-[300px] xl:top-24 xl:h-[360px] xl:w-[360px] 2xl:top-28 2xl:h-[420px] 2xl:w-[420px]"
            style={{
              opacity: 0.12,
              transform: "translate(-2%, -20%) rotate(6deg)",
              mixBlendMode: "lighten",
            }}
          >
            <Image
              src={FilipinoSunStars}
              alt=""
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* Subtle readability gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-black/25 via-transparent to-black/10"
          />

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center">
            {badgeText ? (
              <motion.div
                className="mb-4 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold tracking-widest text-white/90 backdrop-blur"
                initial="hidden"
                animate={controls}
                variants={textVariants}
                transition={{
                  duration: 0.6,
                  delay: 0.05,
                }}
              >
                {badgeText}
              </motion.div>
            ) : null}

            <motion.h1
              className="mb-4 text-4xl font-black italic leading-tight sm:text-5xl md:text-6xl"
              initial="hidden"
              animate={controls}
              variants={textVariants}
              transition={{
                duration: 0.6,
              }}
            >
              24/7 EMERGENCY SERVICE
            </motion.h1>

            <motion.p
              className="mb-6 text-lg font-medium md:text-2xl"
              initial="hidden"
              animate={controls}
              variants={textVariants}
              transition={{
                duration: 0.6,
                delay: 0.15,
              }}
            >
              Bringing your home back to life
            </motion.p>

            <motion.a
              layoutId="call-button"
              href={`tel:${phone}`}
              className="flex items-center justify-center rounded bg-red-800 px-4 py-2 font-bold text-white shadow-lg shadow-black/30 transition hover:bg-red-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
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
        </div>
      </ParallaxBanner>
    </ParallaxProvider>
  );
};

export default HeroSection;
