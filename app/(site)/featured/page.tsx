/* ------------------------------------------------------------------
   FeaturedPage.tsx – shows “Before / After” badge inside light‑box
   ------------------------------------------------------------------ */
"use client";

import React, { useEffect, useMemo, useState, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import Navbar from "@/app/components/siteNavBar";
import Modal from "@/app/components/modal";

import {
  LightboxProvider,
  useLightbox,
  type LightboxItem,
} from "@/app/context/LightboxProvider";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ------------------------------------------------------------------ */
/* raw project data                                                   */
/* ------------------------------------------------------------------ */
const projects = [
  {
    title: "Agas Fire Restoration",
    description:
      "This home was completely destroyed by fire and required a full rebuild from the foundation up. Today, it stands fully restored—stronger, safer, and better than ever before.",
    before: Array.from(
      { length: 6 },
      (_, i) => `/images/Projects/Agas/Before/Before (${i + 1}).jpg`,
    ),
    after: Array.from(
      { length: 6 },
      (_, i) => `/images/Projects/Agas/After/After (${i + 1}).jpg`,
    ),
  },
  {
    title: "EPS Fire Restoration",
    description:
      "After a severe fire left this duplex completely destroyed, our team rebuilt the home from the ground up. The result is a fully restored and modernized property that reflects expert craftsmanship and a commitment to quality.",
    before: Array.from(
      { length: 32 },
      (_, i) => `/images/Projects/EPS/Before/Before (${i + 1}).jpg`,
    ),
    after: Array.from(
      { length: 32 },
      (_, i) => `/images/Projects/EPS/After/After (${i + 1}).jpg`,
    ),
  },
];

/* ------------------------------------------------------------------ */
/* helper – interleave before / after and tag with label              */
/* ------------------------------------------------------------------ */
type Slide = { src: string; label: "Before" | "After" };

const pairSlides = (before: string[], after: string[]): Slide[] => {
  const out: Slide[] = [];
  const max = Math.max(before.length, after.length);
  for (let i = 0; i < max; i++) {
    if (before[i]) out.push({ src: before[i], label: "Before" });
    if (after[i]) out.push({ src: after[i], label: "After" });
  }
  return out;
};

/* ------------------------------------------------------------------ */
/* project block                                                      */
/* ------------------------------------------------------------------ */
const Project = memo(function Project({
  project,
  idx,
  openLightbox,
}: {
  project: (typeof projects)[number];
  idx: number;
  openLightbox: (imgs: LightboxItem[], i: number) => void;
}) {
  const slides = useMemo(
    () => pairSlides(project.before, project.after),
    [project.before, project.after],
  );

  /* fade‑in when in view */
  const { ref, inView } = useInView({ threshold: 0.2 });
  const anim = useAnimation();
  useEffect(() => {
    anim.start(inView ? "visible" : "hidden");
  }, [inView, anim]);

  const rowDir = idx % 2 ? "lg:flex-row-reverse" : "lg:flex-row";

  return (
    <section ref={ref} className="mx-auto mb-20 max-w-6xl px-4 md:px-6 lg:px-8">
      <div className={`flex flex-col items-center ${rowDir} lg:space-x-8`}>
        {/* slideshow */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: idx % 2 ? 50 : -50 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          animate={anim}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2"
        >
          <Swiper
            className="aspect-video w-full rounded-lg shadow-lg"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={s.src}>
                <div className="relative h-full w-full">
                  <img
                    src={s.src}
                    alt={`${s.label} image ${i + 1} for ${project.title}`}
                    className="h-full w-full cursor-pointer object-cover"
                    onClick={() => openLightbox(slides, i)}
                  />
                  {/* label on slide */}
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    {s.label}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* description */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate={anim}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 w-full lg:mt-0 lg:w-1/2"
        >
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            {project.title}
          </h2>
          <p className="text-gray-200">{project.description}</p>
        </motion.div>
      </div>
    </section>
  );
});

/* ------------------------------------------------------------------ */
/* inner page – uses hook                                             */
/* ------------------------------------------------------------------ */
function FeaturedPageInner() {
  const openLightbox = useLightbox();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 pb-16 pt-24 overflow-x-hidden touch-pan-y">
      <Navbar onPortalClick={() => setShowModal(true)} />

      <h1 className="mx-auto mb-14 max-w-6xl px-4 text-center text-4xl font-extrabold text-white lg:text-6xl">
        Featured Projects
      </h1>

      {projects.map((p, i) => (
        <Project key={i} project={p} idx={i} openLightbox={openLightbox} />
      ))}

      <Modal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* exported page wrapped with provider                                */
/* ------------------------------------------------------------------ */
export default function FeaturedPage() {
  return (
    <LightboxProvider>
      <FeaturedPageInner />
    </LightboxProvider>
  );
}
