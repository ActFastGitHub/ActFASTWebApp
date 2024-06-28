"use client";

import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/app/components/siteNavBar";
import { motion, useAnimation, useInView } from "framer-motion";
import Modal from "@/app/components/modal";

interface TeamMember {
  name: string;
  role: string;
  description: string;
}

const upperManagement: TeamMember[] = [
  {
    name: "Carlo Bernabe",
    role: "Project Manager",
    description: "Visionary leader with over 20 years of experience.",
  },
  {
    name: "Jun Adasa",
    role: "Project Manager",
    description: "Expert in managing large-scale construction projects.",
  },
  {
    name: "Albert Siscar",
    role: "Project Manager",
    description: "Focused on delivering projects on time and within budget.",
  },
  {
    name: "DJ Lopez",
    role: "Construction Manager",
    description: "Oversees all on-site operations ensuring safety and quality.",
  },
  {
    name: "Ervin Ong",
    role: "Project Coordinator",
    description: "Coordinates between teams to ensure smooth project flow.",
  },
  {
    name: "Mac De Guzman",
    role: "Project Coordinator",
    description: "Manages procurement and project schedules effectively.",
  },
  {
    name: "April Adasa",
    role: "Purchasing Officer",
    description: "Handles all purchasing activities with precision.",
  },
  {
    name: "Girlie Atienza",
    role: "Controller",
    description: "Ensures accurate and timely financial operations.",
  },
  {
    name: "Jerry Sumagui",
    role: "Controller Assistant",
    description: "Supports the accounting team with daily financial tasks.",
  },
  {
    name: "Angelo Guerra",
    role: "NR Specialist / IT Support Analyst / Web Developer",
    description: "Versatile professional handling IT and web development needs.",
  },
];

const teamMembers: TeamMember[] = [
  { name: "Ricco", role: "Team Member", description: "" },
  { name: "Fred", role: "Team Member", description: "" },
  { name: "Jes", role: "Team Member", description: "" },
  { name: "Kenneth", role: "Team Member", description: "" },
  { name: "Theo", role: "Team Member", description: "" },
  { name: "Julia", role: "Team Member", description: "" },
  { name: "Beth", role: "Team Member", description: "" },
  { name: "Lyn", role: "Team Member", description: "" },
  { name: "George", role: "Team Member", description: "" },
  { name: "Chriskie", role: "Team Member", description: "" },
  { name: "Keenan", role: "Team Member", description: "" },
  { name: "Jun C", role: "Team Member", description: "" },
  { name: "Julius", role: "Team Member", description: "" },
  { name: "Lisa", role: "Team Member", description: "" },
  { name: "Lito", role: "Team Member", description: "" },
  { name: "Lorraine", role: "Team Member", description: "" },
  { name: "Vivian", role: "Team Member", description: "" },
  { name: "Jomil", role: "Team Member", description: "" },
  { name: "Ben", role: "Team Member", description: "" },
  { name: "Kennedy", role: "Team Member", description: "" },
  { name: "Jhoanasses", role: "Team Member", description: "" },
];

const roleColors: { [key: string]: string } = {
  "General Manager": "bg-blue-500",
  "Project Manager": "bg-cyan-500",
  "Project Coordinator": "bg-yellow-500",
  "Purchasing / Project Manager": "bg-indigo-500",
  "Controller": "bg-pink-500",
  "Purchasing Officer": "bg-purple-500",
  "Construction Manager": "bg-blue-500",
  "Controller Assistant": "bg-teal-500",
  "NR Specialist / IT Support Analyst / Web Developer": "bg-lime-500",
  "Team Member": "bg-orange-500",
};

const useDoubleTapToTop = () => {
  const lastTouch = useRef<number | null>(null);

  useEffect(() => {
    const handleDoubleTap = (event: TouchEvent) => {
      const now = new Date().getTime();
      const timeSinceLastTouch = now - (lastTouch.current || 0);
      if (timeSinceLastTouch < 200 && timeSinceLastTouch > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        event.preventDefault();
      }
      lastTouch.current = now;
    };

    window.addEventListener("touchend", handleDoubleTap);

    return () => {
      window.removeEventListener("touchend", handleDoubleTap);
    };
  }, []);
};

const MeetTheTeamPage: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useDoubleTapToTop();

  const handlePortalClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleMenuToggle = () => setShowMenu(!showMenu);
  const handleCloseMenu = () => setShowMenu(false);

  const animationVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setShowMenu(false);
  };

  const getGridClasses = (length: number) => {
    if (length === 1) return "justify-center";
    if (length === 10) return "justify-center sm:grid-cols-5";
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5";
  };

  const owner = upperManagement.find(
    (member) => member.role === "General Manager",
  );
  const nonOwnerManagement = upperManagement.filter(
    (member) => member.role !== "General Manager",
  );

  const getImagePath = (name: string) => `/images/team/${name.toLowerCase().replace(/ /g, '_')}.jpg`;

  return (
    <div className="bg-gray-900 py-16">
      <Navbar onPortalClick={handlePortalClick} />
      <div className="container mx-auto mt-6 px-6">
        <motion.h1
          className="mb-10 cursor-pointer text-center text-4xl font-extrabold text-white lg:text-6xl"
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          onClick={handleMenuToggle}
        >
          Meet the Team
        </motion.h1>
        {showMenu && (
          <div className="absolute left-0 top-16 z-50 w-full bg-gray-800 py-2 text-white">
            <button
              className="absolute right-4 top-2 text-2xl"
              onClick={handleCloseMenu}
            >
              ×
            </button>
            <ul className="flex flex-col items-center space-y-2">
              <li
                onClick={() => scrollToSection("office-team")}
                className="cursor-pointer"
              >
                Office Team
              </li>
              <li
                onClick={() => scrollToSection("team-members")}
                className="cursor-pointer"
              >
                Team Members
              </li>
            </ul>
          </div>
        )}
        <section id="office-team" className="space-y-12">
          <motion.div
            className="text-center text-3xl font-bold text-white"
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Office Team
          </motion.div>
          {owner && (
            <motion.div
              className={`relative mb-12 rounded-lg p-6 shadow-lg ${roleColors[owner.role]}`}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4 -mt-16 h-32 w-32 overflow-hidden rounded-full bg-gray-200 shadow-2xl lg:-mt-24 lg:h-40 lg:w-40">
                  <img
                    src={getImagePath(owner.name)}
                    alt={owner.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-white lg:text-3xl">
                  {owner.name}
                </h2>
                <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800">
                  {owner.role}
                </div>
                <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md lg:text-base">
                  {owner.description}
                </div>
              </div>
            </motion.div>
          )}
          <div
            className={`flex flex-wrap justify-center gap-12 ${getGridClasses(
              nonOwnerManagement.length,
            )}`}
          >
            {nonOwnerManagement.map((member, index) => {
              const controls = useAnimation();
              const ref = useRef<HTMLDivElement>(null);
              const inView = useInView(ref, { once: true });

              useEffect(() => {
                if (inView) {
                  controls.start("visible");
                }
              }, [controls, inView]);

              return (
                <motion.div
                  key={index}
                  className={`relative rounded-lg p-6 shadow-lg ${roleColors[member.role]}`}
                  initial="hidden"
                  animate={controls}
                  variants={animationVariants}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover="hover"
                  whileTap="tap"
                  ref={ref}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4 -mt-16 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-2xl lg:-mt-20 lg:h-32 lg:w-32">
                      <img
                        src={getImagePath(member.name)}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-semibold text-white lg:text-2xl">
                      {member.name}
                    </h2>
                    <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800">
                      {member.role}
                    </div>
                    <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md lg:text-base">
                      {member.description}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
        <section id="team-members" className="mt-16 space-y-12">
          <motion.div
            className="text-center text-3xl font-bold text-white"
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Team Members
          </motion.div>
          <motion.div
            className={`rounded-lg p-6 shadow-lg ${roleColors["Team Member"]}`}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="mb-4 text-center text-2xl font-bold text-white">
              Team Members
            </h2>
            <div
              className={`grid gap-4 ${getGridClasses(teamMembers.length)}`}
            >
              {teamMembers.map((member, memberIndex) => {
                const controls = useAnimation();
                const ref = useRef<HTMLDivElement>(null);
                const inView = useInView(ref, { once: true });

                useEffect(() => {
                  if (inView) {
                    controls.start("visible");
                  }
                }, [controls, inView]);

                return (
                  <motion.div
                    key={memberIndex}
                    className="flex flex-col items-center text-center"
                    initial="hidden"
                    animate={controls}
                    variants={animationVariants}
                    transition={{ duration: 0.5, delay: memberIndex * 0.1 }}
                    whileHover="hover"
                    whileTap="tap"
                    ref={ref}
                  >
                    <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full bg-gray-200 shadow-xl lg:h-32 lg:w-32">
                      <img
                        src={getImagePath(member.name)}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-lg font-semibold text-white lg:text-xl">
                      {member.name}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      </div>
      {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
    </div>
  );
};

export default MeetTheTeamPage;
