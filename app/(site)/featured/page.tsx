"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Navbar from "@/app/components/siteNavBar";
import Modal  from "@/app/components/modal";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ------------------------------------------------------------------ */
/* 1️⃣  Data (add more projects as needed)                             */
/* ------------------------------------------------------------------ */
const projects = [
  {
    title: "Agas Fire Restoration",
    description:
      "Complete rebuild of a house totally destroyed by fire—restored better than new.",
    before: [
      "/images/Projects/Agas/Before/Before (1).jpg",
      "/images/Projects/Agas/Before/Before (2).jpg",
      "/images/Projects/Agas/Before/Before (3).jpg",
      "/images/Projects/Agas/Before/Before (4).jpg",
      "/images/Projects/Agas/Before/Before (5).jpg",
      "/images/Projects/Agas/Before/Before (6).jpg",
    ],
    after: [
      "/images/Projects/Agas/After/After (1).jpg",
      "/images/Projects/Agas/After/After (2).jpg",
      "/images/Projects/Agas/After/After (3).jpg",
      "/images/Projects/Agas/After/After (4).jpg",
      "/images/Projects/Agas/After/After (5).jpg",
      "/images/Projects/Agas/After/After (6).jpg",
    ],
  },
  {
    title: "Agas Fire Restoration",
    description:
      "Complete rebuild of a house totally destroyed by fire—restored better than new.",
    before: [
      "/images/Projects/Agas/Before/Before (1).jpg",
      "/images/Projects/Agas/Before/Before (2).jpg",
      "/images/Projects/Agas/Before/Before (3).jpg",
      "/images/Projects/Agas/Before/Before (4).jpg",
      "/images/Projects/Agas/Before/Before (5).jpg",
      "/images/Projects/Agas/Before/Before (6).jpg",
    ],
    after: [
      "/images/Projects/Agas/After/After (1).jpg",
      "/images/Projects/Agas/After/After (2).jpg",
      "/images/Projects/Agas/After/After (3).jpg",
      "/images/Projects/Agas/After/After (4).jpg",
      "/images/Projects/Agas/After/After (5).jpg",
      "/images/Projects/Agas/After/After (6).jpg",
    ],
  },
  {
    title: "Agas Fire Restoration",
    description:
      "Complete rebuild of a house totally destroyed by fire—restored better than new.",
    before: [
      "/images/Projects/Agas/Before/Before (1).jpg",
      "/images/Projects/Agas/Before/Before (2).jpg",
      "/images/Projects/Agas/Before/Before (3).jpg",
      "/images/Projects/Agas/Before/Before (4).jpg",
      "/images/Projects/Agas/Before/Before (5).jpg",
      "/images/Projects/Agas/Before/Before (6).jpg",
    ],
    after: [
      "/images/Projects/Agas/After/After (1).jpg",
      "/images/Projects/Agas/After/After (2).jpg",
      "/images/Projects/Agas/After/After (3).jpg",
      "/images/Projects/Agas/After/After (4).jpg",
      "/images/Projects/Agas/After/After (5).jpg",
      "/images/Projects/Agas/After/After (6).jpg",
    ],
  },
  // — add more project objects here —
];

/* ------------------------------------------------------------------ */
/* 2️⃣  Light-box hook (unchanged API)                                 */
/* ------------------------------------------------------------------ */
function useLightbox() {
  const [viewer, setViewer] = useState<{ imgs: string[]; idx: number } | null>(
    null,
  );

  const open  = (imgs: string[], idx: number) => setViewer({ imgs, idx });
  const close = () => setViewer(null);
  const next  = () =>
    setViewer((v) => v && { ...v, idx: (v.idx + 1) % v.imgs.length });
  const prev  = () =>
    setViewer((v) => v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length });

  /* keyboard */
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
  const onStart = (x: number) => (startX.current = x);
  const onEnd = (x: number) => {
    if (startX.current === null || !viewer) return;
    const dx = x - startX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
    startX.current = null;
  };

  const overlay = viewer && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={close}
      onPointerDown={(e) => onStart(e.clientX)}
      onPointerUp={(e) => onEnd(e.clientX)}
    >
      {/* close btn */}
      <button
        className="absolute right-4 top-4 z-10 rounded bg-black/60 p-2 text-white backdrop-blur-md"
        onClick={close}
      >
        ✕
      </button>
      {/* mobile arrows */}
      <button
        className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded bg-black/60 p-2 text-white md:block md:hidden"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
      >
        ◀
      </button>
      <button
        className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded bg-black/60 p-2 text-white md:block md:hidden"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
      >
        ▶
      </button>

      <img
        src={viewer.imgs[viewer.idx]}
        alt=""
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  return { open, overlay };
}

/* ------------------------------------------------------------------ */
/* 3️⃣  Helper: interleave before/after arrays                         */
/* ------------------------------------------------------------------ */
function interleave(a: string[], b: string[]) {
  const out: string[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 4️⃣  Project section (wide / responsive)                            */
/* ------------------------------------------------------------------ */
function ProjectSection({
  project,
  idx,
  open,
}: {
  project: typeof projects[number];
  idx: number;
  open: (imgs: string[], i: number) => void;
}) {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const controls = useAnimation();
  useEffect(() => { controls.start(inView ? "visible" : "hidden"); }, [inView, controls]);

  const allSlides = interleave(project.before, project.after);

  const isEven = idx % 2 === 0;

  return (
    <section
      ref={ref}
      className="mx-auto mb-20 max-w-6xl px-4 md:px-6 lg:px-8"
    >
      <div
        className={`flex flex-col items-center ${
          isEven ? "lg:flex-row" : "lg:flex-row-reverse"
        } lg:space-x-8`}
      >
        {/* carousel */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{ visible: { opacity: 1, x: 0 }, hidden: { opacity: 0, x: isEven ? -50 : 50 } }}
          transition={{ duration: 0.5 }}
          className="w-full flex-shrink-0 lg:w-1/2"
        >
          <Swiper
            navigation
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            className="aspect-video w-full rounded-lg shadow-lg"
          >
            {allSlides.map((src, i) => (
              <SwiperSlide key={src}>
                <img
                  src={src}
                  alt={`${project.title} slide`}
                  className="h-full w-full cursor-pointer object-cover"
                  onClick={() => open(allSlides, i)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* text */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 50 } }}
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
}

/* ------------------------------------------------------------------ */
/* 5️⃣  Page                                                           */
/* ------------------------------------------------------------------ */
export default function FeaturedPage() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const lightbox = useLightbox();

  const { ref, inView } = useInView({ threshold: 0.2 });
  const controls = useAnimation();
  useEffect(() => { controls.start(inView ? "visible" : "hidden"); }, [inView, controls]);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-gray-900 pb-16">
      {lightbox.overlay}
      <Navbar onPortalClick={() => setShowModal(true)} />

      <motion.h1
        ref={ref}
        className="mx-auto mt-24 mb-14 max-w-6xl px-4 text-center text-4xl font-extrabold text-white lg:text-6xl"
        initial="hidden"
        animate={controls}
        variants={{ visible: { opacity: 1, y: 10 }, hidden: { opacity: 0, y: 50 } }}
        transition={{ duration: 0.5 }}
      >
        Featured Projects
      </motion.h1>

      {projects.map((p, i) => (
        <ProjectSection key={i} project={p} idx={i} open={lightbox.open} />
      ))}

      {mounted && <Modal showModal={showModal} onClose={() => setShowModal(false)} />}
    </div>
  );
}
