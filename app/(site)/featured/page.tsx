"use client";

import React from "react";
import Navbar from "@/app/components/siteNavBar";
import FeaturedProject from "@/app/components/featured";
import { motion } from "framer-motion";

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
  const handlePortalClick = () => {
    // Define the logic for the Employee Portal click here
  };

  return (
    <motion.div
      className="bg-gray-800 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar onPortalClick={handlePortalClick} />
      <motion.div
        className="container mx-auto px-4 pt-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="mb-12 text-center text-5xl font-bold text-white">
          Featured Projects
        </h1>
        {projects.map((project, index) => (
          <FeaturedProject
            key={index}
            title={project.title}
            description={project.description}
            beforeImages={project.beforeImages}
            afterImages={project.afterImages}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default FeaturedPage;
