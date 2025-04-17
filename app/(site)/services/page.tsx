"use client";

import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/app/components/siteNavBar";
import Modal from "@/app/components/modal";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Footer from "@/app/components/footer";

type IntervalId = ReturnType<typeof setInterval>;

/** A simple auto-scrolling carousel with manual nav arrows. */
function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<IntervalId | null>(null);

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAutoScroll = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
  };

  const handlePrev = () => {
    stopAutoScroll();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    startAutoScroll();
  };

  const handleNext = () => {
    stopAutoScroll();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    startAutoScroll();
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute left-0 top-0 h-full w-full transition-opacity duration-700 ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={img}
            alt={`Slide ${idx + 1}`}
            className="h-full w-full object-fill"
          />
        </div>
      ))}

      {/* Manual navigation (arrows) */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        ◀
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        ▶
      </button>
    </div>
  );
}

/**
 * A combined Table of Contents for desktop & mobile:
 * - Desktop: A sticky sidebar on the left (transparent background).
 * - Mobile: A toggleable overlay from a button in the bottom-right corner.
 */
function TableOfContents({
  onSectionSelect,
}: {
  onSectionSelect: (sectionId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    onSectionSelect(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-24 z-20 hidden w-48 px-2 md:block">
        <div className="rounded-md bg-black/40 p-4 backdrop-blur-sm">
          <h2 className="mb-3 font-bold">Services Menu</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => scrollToSection("water-damage")}
                className="hover:underline"
              >
                Water Damage
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("fire-damage")}
                className="hover:underline"
              >
                Fire Damage
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("mold-remediation")}
                className="hover:underline"
              >
                Mold Remediation
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("general-repairs")}
                className="hover:underline"
              >
                General Repairs
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("contents-restoration")}
                className="hover:underline"
              >
                Contents Restoration
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile TOC toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-20 block rounded-md bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm md:hidden"
      >
        {isOpen ? "Close Menu" : "Services Menu"}
      </button>

      {/* Mobile Overlay Menu */}
      {isOpen && (
        <div className="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col bg-black/90 p-6 md:hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 text-2xl text-white"
          >
            ✕
          </button>
          <h2 className="mb-6 mt-12 text-2xl font-bold text-white">
            Services Menu
          </h2>
          <ul className="space-y-4 text-lg">
            <li>
              <button
                onClick={() => scrollToSection("water-damage")}
                className="text-white underline"
              >
                Water Damage
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("fire-damage")}
                className="text-white underline"
              >
                Fire Damage
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("mold-remediation")}
                className="text-white underline"
              >
                Mold Remediation
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("general-repairs")}
                className="text-white underline"
              >
                General Repairs
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("contents-restoration")}
                className="text-white underline"
              >
                Contents Restoration
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

export default function ServicesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // For animating elements when they come into view
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    controls.start(inView ? "visible" : "hidden");
  }, [controls, inView]);

  // Simple fade/slide animation config
  const fadeVariant = (direction: "left" | "right" | "up" | "down" = "up") => {
    let x = 0;
    let y = 0;
    switch (direction) {
      case "left":
        x = -50;
        break;
      case "right":
        x = 50;
        break;
      case "up":
        y = -50;
        break;
      case "down":
        y = 50;
        break;
    }
    return {
      hidden: { opacity: 0, x, y },
      visible: { opacity: 1, x: 0, y: 0 },
    };
  };

  // Different sets of images for each service
  const waterDamageImages = [
    "/images/WaterDamage/image1.jpg",
    "/images/WaterDamage/image2.jpg",
    "/images/WaterDamage/image3.jpg",
    "/images/WaterDamage/image4.jpg",
  ];
  const fireDamageImages = [
    "/images/FireDamage/image1.jpg",
    "/images/FireDamage/image2.jpg",
    "/images/FireDamage/image3.jpg",
    "/images/FireDamage/image4.jpg",
  ];
  const moldImages = [
    "/images/MoldRemediation/image1.jpg",
    "/images/MoldRemediation/image2.jpg",
    "/images/MoldRemediation/image3.jpg",
    "/images/MoldRemediation/image4.jpg",
  ];
  const generalRepairsImages = [
    "/images/GeneralRepairs/image1.jpg",
    "/images/GeneralRepairs/image2.jpg",
    "/images/GeneralRepairs/image3.jpg",
    "/images/GeneralRepairs/image4.jpg",
  ];
  const contentsRestorationImages = [
    "/images/ContentsRestoration/image1.jpg",
    "/images/ContentsRestoration/image2.jpg",
    "/images/ContentsRestoration/image3.jpg",
    "/images/ContentsRestoration/image4.jpg",
  ];

  // Modal controls
  const handlePortalClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Jump to a specific section by ID
  const handleSectionSelect = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-gray-900 text-white">
      {/* Navbar - always visible */}
      <div className="fixed left-0 top-0 z-50 w-full bg-gray-900">
        <Navbar onPortalClick={handlePortalClick} />
      </div>

      {/* TableOfContents */}
      <TableOfContents onSectionSelect={handleSectionSelect} />

      <main className="container mx-auto px-4 pb-16 pt-28 md:pl-52 md:pt-36">
        {/* INTRODUCTION */}
        <section id="intro" ref={ref} className="mb-12">
          <motion.h1
            className="mb-6 text-4xl font-extrabold md:text-5xl"
            initial="hidden"
            animate={controls}
            variants={fadeVariant("up")}
            transition={{ duration: 0.5 }}
          >
            Our Services
          </motion.h1>
          <motion.p
            className="max-w-3xl text-lg leading-relaxed text-gray-200"
            initial="hidden"
            animate={controls}
            variants={fadeVariant("up")}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            At ActFast Restoration &amp; Repairs, we specialize in handling
            insurance claims for water damage, fire damage, mold remediation,
            general repairs, and contents restoration across Metro Vancouver and
            Surrey. Our team responds quickly to emergencies, ensuring your
            property is restored efficiently and professionally.
          </motion.p>
        </section>

        {/* WATER DAMAGE */}
        <section
          id="water-damage"
          className="mb-16 scroll-mt-40 md:scroll-mt-48"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <motion.div
              className="overflow-hidden rounded-lg shadow-xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("left")}
              transition={{ duration: 0.5 }}
            >
              <ImageCarousel images={waterDamageImages} />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("right")}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-2xl font-bold">
                1. Water Damage Restoration 🚰
              </h2>
              <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
                <li>Rapid response to leaks, floods, and pipe bursts.</li>
                <li>Water extraction, drying, and moisture control.</li>
                <li>Works with insurance claims for hassle-free processing.</li>
              </ul>
              <div className="mb-4 ml-4">
                <p className="mb-2 font-semibold">Services Include:</p>
                <ul className="ml-4 list-disc pl-4 text-gray-300">
                  <li>✔ Emergency Water Removal</li>
                  <li>✔ Structural Drying</li>
                  <li>✔ Mold Prevention</li>
                  <li>✔ Sewage Cleanup</li>
                </ul>
              </div>
              <motion.a
                href="tel:+1-604-518-5129"
                className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📞 Call Us Now for 24/7 Water Damage Restoration!
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* FIRE DAMAGE */}
        <section
          id="fire-damage"
          className="mb-16 scroll-mt-40 md:scroll-mt-48"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <motion.div
              className="overflow-hidden rounded-lg shadow-xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("left")}
              transition={{ duration: 0.5 }}
            >
              <ImageCarousel images={fireDamageImages} />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("right")}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-2xl font-bold">
                2. Fire Damage Restoration 🔥
              </h2>
              <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
                <li>Smoke &amp; soot removal for homes and businesses.</li>
                <li>Odor elimination and structural cleaning.</li>
                <li>Insurance claims assistance for fire-related damages.</li>
              </ul>
              <div className="mb-4 ml-4">
                <p className="mb-2 font-semibold">Services Include:</p>
                <ul className="ml-4 list-disc pl-4 text-gray-300">
                  <li>✔ Fire Damage Cleanup</li>
                  <li>✔ Smoke &amp; Soot Removal</li>
                  <li>✔ Odor Neutralization</li>
                  <li>✔ Structural Repairs</li>
                </ul>
              </div>
              <motion.a
                href="tel:+1-604-518-5129"
                className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📞 Get Your Property Restored After Fire Damage Today!
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* MOLD REMEDIATION */}
        <section
          id="mold-remediation"
          className="mb-16 scroll-mt-40 md:scroll-mt-48"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <motion.div
              className="overflow-hidden rounded-lg shadow-xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("left")}
              transition={{ duration: 0.5 }}
            >
              <ImageCarousel images={moldImages} />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("right")}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-2xl font-bold">
                3. Mold Remediation 🦠
              </h2>
              <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
                <li>
                  Safe and certified mold removal to prevent health risks.
                </li>
                <li>Inspection, testing, and full mold treatment.</li>
                <li>Works with homeowners &amp; insurance adjusters.</li>
              </ul>
              <div className="mb-4 ml-4">
                <p className="mb-2 font-semibold">Services Include:</p>
                <ul className="ml-4 list-disc pl-4 text-gray-300">
                  <li>✔ Mold Inspection</li>
                  <li>✔ Containment &amp; Removal</li>
                  <li>✔ Air Purification</li>
                  <li>✔ Moisture Control</li>
                </ul>
              </div>
              <motion.a
                href="tel:+1-604-518-5129"
                className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📞 Protect Your Home from Dangerous Mold - Contact Us!
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* GENERAL REPAIRS */}
        <section
          id="general-repairs"
          className="mb-16 scroll-mt-40 md:scroll-mt-48"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <motion.div
              className="overflow-hidden rounded-lg shadow-xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("left")}
              transition={{ duration: 0.5 }}
            >
              <ImageCarousel images={generalRepairsImages} />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("right")}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-2xl font-bold">
                4. General Repairs &amp; Renovations 🛠
              </h2>
              <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
                <li>
                  Full restoration &amp; repair services after water/fire
                  damage.
                </li>
                <li>Residential &amp; commercial rebuilds and renovations.</li>
                <li>Work with insurance claims and private projects.</li>
              </ul>
              <div className="mb-4 ml-4">
                <p className="mb-2 font-semibold">Services Include:</p>
                <ul className="ml-4 list-disc pl-4 text-gray-300">
                  <li>✔ Drywall &amp; Painting</li>
                  <li>✔ Flooring &amp; Carpentry</li>
                  <li>✔ Electrical &amp; Plumbing Repairs</li>
                  <li>✔ Roofing &amp; Structural Work</li>
                </ul>
              </div>
              <motion.a
                href="tel:+1-604-518-5129"
                className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📞 Need Property Repairs? We’ve Got You Covered!
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* CONTENTS RESTORATION */}
        <section
          id="contents-restoration"
          className="mb-16 scroll-mt-40 md:scroll-mt-48"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <motion.div
              className="overflow-hidden rounded-lg shadow-xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("left")}
              transition={{ duration: 0.5 }}
            >
              <ImageCarousel images={contentsRestorationImages} />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeVariant("right")}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-2xl font-bold">
                5. Contents Restoration &amp; Pack-Out Services 📦
              </h2>
              <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
                <li>
                  Secure storage and management of your belongings during home
                  repairs.
                </li>
                <li>
                  Professional pack-out &amp; pack-back services, ensuring safe
                  handling.
                </li>
                <li>
                  Cleaning &amp; decontamination of contents affected by fire,
                  smoke, mold, or water damage.
                </li>
                <li>
                  Work with insurance companies to ensure smooth claims
                  processing.
                </li>
              </ul>
              <div className="mb-4 ml-4">
                <p className="mb-2 font-semibold">Services Include:</p>
                <ul className="ml-4 list-disc pl-4 text-gray-300">
                  <li>✔ Secure Off-Site Storage</li>
                  <li>✔ Pack-Out &amp; Inventory Management</li>
                  <li>✔ Contents Cleaning &amp; Restoration</li>
                  <li>✔ Pack-Back Services</li>
                </ul>
              </div>
              <motion.a
                href="tel:+1-604-518-5129"
                className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📞 Need Pack-Out or Storage? Call Us Today!
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* FINAL CALL-TO-ACTION */}
        <section id="final-cta">
          <motion.div
            className="rounded bg-red-700 p-6 text-center md:mx-auto md:max-w-4xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeVariant("up")}
            transition={{ duration: 0.5 }}
          >
            <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
              We are ready to assist you 24/7!
            </h3>
            <p className="mb-4 text-white md:text-lg">
              If you need emergency restoration services in Metro Vancouver,
              Surrey, or the Okanagan Area, contact us today!
            </p>
            <p className="text-white md:text-lg">
              📞 Call:{" "}
              <a
                href="tel:+1-604-518-5129"
                className="font-bold underline hover:no-underline"
              >
                [604-518-5129]
              </a>{" "}
              | 📧 Email:{" "}
              <a
                href="mailto:info@actfast.ca"
                className="font-bold underline hover:no-underline"
              >
                [info@actfast.ca]
              </a>
            </p>
          </motion.div>
        </section>
      </main>

      {/* Modal (if needed) */}
      {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
      <Footer />
    </div>
  );
}
