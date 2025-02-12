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

interface TeamSection {
  role: string;
  members: { name: string; description: string }[];
  description: string;
}

// ----------------------------
// 1) UPPER MANAGEMENT
// ----------------------------
const upperManagement: TeamMember[] = [
  {
    name: "Carlo Bernabe",
    role: "Project Manager",
    description:
      "Seasoned professional with over 20 years of experience, overseeing key aspects of restoration and repair projects.",
  },
  {
    name: "Jun Adasa",
    role: "Project Manager",
    description:
      "Leads multiple projects with a focus on strategic coordination, ensuring budgets, schedules, and client expectations are met.",
  },
  {
    name: "Albert Siscar",
    role: "Project Manager",
    description:
      "Senior manager who drives project timelines, fosters strong client relationships, and guarantees high-quality outcomes.",
  },
  {
    name: "DJ Lopez",
    role: "Construction Manager",
    description:
      "Directs all final repair operations, managing budgets and collaborating with subcontractors to meet project scopes.",
  },
  {
    name: "Ervin Ong",
    role: "Project Coordinator",
    description:
      "Facilitates communication between teams, assisting in scheduling, client interaction, and on-site coordination.",
  },
  {
    name: "Mac De Guzman",
    role: "Project Coordinator",
    description:
      "Focuses on large-scale projects, managing employee schedules and ensuring timely progress on key deliverables.",
  },
  {
    name: "April Adasa",
    role: "Purchasing Officer",
    description:
      "Oversees procurement and supply management, supporting both final repairs and contents operations.",
  },
  {
    name: "Girlie Atienza",
    role: "Controller",
    description:
      "Manages financial tasks including bookkeeping, payroll, and time sheet administration.",
  },
  {
    name: "Angelo Guerra",
    role: "Technical Support Analyst",
    description:
      "Provides IT solutions, web development, and process optimization to streamline company operations.",
  },
];

// ----------------------------
// 2) TEAM SECTIONS (DEPARTMENTS)
// ----------------------------
const teamSections: TeamSection[] = [
  {
    role: "Contents Team",
    members: [
      {
        name: "Julia",
        description:
          "Lead member ensuring smooth coordination of sorting, packing, labeling, and record-keeping.",
      },
      {
        name: "Beth",
        description:
          "Senior member focused on efficient team collaboration and thorough preparation for transport.",
      },
      {
        name: "Lisa",
        description:
          "Lead member ensuring all items are accurately tracked, labeled, and ready for packout and packback.",
      },
      {
        name: "Lorena",
        description:
          "Contributes to every stage of content handling, maintaining accurate records of item locations.",
      },
      {
        name: "Vivian",
        description:
          "Supports all aspects of sorting, labeling, and cleanup to keep operations running smoothly.",
      },
    ],
    description:
      "The Contents Team collaboratively manages sorting, packing, proper labeling, and recording of items. They also handle initial cleanup and ensure everything is accounted for before and after transport.",
  },
  {
    role: "Emergency Team",
    members: [
      {
        name: "Ricco",
        description:
          "Most tenured responder specializing in plumbing, ready for any urgent restoration needs.",
      },
      {
        name: "Theo",
        description:
          "Expert in demolition and asbestos abatement, ensuring quick, safe resolutions.",
      },
      {
        name: "Chriskie",
        description:
          "Skilled in demolition and asbestos abatement, delivering prompt support for water, fire, smoke, and mold incidents.",
      },
      {
        name: "Julius",
        description:
          "Newest team member capable of handling a broad range of emergency tasks.",
      },
    ],
    description:
      "The Emergency Team is the frontline crew for urgent restoration situations—whether water, fire, smoke, or mold. They respond swiftly, bring specialized equipment, and stabilize conditions alongside Project Managers on-site.",
  },
  {
    role: "Logistics Team",
    members: [
      {
        name: "George",
        description:
          "Coordinates packouts and packbacks with precision, ensuring items move safely from client sites to storage.",
      },
      {
        name: "Lito",
        description:
          "Oversees pickups, deliveries, and organizes stored items in designated pods for clients.",
      },
    ],
    description:
      "The Logistics Team manages transportation and delivery, from retrieving packed items at client sites to placing them in secure warehouse pods, as well as delivering ordered materials to project locations.",
  },
  {
    role: "Final Repairs Team",
    members: [
      {
        name: "Fred",
        description:
          "Specialist in final repairs, touch-ups, and warranty work to ensure top-quality results.",
      },
      {
        name: "Christopher",
        description:
          "Newest member of the final repairs team with strong expertise in HVAC systems.",
      },
    ],
    description:
      "The Final Repairs Team handles the end-stage fixes, from essential touch-ups to warranty repairs. They step in for in-house repairs if subcontractors aren’t utilized.",
  },
  {
    role: "Automotive",
    members: [
      {
        name: "Jun C",
        description:
          "Handles all vehicle maintenance and repairs, providing support to other departments as needed.",
      },
    ],
    description:
      "Our Automotive Specialist ensures company vehicles are in prime condition and assists other teams whenever necessary.",
  },
];

// ----------------------------
// 3) ROLE COLORS
// ----------------------------
const roleColors: { [key: string]: string } = {
  "General Manager": "bg-blue-500",
  "Project Manager": "bg-cyan-500",
  "Project Coordinator": "bg-yellow-500",
  "Purchasing / Project Manager": "bg-indigo-500",
  Controller: "bg-pink-500",
  "Purchasing Officer": "bg-purple-500",
  "Construction Manager": "bg-blue-500",
  "Controller Assistant": "bg-teal-500",
  "Technical Support Analyst": "bg-lime-500",

  // Department roles
  "Contents Team": "bg-orange-500",
  "Emergency Team": "bg-blue-600",
  "Logistics Team": "bg-green-700",
  "Final Repairs Team": "bg-yellow-700",
  "Automotive": "bg-indigo-700",
};

// ----------------------------
// 4) useDoubleTapToTop()
// ----------------------------
const useDoubleTapToTop = () => {
  const lastTouch = useRef<number | null>(null);

  useEffect(() => {
    const handleDoubleTap = (event: TouchEvent) => {
      const now = new Date().getTime();
      const timeSinceLastTouch = now - (lastTouch.current || 0);
      if (timeSinceLastTouch < 500 && timeSinceLastTouch > 0) {
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

// ----------------------------
// 5) MAIN COMPONENT
// ----------------------------
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
    visible: { opacity: 1, y: 0 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  const getGridClasses = (length: number) => {
    if (length === 1) return "justify-center";
    if (length === 10) return "justify-center sm:grid-cols-5";
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setShowMenu(false);
  };

  const owner = upperManagement.find(
    (member) => member.role === "General Manager"
  );
  const nonOwnerManagement = upperManagement.filter(
    (member) => member.role !== "General Manager"
  );

  const getImagePath = (name: string) =>
    `/images/team/${name.toLowerCase().replace(/ /g, "_")}.jpg`;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
      <Navbar onPortalClick={handlePortalClick} />
      <div className="container mx-auto mt-6 px-6">
        {/* ----------------- Page Title ----------------- */}
        <motion.h1
          className="mb-10 cursor-pointer text-center text-4xl font-extrabold text-white lg:text-6xl hover:text-gray-200 transition-colors"
          initial="hidden"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleMenuToggle}
        >
          Meet the Team
        </motion.h1>

        {/* ----------------- Slide-in Menu ----------------- */}
        {showMenu && (
          <div className="absolute left-0 top-16 z-50 w-full bg-gray-800 py-2 text-white shadow-xl">
            <button
              className="absolute right-4 top-2 text-2xl"
              onClick={handleCloseMenu}
            >
              ×
            </button>
            <ul className="flex flex-col items-center space-y-2">
              <li
                onClick={() => scrollToSection("office-team")}
                className="cursor-pointer hover:text-cyan-300 transition-colors"
              >
                Office Team
              </li>
              {teamSections.map((section, index) => (
                <li
                  key={index}
                  onClick={() => scrollToSection(section.role)}
                  className="cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  {section.role}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ----------------- OFFICE TEAM SECTION ----------------- */}
        <section id="office-team" className="space-y-12">
          <motion.div
            className="text-center text-3xl font-bold text-white"
            initial="hidden"
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Office Team
          </motion.div>

          {/* Owner / General Manager */}
          {owner && (
            <motion.div
              className={`relative mb-12 rounded-2xl p-6 shadow-xl transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                roleColors[owner.role]
              }`}
              initial="hidden"
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4 -mt-16 h-32 w-32 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white shadow-2xl lg:-mt-24 lg:h-40 lg:w-40">
                  <img
                    src={getImagePath(owner.name)}
                    alt={owner.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-white lg:text-3xl">
                  {owner.name}
                </h2>
                <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
                  {owner.role}
                </div>
                <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md lg:text-base">
                  {owner.description}
                </div>
              </div>
            </motion.div>
          )}

          {/* Non-owner management */}
          <div
            className={`flex flex-wrap justify-center gap-12 ${getGridClasses(
              nonOwnerManagement.length
            )}`}
          >
            {nonOwnerManagement.map((member, index) => {
              const controls = useAnimation();
              const ref = useRef<HTMLDivElement>(null);
              const inView = useInView(ref);

              useEffect(() => {
                if (inView) {
                  controls.start("visible");
                }
              }, [controls, inView]);

              return (
                <motion.div
                  key={index}
                  className={`relative rounded-2xl p-6 shadow-xl transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                    roleColors[member.role]
                  }`}
                  initial="hidden"
                  animate={controls}
                  variants={animationVariants}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover="hover"
                  whileTap="tap"
                  ref={ref}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4 -mt-16 h-24 w-24 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white shadow-2xl lg:-mt-20 lg:h-32 lg:w-32">
                      <img
                        src={getImagePath(member.name)}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-semibold text-white lg:text-2xl">
                      {member.name}
                    </h2>
                    <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
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
        {/* ----------------- END OFFICE TEAM SECTION ----------------- */}

        {/* ----------------- DEPARTMENT SECTIONS ----------------- */}
        {teamSections.map((teamSection, sectionIndex) => (
          <section
            id={teamSection.role}
            key={sectionIndex}
            className="mt-16 space-y-12"
          >
            {/* Large heading for the team */}
            <motion.div
              className="text-center text-3xl font-bold text-white"
              initial="hidden"
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {teamSection.role}
            </motion.div>
            <motion.div
              className={`rounded-2xl p-6 shadow-xl transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                roleColors[teamSection.role] || "bg-orange-500"
              }`}
              initial="hidden"
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.2 }}
            >
              {/* 
                  Removed the repeated heading here to avoid redundancy. 
                  Previously had: 
                  <h2 className="mb-4 text-center text-2xl font-bold text-white">
                    {teamSection.role}
                  </h2>
              */}
              <p className="mb-4 text-center text-sm text-white">
                {teamSection.description}
              </p>
              <div
                className={`grid gap-4 ${getGridClasses(
                  teamSection.members.length
                )}`}
              >
                {teamSection.members.map((member, memberIndex) => {
                  const controls = useAnimation();
                  const ref = useRef<HTMLDivElement>(null);
                  const inView = useInView(ref);

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
                      transition={{ duration: 0.5, delay: memberIndex * 0.2 }}
                      whileHover="hover"
                      ref={ref}
                    >
                      <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white shadow-xl">
                        <img
                          src={getImagePath(member.name)}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {member.name}
                      </p>
                      <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md">
                        {member.description}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        ))}
      </div>

      {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
    </div>
  );
};

export default MeetTheTeamPage;
