
"use client";

import React, { useEffect, useMemo, memo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useLightbox } from "@/app/context/LightboxProvider";
import { EyeIcon } from "@heroicons/react/24/outline";

// Utility: detect mobile via window width (you could swap this for a hook if needed)
const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

type Service = {
  title: string;
  description: string;
  images: string[];
  color: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  Water: "bg-blue-400",
  Fire: "bg-orange-500",
  Mold: "bg-green-500",
  Asbestos: "bg-gray-500",
  Repairs: "bg-yellow-400",
  Contents: "bg-purple-400",
};

const getColor = (prefix: string) =>
  CATEGORY_COLORS[prefix] || "bg-gray-400";

const gen = (folder: string, prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `/images/${folder}/${prefix} (${i + 1}).jpg`);

const makeService = (
  title: string,
  description: string,
  folder: string,
  prefix: string,
  count: number
): Service => ({
  title,
  description,
  images: gen(folder, prefix, count),
  color: getColor(prefix),
});

const SERVICES: readonly Service[] = [
  makeService(
    "Water Damage Restoration",
    "Rapid extraction, structural drying, and full repairs after a flood.",
    "WaterDamage",
    "Water",
    45
  ),
  makeService(
    "Fire Damage Restoration",
    "Soot removal, odor elimination, and complete rebuild after fire loss.",
    "FireDamage",
    "Fire",
    52
  ),
  makeService(
    "Mold Remediation",
    "Certified inspection, containment, and safe removal of mold colonies.",
    "MoldRemediation",
    "Mold",
    31
  ),
  makeService(
    "Asbestos Abatement",
    "Licensed testing and removal to keep your home free of asbestos hazards.",
    "AsbestosAbatement",
    "Asbestos",
    9
  ),
  makeService(
    "General Repairs",
    "Skilled carpentry, drywall, and finishing to restore any part of your home.",
    "GeneralRepairs",
    "Repairs",
    14
  ),
  makeService(
    "Contents Restoration",
    "Pack-out, specialist cleaning, storage, and insurance coordination.",
    "ContentsRestoration",
    "Contents",
    35
  ),
];

const ServiceCard = memo(
  ({
    svc,
    delay,
    openLightbox,
  }: {
    svc: Service;
    delay: number;
    openLightbox: (imgs: string[], idx: number) => void;
  }) => {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 40 },
        }}
        transition={{ duration: 0.5, delay }}
        className="mx-auto max-w-sm rounded-2xl backdrop-blur-xl bg-white/60 shadow-lg border border-white/30 hover:shadow-2xl hover:scale-[1.025] transition-transform"
      >
        <div className="relative group rounded-2xl overflow-hidden">
          <Swiper
            effect="fade"
            grabCursor
            navigation={true}
            pagination={false}
            lazyPreloadPrevNext={1}
            modules={[EffectFade, Navigation]}
            className="mySwiper"
          >
            {svc.images.map((src, i) => (
              <SwiperSlide key={src}>
                <div
                  className="relative h-64 w-full select-none cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`Open gallery for ${svc.title}`}
                  onClick={() => openLightbox(svc.images, i)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openLightbox(svc.images, i);
                    }
                  }}
                  draggable={false}
                >
                  <img
                    src={src}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="h-64 w-full object-cover object-center transition-transform group-hover:scale-105 duration-300"
                    alt={svc.title}
                    draggable={false}
                  />
                  {/* Gradient overlay */}
                  <div
                    className="
                      absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
                      opacity-100 md:opacity-0 md:group-hover:opacity-80
                      transition-opacity duration-200 pointer-events-none
                    "
                  ></div>
                  {/* View Gallery Icon */}
                  <div
                    className="
                      absolute inset-x-0 bottom-4 flex justify-center
                      opacity-100 md:opacity-0 md:group-hover:opacity-100
                      transition-opacity duration-200 pointer-events-none
                    "
                  >
                    <span className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md pointer-events-auto">
                      <EyeIcon className="w-5 h-5" />
                      View Gallery
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Category pill */}
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow ${svc.color} bg-opacity-90`}
          >
            {svc.title.split(" ")[0]}
          </div>
        </div>
        <div className="p-5 flex flex-col items-center gap-2">
          <h3 className="text-xl font-bold text-gray-800 mb-1 text-center drop-shadow-sm">
            {svc.title}
          </h3>
          <p className="text-gray-700 text-center text-base min-h-[56px]">
            {svc.description}
          </p>
        </div>
        {/* Navigation arrow visibility: */}
        <style jsx global>{`
          .mySwiper .swiper-button-next,
          .mySwiper .swiper-button-prev {
            opacity: 1;
            pointer-events: auto;
            transition: opacity 0.2s;
          }
          /* Hide nav arrows on desktop unless hovered */
          @media (min-width: 768px) {
            .mySwiper .swiper-button-next,
            .mySwiper .swiper-button-prev {
              opacity: 0;
              pointer-events: none;
            }
            .group:hover .mySwiper .swiper-button-next,
            .group:hover .mySwiper .swiper-button-prev {
              opacity: 1;
              pointer-events: auto;
            }
          }
        `}</style>
      </motion.div>
    );
  }
);


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
        <ServiceCard svc={svc} delay={idx * 0.16} openLightbox={open} />
      ) : null}
    </div>
  );
};

export default function ServicesSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const controls = useAnimation();
  const { open } = useLightbox();
  const services = useMemo(() => SERVICES, []);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <section
      ref={ref}
      className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 py-16 relative"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: -60 },
          }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center text-5xl font-extrabold tracking-tight text-white drop-shadow-md"
        >
          Our Services
        </motion.h2>

        {/* Mobile: vertical list, cards animated in */}
        <div className="flex flex-col space-y-10 md:hidden">
          {services.map((svc, idx) => (
            <LazyCard key={svc.title} svc={svc} idx={idx} open={open} />
          ))}
        </div>

        {/* Desktop/tablet: Swiper carousel */}
        <div className="hidden md:block">
          <Swiper
            spaceBetween={32}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            modules={[Pagination, Navigation]}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1440: { slidesPerView: 4 },
            }}
            style={{ paddingBottom: 32 }}
            className="mySwiper"
          >
            {services.map((svc, idx) => (
              <SwiperSlide key={svc.title}>
                <ServiceCard svc={svc} delay={idx * 0.13} openLightbox={open} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
