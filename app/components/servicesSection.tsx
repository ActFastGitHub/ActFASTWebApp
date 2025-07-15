/* ------------------------------------------------------------------
   ServicesSection.tsx
   ------------------------------------------------------------------ */
"use client";

import React, { useEffect, useMemo, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { useLightbox } from "@/app/context/LightboxProvider"; // 

/* ------------------------------------------------------------------ */
/* helpers                                                             */
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
/* ServiceCard – Swiper uses fade + lazyPreloadPrevNext               */
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
        effect="fade"
        grabCursor
        navigation
        pagination={false}
        lazyPreloadPrevNext={1}
        modules={[EffectFade, Navigation]}
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
/* Lazy wrapper – mounts a card only when near viewport               */
/* ------------------------------------------------------------------ */
const LazyCard = ({
  svc,
  idx,
  open,
}: {
  svc: Service;
  idx: number;
  open: (imgs: string[], idx: number) => void;
}) => {
  const { ref, inView } = useInView({ triggerOnce: true });
  return (
    <div ref={ref} style={{ minHeight: 400 }}>
      {inView ? (
        <ServiceCard svc={svc} delay={idx * 0.2} openLightbox={open} />
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* main component                                                     */
/* ------------------------------------------------------------------ */
export default function ServicesSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const controls = useAnimation();
  const open = useLightbox();           // ⬅️ provider gives us the opener
  const services = useMemo(() => SERVICES, []);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <section ref={ref} className="bg-gray-800 py-12">
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

        {/* Mobile: vertical list – cards virtualised */}
        <div className="flex flex-col space-y-8 md:hidden">
          {services.map((svc, idx) => (
            <LazyCard key={svc.title} svc={svc} idx={idx} open={open} />
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
