"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  useMemo,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Navbar from "@/app/components/siteNavBar";
import Modal from "@/app/components/modal";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ------------------------------------------------------------------ */
/* 1️⃣  raw data                                                       */
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
/* shared slide type                                                  */
/* ------------------------------------------------------------------ */
type Slide = { src: string; label: "Before" | "After" };

/* ------------------------------------------------------------------ */
/* 2️⃣  light‑box with in‑image badge                                  */
/* ------------------------------------------------------------------ */
function useLightbox() {
  const [viewer, setViewer] = useState<{ imgs: Slide[]; idx: number } | null>(
    null,
  );

  const open = (imgs: Slide[], idx: number) => setViewer({ imgs, idx });
  const close = () => setViewer(null);
  const next = () =>
    setViewer((v) => v && { ...v, idx: (v.idx + 1) % v.imgs.length });
  const prev = () =>
    setViewer((v) => v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length });

  /* keyboard nav */
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!viewer) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    },
    [viewer],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  /* swipe */
  const startX = useRef<number | null>(null);
  const touchStart = (x: number) => (startX.current = x);
  const touchEnd = (x: number) => {
    if (!viewer || startX.current === null) return;
    const dx = x - startX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
    startX.current = null;
  };

  /* overlay */
  const overlay =
    viewer && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        onClick={close}
        onPointerDown={(e) => touchStart(e.clientX)}
        onPointerUp={(e) => touchEnd(e.clientX)}
      >
        {/* close button */}
        <button
          className="absolute right-4 top-4 rounded bg-black/60 p-2 text-white"
          onClick={close}
        >
          ✕
        </button>

        {/* Before / After badge (matches carousel style) */}
        <span
          className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {viewer.imgs[viewer.idx].label}
        </span>

        {/* image */}
        <img
          src={viewer.imgs[viewer.idx].src}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
          alt=""
        />
      </div>
    );

  return { open, overlay };
}

/* ------------------------------------------------------------------ */
/* helper → B0 A0 B1 A1 … plus label                                  */
/* ------------------------------------------------------------------ */
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
/* 3️⃣  project block                                                 */
/* ------------------------------------------------------------------ */
const Project = memo(function Project({
  project,
  idx,
  open,
}: {
  project: (typeof projects)[number];
  idx: number;
  open: (imgs: Slide[], i: number) => void;
}) {
  const slides = useMemo(
    () => pairSlides(project.before, project.after),
    [project.before, project.after],
  );

  const { ref, inView } = useInView({ threshold: 0.2 });
  const anim = useAnimation();
  useEffect(() => {
    anim.start(inView ? "visible" : "hidden");
  }, [inView, anim]);

  const rowDir = idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse";

  return (
    <section
      ref={ref}
      className="mx-auto mb-20 max-w-6xl px-4 md:px-6 lg:px-8"
    >
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
            navigation
            // pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            className="aspect-video w-full rounded-lg shadow-lg"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={s.src}>
                <div className="relative h-full w-full">
                  <img
                    src={s.src}
                    alt={`${s.label} image ${i + 1} for ${project.title}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full cursor-pointer object-cover"
                    onClick={() => open(slides, i)}
                  />
                  {/* label overlay */}
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
/* 4️⃣  page component                                                */
/* ------------------------------------------------------------------ */
export default function FeaturedPage() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const lightbox = useLightbox();

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-gray-900 pb-16 pt-24">
      {lightbox.overlay}
      <Navbar onPortalClick={() => setShowModal(true)} />

      <h1 className="mx-auto mb-14 max-w-6xl px-4 text-center text-4xl font-extrabold text-white lg:text-6xl">
        Featured Projects
      </h1>

      {projects.map((p, i) => (
        <Project key={i} project={p} idx={i} open={lightbox.open} />
      ))}

      {mounted && (
        <Modal showModal={showModal} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
