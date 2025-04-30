"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFlip, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ---------- service list (folder-only) ---------- */
type Service = { title: string; description: string; folder: string };

const services: readonly Service[] = [
  { title: "Water Damage Restoration", description: "Rapid extraction, structural drying, and full repairs after a flood.", folder: "WaterDamage" },
  { title: "Fire Damage Restoration",  description: "Soot removal, odor elimination, and complete rebuild after fire loss.", folder: "FireDamage" },
  { title: "Mold Remediation",         description: "Certified inspection, containment, and safe removal of mold colonies.", folder: "MoldRemediation" },
  { title: "Asbestos Abatement",       description: "Licensed testing and removal to keep your home free of asbestos hazards.", folder: "AsbestosAbatement" },
  { title: "General Repairs",          description: "Skilled carpentry, drywall, and finishing to restore any part of your home.", folder: "GeneralRepairs" },
  { title: "Contents Restoration",     description: "Pack-out, specialist cleaning, storage, and insurance coordination.", folder: "ContentsRestoration" },
];

/* ------------------------------------------------------------------ */
/* 1️⃣  Light-box helper                                              */
/* ------------------------------------------------------------------ */
function useLightbox() {
  const [viewer, setViewer] = useState<{ imgs: string[]; idx: number } | null>(null);

  const open  = (imgs: string[], idx: number) => setViewer({ imgs, idx });
  const close = () => setViewer(null);
  const next  = () => viewer && setViewer({ ...viewer, idx: (viewer.idx + 1) % viewer.imgs.length });
  const prev  = () => viewer && setViewer({ ...viewer, idx: (viewer.idx - 1 + viewer.imgs.length) % viewer.imgs.length });

  /* keyboard */
  const onKey = useCallback((e: KeyboardEvent) => {
    if (!viewer) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft")  prev();
  }, [viewer]);
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  /* swipe */
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (startX.current === null || !viewer) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    startX.current = null;
  };

  const overlay = viewer && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={close}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* close */}
      <button className="absolute right-4 top-4 z-10 rounded bg-black/60 p-2 text-white backdrop-blur-md" onClick={close}>
        ✕
      </button>
      {/* arrows (mobile-only) */}
      <button
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded bg-black/60 p-2 text-white md:hidden"
        onClick={(e) => { e.stopPropagation(); prev(); }}
      >
        ◀
      </button>
      <button
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded bg-black/60 p-2 text-white md:hidden"
        onClick={(e) => { e.stopPropagation(); next(); }}
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
/* 2️⃣  Services section                                              */
/* ------------------------------------------------------------------ */
export default function ServicesSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const controls = useAnimation();
  const lightbox = useLightbox();

  const [imagesByFolder, setImagesByFolder] = useState<Record<string, string[]>>({});
  useEffect(() => { controls.start(inView ? "visible" : "hidden"); }, [inView, controls]);

  /* fetch all folders once */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        services.map(async (svc) => {
          const res  = await fetch(`/api/images?folder=${svc.folder}`);
          const list = (await res.json()) as string[];
          return [svc.folder, list] as const;
        }),
      );
      if (!cancelled) setImagesByFolder(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section ref={ref} className="bg-gray-800 py-12">
      {lightbox.overlay}
      <div className="container mx-auto px-4">
        <motion.h2
          initial="hidden"
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: -50 } }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-5xl font-bold text-white"
        >
          Our Services
        </motion.h2>

        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          modules={[Pagination, Navigation]}
          breakpoints={{
            640:  { slidesPerView: 1 },
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {services.map((svc, idx) => {
            const imgs = imagesByFolder[svc.folder] ?? [];
            return (
              <SwiperSlide key={svc.title}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial="hidden"
                  animate={controls}
                  variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 50 } }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="mx-auto max-w-xs rounded bg-white p-6 text-center shadow-2xl"
                >
                  {/* nested flip swiper */}
                  {imgs.length ? (
                    <Swiper
                      effect="flip"
                      grabCursor
                      navigation
                      pagination={false}
                      modules={[EffectFlip, Navigation]}
                      className="mySwiper mb-4"
                    >
                      {imgs.map((src, i) => (
                        <SwiperSlide key={src}>
                          <img
                            src={src}
                            alt={svc.title}
                            className="h-64 w-full cursor-pointer rounded object-cover object-center"
                            onClick={() => lightbox.open(imgs, i)}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="mb-4 flex h-64 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                      Loading…
                    </div>
                  )}

                  <h3 className="mb-2 text-xl font-semibold">{svc.title}</h3>
                  <p className="text-gray-600">{svc.description}</p>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
