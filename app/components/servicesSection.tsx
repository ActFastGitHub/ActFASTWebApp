"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFlip, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */
type Service = {
  title: string;
  description: string;
  images: string[];
};

const gen = (folder: string, prefix: string, count: number): string[] =>
  Array.from(
    { length: count },
    (_, i) => `/images/${folder}/${prefix} (${i + 1}).jpg`,
  );

const makeService = (
  title: string,
  description: string,
  folder: string,
  prefix: string,
  count: number,
): Service => ({
  title,
  description,
  images: gen(folder, prefix, count),
});

const SERVICES: readonly Service[] = [
  makeService(
    "Water Damage Restoration",
    "Rapid extraction, structural drying, and full repairs after a flood.",
    "WaterDamage",
    "Water",
    45,
  ),
  makeService(
    "Fire Damage Restoration",
    "Soot removal, odor elimination, and complete rebuild after fire loss.",
    "FireDamage",
    "Fire",
    52,
  ),
  makeService(
    "Mold Remediation",
    "Certified inspection, containment, and safe removal of mold colonies.",
    "MoldRemediation",
    "Mold",
    31,
  ),
  makeService(
    "Asbestos Abatement",
    "Licensed testing and removal to keep your home free of asbestos hazards.",
    "AsbestosAbatement",
    "Asbestos",
    9,
  ),
  makeService(
    "General Repairs",
    "Skilled carpentry, drywall, and finishing to restore any part of your home.",
    "GeneralRepairs",
    "Repairs",
    14,
  ),
  makeService(
    "Contents Restoration",
    "Pack-out, specialist cleaning, storage, and insurance coordination.",
    "ContentsRestoration",
    "Contents",
    35,
  ),
];

/* ------------------------------------------------------------------ */
/* lightbox hook                                                      */
/* ------------------------------------------------------------------ */
const useLightbox = () => {
  const [viewer, setViewer] = useState<{ imgs: string[]; idx: number } | null>(
    null,
  );

  const open = useCallback((imgs: string[], idx: number) => {
    setViewer({ imgs, idx });
  }, []);

  const close = useCallback(() => setViewer(null), []);

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight")
        setViewer((v) => v && { ...v, idx: (v.idx + 1) % v.imgs.length });
      if (e.key === "ArrowLeft")
        setViewer(
          (v) =>
            v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length },
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer, close]);

  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) =>
    (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!viewer || startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 50)
      setViewer(
        (v) =>
          v && {
            ...v,
            idx: (v.idx + (dx < 0 ? 1 : -1) + v.imgs.length) % v.imgs.length,
          },
      );
  };

  const overlay =
    viewer && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        onClick={close}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          className="absolute right-4 top-4 z-10 rounded bg-black/60 p-2 text-white backdrop-blur-md"
          onClick={close}
        >
          ✕
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
};

/* ------------------------------------------------------------------ */
/* service card                                                       */
/* ------------------------------------------------------------------ */
const ServiceCard = memo(
  ({
    svc,
    delay,
    openLightbox,
  }: {
    svc: Service;
    delay: number;
    openLightbox: (imgs: string[], idx: number) => void;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial="hidden"
      animate="visible"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.5, delay }}
      className="mx-auto max-w-xs rounded bg-white p-6 text-center shadow-2xl"
    >
      <Swiper
        effect="flip"
        grabCursor
        navigation
        pagination={false}
        modules={[EffectFlip, Navigation]}
        className="mySwiper mb-4"
      >
        {svc.images.map((src, i) => (
          <SwiperSlide key={src}>
            <img
              src={src}
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
              className="h-64 w-full cursor-pointer rounded object-cover object-center"
              onClick={() => openLightbox(svc.images, i)}
              alt={svc.title}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <h3 className="mb-2 text-xl font-semibold">{svc.title}</h3>
      <p className="text-gray-600">{svc.description}</p>
    </motion.div>
  ),
);

/* ------------------------------------------------------------------ */
/* main component                                                     */
/* ------------------------------------------------------------------ */
export default function ServicesSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const controls = useAnimation();
  const { open, overlay } = useLightbox();
  const services = useMemo(() => SERVICES, []);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <section ref={ref} className="bg-gray-800 py-12">
      {overlay}

      <div className="container mx-auto px-4">
        <motion.h2
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: -50 },
          }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-5xl font-bold text-white"
        >
          Our Services
        </motion.h2>

        {/* Mobile: vertical top-to-bottom scroll */}
        <div className="flex flex-col space-y-8 md:hidden">
          {services.map((svc, idx) => (
            <ServiceCard
              key={svc.title}
              svc={svc}
              delay={idx * 0.2}
              openLightbox={open}
            />
          ))}
        </div>

        {/* Tablet/Desktop: horizontal carousel */}
        <div className="hidden md:block">
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            modules={[Pagination, Navigation]}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
          >
            {services.map((svc, idx) => (
              <SwiperSlide key={svc.title}>
                <ServiceCard
                  svc={svc}
                  delay={idx * 0.2}
                  openLightbox={open}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
