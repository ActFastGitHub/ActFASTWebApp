"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/components/siteNavBar";
import FeaturedProject from "@/app/components/featured";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

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
      // Add more before images as needed
    ],
    afterImages: [
      "/images/Projects/Agas/After/After (1).jpg",
      "/images/Projects/Agas/After/After (2).jpg",
      "/images/Projects/Agas/After/After (3).jpg",
      "/images/Projects/Agas/After/After (4).jpg",
      "/images/Projects/Agas/After/After (5).jpg",
      "/images/Projects/Agas/After/After (6).jpg",
      // Add more after images as needed
    ],
  },
  // Add more projects as needed
];

const FeaturedPage: React.FC = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const handlePortalClick = () => {
    // Define the logic for the Employee Portal click here
  };

  return (
    <div className="bg-gray-800 py-12">
      <Navbar onPortalClick={handlePortalClick} />
      <div className="container mx-auto px-4 pt-16">
        <motion.h1
          className="mb-12 text-center text-5xl font-bold text-white"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5 }}
          ref={ref}
        >
          Featured Projects
        </motion.h1>
        {projects.map((project, index) => (
          <FeaturedProject
            key={index}
            title={project.title}
            description={project.description}
            beforeImages={project.beforeImages}
            afterImages={project.afterImages}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedPage;
