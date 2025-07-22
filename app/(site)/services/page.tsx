/* ------------------------------------------------------------------
   ServicesPage.tsx – all services + local LightboxProvider wrapper
   ------------------------------------------------------------------ */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/app/components/siteNavBar";
import Modal from "@/app/components/modal";

import {
  LightboxProvider,
  useLightbox,
} from "@/app/context/LightboxProvider";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import phoneIcon from "@/app/images/phone-icon.svg";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ---------- helper to build image arrays ------------------------- */
const gen = (folder: string, prefix: string, count: number) =>
  Array.from(
    { length: count },
    (_, i) => `/images/${folder}/${prefix} (${i + 1}).jpg`
  );

/* ---------- static galleries ------------------------------------- */
const water = gen("WaterDamage", "Water", 45);
const fire = gen("FireDamage", "Fire", 52);
const mold = gen("MoldRemediation", "Mold", 31);
const asbestos = gen("AsbestosAbatement", "Asbestos", 9);
const repairs = gen("GeneralRepairs", "Repairs", 14);
const contents = gen("ContentsRestoration", "Contents", 35);

/* ------------------------------------------------------------------
   ⭐ Swiper‑based auto‑scroll carousel
   ------------------------------------------------------------------ */
function ImageCarousel({
  images,
  onImageClick,
}: {
  images: string[];
  onImageClick?: (idx: number) => void;
}) {
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      spaceBetween={10}
      slidesPerView={1}
      loop
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      className="w-full rounded-lg shadow-xl"
    >
      {images.map((src, idx) => (
        <SwiperSlide key={src}>
          <img
            src={src}
            alt=""
            onClick={() => onImageClick?.(idx)}
            className="h-60 w-full cursor-pointer object-cover object-center md:h-96"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

/* ------------------------------------------------------------------
   📑 Services menu (desktop sidebar + mobile drawer)
   ------------------------------------------------------------------ */
function TableOfContents({ onJump }: { onJump: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const items: [string, string][] = [
    ["water-damage", "Water Damage"],
    ["fire-damage", "Fire Damage"],
    ["mold-remediation", "Mold Remediation"],
    ["asbestos-abatement", "Asbestos Abatement"],
    ["general-repairs", "General Repairs"],
    ["contents-restoration", "Contents Restoration"],
  ];

  return (
    <>
      {/* desktop sidebar */}
      <div className="fixed left-0 top-24 z-20 hidden w-48 px-2 md:block">
        <div className="rounded-md bg-black/40 p-4 backdrop-blur-sm">
          <h2 className="mb-3 font-bold">Services Menu</h2>
          <ul className="space-y-2 text-sm">
            {items.map(([id, label]) => (
              <li key={id}>
                <button
                  onClick={() => onJump(id)}
                  className="hover:underline"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-20 block rounded-md bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm md:hidden"
      >
        {open ? "Close Menu" : "Services Menu"}
      </button>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-6 md:hidden">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-2xl text-white"
          >
            ✕
          </button>
          <h2 className="mb-6 mt-12 text-2xl font-bold text-white">
            Services Menu
          </h2>
          <ul className="space-y-4 text-lg">
            {items.map(([id, label]) => (
              <li key={id}>
                <button
                  onClick={() => {
                    onJump(id);
                    setOpen(false);
                  }}
                  className="text-white underline"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------
   🚀 Inner page component
   ------------------------------------------------------------------ */
function ServicesPageInner() {
  const { open } = useLightbox(); // <-- FIXED: Destructure open!
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const controls = useAnimation();

  useEffect(() => {
    controls.start(inView ? "visible" : "hidden");
  }, [inView, controls]);

  const jump = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const fade = (dir: "left" | "right" | "up" | "down" = "up") => {
    const d = {
      left: [-50, 0],
      right: [50, 0],
      up: [0, -50],
      down: [0, 50],
    }[dir] as [number, number];
    return {
      hidden: { opacity: 0, x: d[0], y: d[1] },
      visible: { opacity: 1, x: 0, y: 0 },
    };
  };

  return (
    <div className="relative">
      <div
        className={`touch-pan-y overflow-x-hidden bg-gray-900 text-white ${
          showModal ? "filter blur-3xl overflow-hidden" : ""
        }`}
      >
        {/* sticky nav */}
        <div className="fixed left-0 top-0 z-50 w-full bg-gray-900">
          <Navbar onPortalClick={() => setShowModal(true)} />
        </div>

        {/* sidebar / drawer */}
        <TableOfContents onJump={jump} />

        {/* main content */}
        <main className="container mx-auto px-4 pb-16 pt-28 md:pl-52 md:pt-36">
          {/* intro */}
          <section id="intro" ref={ref} className="mb-12">
            <motion.h1
              className="mb-6 text-4xl font-extrabold md:text-5xl"
              variants={fade("up")}
              initial="hidden"
              animate={controls}
              transition={{ duration: 0.5 }}
            >
              Our Services
            </motion.h1>
            <motion.p
              className="max-w-3xl text-lg leading-relaxed text-gray-200"
              variants={fade("up")}
              initial="hidden"
              animate={controls}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              At ActFast Restoration & Repairs we handle insurance claims for
              water, fire, mold, asbestos, repairs, and contents restoration
              across Metro Vancouver and Surrey. We respond fast and restore
              your property efficiently.
            </motion.p>
          </section>

          {/* service sections */}
          <ServiceBlock
            id="water-damage"
            num={1}
            title="Water Damage Restoration 🚰"
            bullets={[
              "Rapid response to leaks, floods, and pipe bursts.",
              "Water extraction, drying, and moisture control.",
              "Works with insurance claims for hassle‑free processing.",
            ]}
            services={[
              "Emergency Water Removal",
              "Structural Drying",
              "Mold Prevention",
              "Sewage Cleanup",
            ]}
            images={water}
            cta="Call Us Now for 24/7 Water Damage Restoration!"
            open={open} // <-- Pass open directly!
          />

          <ServiceBlock
            id="fire-damage"
            num={2}
            title="Fire Damage Restoration 🔥"
            bullets={[
              "Smoke & soot removal for homes and businesses.",
              "Odor elimination and structural cleaning.",
              "Insurance claims assistance for fire‑related damages.",
            ]}
            services={[
              "Fire Damage Cleanup",
              "Smoke & Soot Removal",
              "Odor Neutralization",
              "Structural Repairs",
            ]}
            images={fire}
            cta="Get Your Property Restored After Fire Damage Today!"
            open={open}
          />

          <ServiceBlock
            id="mold-remediation"
            num={3}
            title="Mold Remediation 🦠"
            bullets={[
              "Safe and certified mold removal to prevent health risks.",
              "Inspection, testing, and full mold treatment.",
              "Works with homeowners & insurance adjusters.",
            ]}
            services={[
              "Mold Inspection",
              "Containment & Removal",
              "Air Purification",
              "Moisture Control",
            ]}
            images={mold}
            cta="Protect Your Home from Dangerous Mold – Contact Us!"
            open={open}
          />

          <ServiceBlock
            id="asbestos-abatement"
            num={4}
            title="Asbestos Abatement ⚠️"
            bullets={[
              "Licensed testing and removal of asbestos‑containing materials.",
              "Containment, safe disposal, and air‑quality clearance reports.",
              "Meets all WorkSafeBC and federal regulations.",
            ]}
            services={[
              "Asbestos Inspection & Sampling",
              "Hazard Containment",
              "Certified Removal & Disposal",
              "Air Monitoring / Clearance",
            ]}
            images={asbestos}
            cta="Need Safe Asbestos Removal? Call Our Certified Team!"
            open={open}
          />

          <ServiceBlock
            id="general-repairs"
            num={5}
            title="General Repairs & Renovations 🛠"
            bullets={[
              "Full restoration & repair services after water/fire damage.",
              "Residential & commercial rebuilds and renovations.",
              "Work with insurance claims and private projects.",
            ]}
            services={[
              "Drywall & Painting",
              "Flooring & Carpentry",
              "Electrical & Plumbing Repairs",
              "Roofing & Structural Work",
            ]}
            images={repairs}
            cta="Need Property Repairs? We’ve Got You Covered!"
            open={open}
          />

          <ServiceBlock
            id="contents-restoration"
            num={6}
            title="Contents Restoration & Pack‑Out Services 📦"
            bullets={[
              "Secure storage and management of your belongings during repairs.",
              "Professional pack‑out & pack‑back services, ensuring safe handling.",
              "Cleaning & decontamination of items affected by fire, smoke, mold, or water.",
              "We coordinate directly with insurers for smooth claims.",
            ]}
            services={[
              "Secure Off‑Site Storage",
              "Pack‑Out & Inventory Management",
              "Contents Cleaning & Restoration",
              "Pack‑Back Services",
            ]}
            images={contents}
            cta="Need Pack‑Out or Storage? Call Us Today!"
            open={open}
          />

          {/* final CTA */}
          <section id="final-cta">
            <motion.div
              className="rounded bg-red-700 p-6 text-center md:mx-auto md:max-w-4xl"
              whileInView="visible"
              initial="hidden"
              viewport={{ once: true }}
              variants={fade("up")}
              transition={{ duration: 0.5 }}
            >
              <h3 className="mb-2 text-2xl font-bold md:text-3xl">
                We are ready to assist you 24/7!
              </h3>
              <p className="mb-4 md:text-lg">
                If you need emergency restoration services in Metro Vancouver,
                Surrey, or the Okanagan Area, contact us today!
              </p>
              <p className="md:text-lg">
                📞{" "}
                <a
                  href="tel:+1-604-518-5129"
                  className="font-bold underline hover:no-underline"
                >
                  604‑518‑5129
                </a>{" "}
                | 📧{" "}
                <a
                  href="mailto:info@actfast.ca"
                  className="font-bold underline hover:no-underline"
                >
                  info@actfast.ca
                </a>
              </p>
            </motion.div>
          </section>
        </main>
      </div>

      {/* global Modal (for “Portal” calls in Navbar) */}
      <Modal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------
   🔄 ServiceBlock (re‑usable section)
   ------------------------------------------------------------------ */
function ServiceBlock({
  id,
  num,
  title,
  bullets,
  services,
  images,
  cta,
  open,
}: {
  id: string;
  num: number;
  title: string;
  bullets: string[];
  services: string[];
  images: string[];
  cta: string;
  open: (imgs: string[], idx: number) => void;
}) {
  const fade = (dir: "left" | "right") => ({
    hidden: { opacity: 0, x: dir === "left" ? -50 : 50 },
    visible: { opacity: 1, x: 0 },
  });

  return (
    <section id={id} className="mb-16 scroll-mt-40 md:scroll-mt-48">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <motion.div
          className="overflow-hidden rounded-lg shadow-xl"
          variants={fade("left")}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ImageCarousel
            images={images}
            onImageClick={(i) => open(images, i)}
          />
        </motion.div>

        <motion.div
          variants={fade("right")}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-2xl font-bold">
            {num}. {title}
          </h2>

          <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <div className="mb-4 ml-4">
            <p className="mb-2 font-semibold">Services Include:</p>
            <ul className="ml-4 list-disc pl-4 text-gray-300">
              {services.map((s) => (
                <li key={s}>✔ {s}</li>
              ))}
            </ul>
          </div>

          <motion.a
            href="tel:+1-604-518-5129"
            className="inline-flex items-center gap-2 rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image src={phoneIcon} alt="Call" width={20} height={20} priority />
            {cta}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   📦 default export – wrapped with provider
   ------------------------------------------------------------------ */
export default function ServicesPage() {
  return (
    <LightboxProvider>
      <ServicesPageInner />
    </LightboxProvider>
  );
}
