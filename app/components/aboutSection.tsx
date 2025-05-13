"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

import MissionImage from "@/app/images/mission.jpg";
import VisionImage from "@/app/images/vision.jpg";

/* ------------------------------------------------------------------ */
/* 1️⃣  Hardcoded image paths for About carousel                      */
/* ------------------------------------------------------------------ */
const aboutImages = [
  "/images/About/image (1).jpg",
  "/images/About/image (2).jpg",
  "/images/About/image (3).jpg",
  "/images/About/image (4).jpg",
  "/images/About/image (5).jpg",
  "/images/About/image (6).jpg",
  "/images/About/image (7).jpg",
  "/images/About/image (8).jpg",
  "/images/About/image (9).jpg",
  "/images/About/image (10).jpg",
  "/images/About/image (11).jpg",
  "/images/About/image (12).jpg",
];

/* ------------------------------------------------------------------ */
/* 2️⃣  Lightbox overlay logic                                        */
/* ------------------------------------------------------------------ */
function useLightbox(imgs: string[]) {
  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  const next = () => setIdx((i) => (i + 1) % imgs.length);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

  const show = (i: number) => {
    setIdx(i);
    setOpen(true);
  };
  const hide = () => setOpen(false);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    },
    [open]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(delta) > 50) (delta < 0 ? next : prev)();
    startX.current = null;
  };

  const overlay = open && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={hide}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        className="absolute right-4 top-4 z-10 rounded bg-black/60 p-2 text-white backdrop-blur-md"
        onClick={hide}
      >
        ✕
      </button>
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
        src={imgs[idx]}
        alt=""
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  return { show, overlay };
}

/* ------------------------------------------------------------------ */
/* 3️⃣  AboutSection component                                       */
/* ------------------------------------------------------------------ */
export default function AboutSection() {
  const lightbox = useLightbox(aboutImages);

  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <section className="bg-gray-800 py-12" ref={ref}>
      {lightbox.overlay}
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-8 text-center text-5xl font-bold text-white"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: -50 },
          }}
          transition={{ duration: 0.5 }}
        >
          About Us
        </motion.h2>

        <div className="relative mb-12 flex flex-col items-center rounded-lg bg-gray-100 p-6 shadow-2xl lg:flex-row">
          <div className="relative z-0 mb-8 w-full lg:mb-0 lg:w-1/2 lg:pr-8">
            <Swiper
              effect="fade"
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              loop
              navigation={false}
              modules={[EffectFade, Navigation, Autoplay]}
              className="h-64 w-full"
            >
              {aboutImages.map((src, i) => (
                <SwiperSlide key={src}>
                  <motion.img
                    src={src}
                    alt={`About image ${i + 1}`}
                    className="h-64 w-full cursor-pointer rounded object-cover"
                    onClick={() => lightbox.show(i)}
                    onError={(e) => {
                      e.currentTarget.src = "/images/fallback.jpg";
                      e.currentTarget.classList.add("opacity-20");
                    }}
                    initial={{ opacity: 0 }}
                    animate={controls}
                    variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}
                    transition={{ duration: 0.8 }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <motion.div
            className="w-full lg:w-1/2 lg:pl-8"
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, x: 0 },
              hidden: { opacity: 0, x: 50 },
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="mb-4 text-gray-600">
              We are a restoration and repairs company dedicated to providing
              top-notch services. Our experienced team restores your home to its
              former glory—specialising in water, fire, and mold damage plus
              general repairs.
            </p>
            <p className="text-gray-600">
              Customers are never just a claim number. We handle every project
              with empathy, easing the stress of families in peril.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col items-center justify-center lg:flex-row lg:space-x-8">
          {/* Mission Card */}
          <motion.div
            className="flex w-full flex-col items-center lg:w-1/2"
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 50 },
            }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
              <div className="absolute -top-8 mb-4 h-40 w-40">
                <img
                  src={MissionImage.src}
                  alt="Mission"
                  className="h-full w-full rounded-full border-4 border-red-600 object-cover"
                />
              </div>
              <div className="mt-16 text-center">
                <h3 className="mb-2 text-xl font-semibold">Our Mission</h3>
                <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
                  To provide the best experience for our customers in insurance
                  claims and construction-related services, constantly improving
                  for customers, associates, and community.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            className="mt-12 flex w-full flex-col items-center lg:mt-6 lg:w-1/2"
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 50 },
            }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
              <div className="absolute -top-8 mb-4 h-40 w-40">
                <img
                  src={VisionImage.src}
                  alt="Vision"
                  className="h-full w-full rounded-full border-4 border-red-600 object-cover"
                />
              </div>
              <div className="mt-16 text-center">
                <h3 className="mb-2 text-xl font-semibold">Our Vision</h3>
                <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
                  To be the leading restoration company known for innovation,
                  reliability, and excellence—setting new standards for the industry.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
