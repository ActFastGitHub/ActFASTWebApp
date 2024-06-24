"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/siteNavBar";
import FeaturedProject from "@/app/components/featured";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Modal from "@/app/components/modal";

const projects = [
  {
    title: "Agas Fire Restoration",
    description:
      "The Agas project involved a full restoration of a house that was completely burned down. We successfully restored the house and improved it to be brand new.",
    beforeImages: [
      "/images/Projects/Agas/Before/Before (1).jpg",
      "/images/Projects/Agas/Before/Before (2).jpg",
      "/images/Projects/Agas/Before/Before (3).jpg",
      "/images/Projects/Agas/Before/Before (4).jpg",
      "/images/Projects/Agas/Before/Before (5).jpg",
      "/images/Projects/Agas/Before/Before (6).jpg",
    ],
    afterImages: [
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
      "The Agas project involved a full restoration of a house that was completely burned down. We successfully restored the house and improved it to be brand new.",
    beforeImages: [
      "/images/Projects/Agas/Before/Before (1).jpg",
      "/images/Projects/Agas/Before/Before (2).jpg",
      "/images/Projects/Agas/Before/Before (3).jpg",
      "/images/Projects/Agas/Before/Before (4).jpg",
      "/images/Projects/Agas/Before/Before (5).jpg",
      "/images/Projects/Agas/Before/Before (6).jpg",
    ],
    afterImages: [
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
      "The Agas project involved a full restoration of a house that was completely burned down. We successfully restored the house and improved it to be brand new.",
    beforeImages: [
      "/images/Projects/Agas/Before/Before (1).jpg",
      "/images/Projects/Agas/Before/Before (2).jpg",
      "/images/Projects/Agas/Before/Before (3).jpg",
      "/images/Projects/Agas/Before/Before (4).jpg",
      "/images/Projects/Agas/Before/Before (5).jpg",
      "/images/Projects/Agas/Before/Before (6).jpg",
    ],
    afterImages: [
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
      "The Agas project involved a full restoration of a house that was completely burned down. We successfully restored the house and improved it to be brand new.",
    beforeImages: [
      "/images/Projects/Agas/Before/Before (1).jpg",
      "/images/Projects/Agas/Before/Before (2).jpg",
      "/images/Projects/Agas/Before/Before (3).jpg",
      "/images/Projects/Agas/Before/Before (4).jpg",
      "/images/Projects/Agas/Before/Before (5).jpg",
      "/images/Projects/Agas/Before/Before (6).jpg",
    ],
    afterImages: [
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
      "The Agas project involved a full restoration of a house that was completely burned down. We successfully restored the house and improved it to be brand new.",
    beforeImages: [
      "/images/Projects/Agas/Before/Before (1).jpg",
      "/images/Projects/Agas/Before/Before (2).jpg",
      "/images/Projects/Agas/Before/Before (3).jpg",
      "/images/Projects/Agas/Before/Before (4).jpg",
      "/images/Projects/Agas/Before/Before (5).jpg",
      "/images/Projects/Agas/Before/Before (6).jpg",
    ],
    afterImages: [
      "/images/Projects/Agas/After/After (1).jpg",
      "/images/Projects/Agas/After/After (2).jpg",
      "/images/Projects/Agas/After/After (3).jpg",
      "/images/Projects/Agas/After/After (4).jpg",
      "/images/Projects/Agas/After/After (5).jpg",
      "/images/Projects/Agas/After/After (6).jpg",
    ],
  },
  // Add more projects as needed
];

const FeaturedPage: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    controls.start(inView ? "visible" : "hidden");
  }, [controls, inView]);

  const handlePortalClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="bg-gray-900 py-16">
      <Navbar onPortalClick={handlePortalClick} />
      <div className="container mx-auto mt-6 px-6">
        <motion.h1
          className="mb-10 text-center text-4xl font-extrabold text-white lg:text-6xl"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 10 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5 }}
          ref={ref}
        >
          Featured Projects
        </motion.h1>
        <div className={`grid gap-12 ${projects.length === 1 ? "justify-center" : projects.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
          {projects.map((project, index) => (
            <FeaturedProject key={index} {...project} />
          ))}
        </div>
      </div>
      {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
    </div>
  );
};

export default FeaturedPage;
