"use client";

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Autoplay } from "swiper/modules";
import {
  EyeIcon,
  MapPinIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/outline";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useLightbox } from "@/app/context/LightboxProvider";
import MissionImage from "@/app/images/mission.jpg";
import VisionImage from "@/app/images/vision.jpg";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

/* ---------------------------------------------
   Config / Data
---------------------------------------------- */
const COMPANY_BIRTHDATE = new Date("2015-12-15T00:00:00Z");

const aboutImages = [
  "/images/About/image (1).jpg",
  "/images/About/image (2).jpg",
  "/images/About/image (3).jpg",
  "/images/About/image (4).jpg",
  "/images/About/image (5).JPG",
  "/images/About/image (6).JPG",
  "/images/About/image (7).JPG",
  "/images/About/image (8).JPG",
  "/images/About/image (9).JPG",
  "/images/About/image (10).jpg",
  "/images/About/image (11).jpg",
  "/images/About/image (12).jpg",
  "/images/About/image (13).jpg",
  "/images/About/image (14).jpg",
  "/images/About/image (15).jpg",
  "/images/About/image (16).jpg",
  "/images/About/image (17).jpg",
  "/images/About/image (18).jpg",
  "/images/About/image (19).jpg",
];

const certifications = [
  { src: "/images/Certifications/bbb-accredited.png", alt: "BBB Accredited" },
  { src: "/images/Certifications/1000claims.png", alt: "1000 Claims Certified" },
];

const LOCATION_URL = "https://maps.app.goo.gl/cEr3uFjKEuKyhNdm9";
const LOCATION_TEXT = "Unit 108 - 11539 136 Street, Surrey, BC";

/* ---------------------------------------------
   Years Counter (medallion)
---------------------------------------------- */
function YearsInBusiness() {
  const [years, setYears] = useState(0);
  const target = useRef(0);

  useEffect(() => {
    const now = new Date();
    let diff = now.getFullYear() - COMPANY_BIRTHDATE.getFullYear();
    const anniv = new Date(
      now.getFullYear(),
      COMPANY_BIRTHDATE.getMonth(),
      COMPANY_BIRTHDATE.getDate()
    );
    if (now < anniv) diff -= 1;
    target.current = diff;

    let frame: number;
    let start: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 900, 1);
      setYears(Math.floor(progress * target.current));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto w-full max-w-xl"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#222b5a] via-[#684bb1] to-[#ffe066] blur-xl opacity-60" />
        <div className="relative flex items-center gap-4 rounded-full border border-white/10 bg-white/10 px-8 py-4 backdrop-blur-md">
          <div className="grid place-items-center rounded-full border-4 border-white/80 bg-gradient-to-br from-[#222b5a] via-[#684bb1] to-[#ffe066] px-8 py-6 shadow-2xl">
            <span className="text-5xl font-black tracking-tight text-white drop-shadow">
              {years}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
              Years
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/90 text-sm">In business since</span>
            <span className="text-white text-2xl font-bold">2015</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------
   Section
---------------------------------------------- */
export default function AboutSection() {
  const { open } = useLightbox();
  const { ref, inView } = useInView({ threshold: 0.18, triggerOnce: true });
  const controls = useAnimation();
  const certImgs = certifications.map((c) => c.src);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0f1428]">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-80 w-80 rounded-full bg-[#684bb1]/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#ffe066]/20 blur-3xl" />
      </div>

      {/* HERO BAND */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-14 pb-10 md:pt-20 md:pb-14">
        <motion.h2
          className="text-center text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm"
          initial={{ opacity: 0, y: -24 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.65 }}
        >
          About Us
        </motion.h2>

        <div className="mt-8 md:mt-12">
          <YearsInBusiness />
        </div>

        <motion.p
          className="mx-auto mt-8 max-w-3xl text-center text-lg leading-relaxed text-white/80"
          initial={{ opacity: 0, y: 16 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, delay: 0.06 }}
        >
          We restore homes and peace of mind—specializing in water, fire, and mold remediation, plus comprehensive repairs. Every claim is a family, not a number.
        </motion.p>

        {/* Large gallery w/ permanent arrows */}
        <motion.div
          className="relative mx-auto mt-10 w-full max-w-6xl"
          initial={{ opacity: 0, y: 16 }}
          animate={controls}
          variants={{ visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, delay: 0.12 }}
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
            <Swiper
              effect="fade"
              autoplay={{ delay: 2600, disableOnInteraction: false }}
              loop
              navigation={{ nextEl: ".about-next", prevEl: ".about-prev" }}
              modules={[EffectFade, Navigation, Autoplay]}
              className="h-72 md:h-[22rem] xl:h-[28rem] w-full rounded-xl"
            >
              {aboutImages.map((src, i) => (
                <SwiperSlide key={src}>
                  <button
                    onClick={() => open(aboutImages, i)}
                    aria-label={`Open gallery image ${i + 1}`}
                    className="group relative h-full w-full overflow-hidden rounded-xl"
                  >
                    <img
                      src={src}
                      alt={`About image ${i + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      draggable={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white shadow">
                      <EyeIcon className="h-4 w-4" />
                      View Gallery
                    </span>
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Always-visible arrows */}
            <button
              className="about-prev absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
              aria-label="Previous"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button
              className="about-next absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
              aria-label="Next"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* CONTENT BAND */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16">
        {/* Mission / Vision — same shape/overlap, GLASS theme */}
        <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-10 mb-14">
          {/* Mission */}
          <motion.div
            className="flex-1 w-full flex justify-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="relative flex flex-col items-center rounded-2xl bg-white/10 mt-4 mb-10 p-6 pt-14 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl min-h-[240px] max-w-[440px] w-full">
              {/* subtle theme glows */}
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#684bb1]/25 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-20 h-56 w-56 rounded-full bg-[#ffe066]/20 blur-2xl" />
              {/* overlapping image (kept) */}
              <div className="absolute -top-10 h-28 w-28 md:h-32 md:w-32">
                <img
                  src={MissionImage.src}
                  alt="Mission"
                  className="h-full w-full rounded-full border-4 border-white/80 object-cover shadow-xl"
                />
              </div>
              <div className="mt-10 text-center">
                <h3 className="mb-1 text-2xl font-bold text-white">Our Mission</h3>
                <p className="text-white/85 px-2 sm:px-4">
                  Provide the best experience for customers in insurance claims and construction—constantly improving for customers, associates, and the community.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="flex-1 w-full flex justify-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.06 }}
          >
            <div className="relative flex flex-col items-center rounded-2xl bg-white/10 p-6 pt-14 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl min-h-[240px] max-w-[440px] w-full">
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#222b5a]/30 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-20 h-56 w-56 rounded-full bg-[#684bb1]/25 blur-2xl" />
              <div className="absolute -top-10 h-28 w-28 md:h-32 md:w-32">
                <img
                  src={VisionImage.src}
                  alt="Vision"
                  className="h-full w-full rounded-full border-4 border-white/80 object-cover shadow-xl"
                />
              </div>
              <div className="mt-10 text-center">
                <h3 className="mb-1 text-2xl font-bold text-white">Our Vision</h3>
                <p className="text-white/85 px-2 sm:px-4">
                  Be the leading restoration company—known for innovation, reliability, and excellence—setting new industry standards.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Certifications — big cards, star fixed on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.04 }}
          className="mb-16 relative"
        >
          <h3 className="text-center text-2xl md:text-3xl font-semibold text-white mb-7 tracking-wide drop-shadow-lg">
            <span className="relative inline-flex items-center justify-center">
              <span>Our Certifications &amp; Accreditations</span>
              {/* Mobile: inline star; md+: float to corner */}
              <span className="relative ml-2 inline-block text-yellow-200 text-2xl md:text-3xl md:ml-0 md:absolute md:-top-2 md:-right-6 animate-pulse select-none">
                ✨
              </span>
            </span>
          </h3>

          <div className="flex flex-wrap justify-center gap-10">
            {certifications.map((cert, idx) => (
              <motion.button
                key={cert.src}
                className={`bg-white rounded-2xl shadow-2xl p-7
                  flex flex-col items-center justify-center
                  min-h-[170px] min-w-[230px]
                  max-h-[260px] max-w-[420px]
                  transition-transform hover:scale-105 border border-white/30 relative
                  cursor-pointer group outline-none focus:ring-4 focus:ring-cyan-400`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                aria-label={`View enlarged ${cert.alt}`}
                onClick={() => open(certImgs, idx)}
              >
                <img
                  src={cert.src}
                  alt={cert.alt}
                  className={`object-contain
                    max-h-[150px] md:max-h-[200px] max-w-[340px] w-auto h-auto
                    drop-shadow-xl transition-all duration-300 group-hover:scale-[1.03]`}
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity bg-cyan-300" />
                <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <span className="flex items-center gap-2 bg-black/70 px-4 py-1 rounded-full text-white text-base font-semibold shadow-lg select-none">
                    <EyeIcon className="w-6 h-6" />
                    View Larger
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CONTACT / MAP BAND */}
      <div className="relative z-10 border-t border-white/10 bg-[#0b0f21]">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h3 className="text-center text-2xl md:text-3xl font-semibold text-white mb-6">
            Find Us
          </h3>
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
            <div className="md:col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
              <iframe
                title="ActFast Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2606.3557414453408!2d-122.84838482401653!3d49.212780175702356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5485d78646b81a55%3A0x66d23eb8e8b7465e!2sActFAST%20Restoration%20and%20Repairs!5e0!3m2!1sen!2sca!4v1753476348622!5m2!1sen!2sca"
                width="100%"
                height="310"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur hover:bg-white/15"
              >
                <MapPinIcon className="h-6 w-6 text-red-500" />
                <span className="flex-1">
                  <span className="block text-sm text-white/80">Address</span>
                  <span className="block font-semibold">{LOCATION_TEXT}</span>
                </span>
                <ArrowLongRightIcon className="h-5 w-5 opacity-80 transition group-hover:translate-x-1" />
              </a>

              <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-white/90 backdrop-blur">
                <p className="text-sm text-white/80">Hours</p>
                <p className="font-medium">By appointment or during regular business hours</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/10 p-3 text-white/90 backdrop-blur">
                  <p className="text-xs text-white/70">Phone</p>
                  <p className="font-semibold">(604)-518-5129</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-3 text-white/90 backdrop-blur">
                  <p className="text-xs text-white/70">Email</p>
                  <p className="font-semibold">info@actfast.ca</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer micro‑brand */}
          <div className="mt-8 flex flex-col items-center justify-between gap-2 text-xs text-white/60 md:flex-row">
            <span>Unit 108 - 11539 136 Street, Surrey, BC</span>
            <span>www.actfast.ca</span>
          </div>
        </div>
      </div>
    </section>
  );
}
