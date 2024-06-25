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

const upperManagement: TeamMember[] = [
  { name: "Carlo Bernabe", role: "Owner", description: "Visionary leader with over 20 years of experience." },
  { name: "Jun Adasa", role: "Project Manager", description: "Expert in managing large-scale construction projects." },
  { name: "Albert Siscar", role: "Project Manager", description: "Focused on delivering projects on time and within budget." },
  { name: "DJ", role: "Construction Manager", description: "Oversees all on-site operations ensuring safety and quality." },
  { name: "Ervin Ong", role: "Project Coordinator", description: "Coordinates between teams to ensure smooth project flow." },
  { name: "Mac De Guzman", role: "Purchasing / Project Manager", description: "Manages procurement and project schedules effectively." },
  { name: "April Adasa", role: "Purchasing Officer", description: "Handles all purchasing activities with precision." },
  { name: "Girlie Atienza", role: "Accounting / Payroll Manager", description: "Ensures accurate and timely financial operations." },
  { name: "Jerry", role: "Accounting Assistant", description: "Supports the accounting team with daily financial tasks." },
  { name: "Angelo", role: "NR Specialist / IT Support Analyst / Web Developer", description: "Versatile professional handling IT and web development needs." },
];

const teamMembers: TeamSection[] = [
  {
    role: "Contents Team",
    members: [
      { name: "Lyn", description: "Skilled in content creation and management." },
      { name: "Beth", description: "Expert in crafting engaging and informative content." },
      { name: "Julia", description: "Specializes in multimedia content production." },
      { name: "Lisa", description: "Focuses on content strategy and implementation." },
      { name: "Lorena", description: "Ensures content quality and consistency." }
    ],
    description: "The Contents Team is responsible for creating and managing all content."
  },
  {
    role: "Mustang",
    members: [
      { name: "Vivian", description: "Dedicated team member ensuring excellence in all tasks." }
    ],
    description: "Mustang team handles special projects with high priority."
  },
  {
    role: "Emergency Team",
    members: [
      { name: "CK", description: "Quick to respond to any emergencies." },
      { name: "Theo", description: "Expert in handling critical situations." },
      { name: "Ricco", description: "Ensures safety and prompt response." },
      { name: "Julius", description: "Reliable and efficient in emergency responses." }
    ],
    description: "The Emergency Team is always ready to handle urgent situations."
  },
  {
    role: "Logistics Team",
    members: [
      { name: "George", description: "Coordinates logistics with precision." },
      { name: "Keenan", description: "Ensures smooth transportation and delivery." },
      { name: "Lito", description: "Manages logistics operations effectively." },
      { name: "Jhon", description: "Supports the team with logistics planning." }
    ],
    description: "The Logistics Team handles all transportation and delivery needs."
  },
  {
    role: "Final Repairs Team",
    members: [
      { name: "Fred", description: "Expert in final touch-ups and repairs." },
      { name: "Jes", description: "Ensures high-quality final repairs." },
      { name: "Jomel", description: "Specializes in detailed repair work." },
      { name: "Kenneth", description: "Focused on delivering flawless final repairs." }
    ],
    description: "The Final Repairs Team ensures that everything is perfect before project completion."
  },
  {
    role: "Automotive Specialist",
    members: [
      { name: "JunC", description: "Expert in automotive repair and maintenance." }
    ],
    description: "Our Automotive Specialist takes care of all vehicle-related issues."
  }
];

const roleColors: { [key: string]: string } = {
  "Owner": "bg-blue-500",
  "Project Manager": "bg-green-500",
  "Project Coordinator": "bg-yellow-500",
  "Purchasing / Project Manager": "bg-indigo-500",
  "Accounting / Payroll Manager": "bg-pink-500",
  "Purchasing Officer": "bg-purple-500",
  "Construction Manager": "bg-red-500",
  "Accounting Assistant": "bg-teal-500",
  "NR Specialist / IT Support Analyst / Web Developer": "bg-pink-700",
  "Contents Team": "bg-orange-500",
  "Mustang": "bg-gray-500",
  "Emergency Team": "bg-blue-700",
  "Logistics Team": "bg-green-700",
  "Final Repairs Team": "bg-yellow-700",
  "Automotive Specialist": "bg-indigo-700"
};

const MeetTheTeamPage: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePortalClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const animationVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="bg-gray-900 py-16">
      <Navbar onPortalClick={handlePortalClick} />
      <div className="container mx-auto mt-6 px-6">
        <motion.h1
          className="mb-10 text-center text-4xl font-extrabold text-white lg:text-6xl"
          initial="hidden"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Meet the Team
        </motion.h1>
        <section className="space-y-12">
          <motion.div
            className="text-center text-3xl font-bold text-white"
            initial="hidden"
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Office Team
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {upperManagement.map((member, index) => {
              const controls = useAnimation();
              const ref = useRef<HTMLDivElement>(null);
              const inView = useInView(ref);

              useEffect(() => {
                if (inView) {
                  controls.start("visible");
                } else {
                  controls.start("hidden");
                }
              }, [controls, inView]);

              return (
                <motion.div
                  key={index}
                  className={`rounded-lg p-6 shadow-lg ${roleColors[member.role]} relative`}
                  initial="hidden"
                  animate={controls}
                  variants={animationVariants}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover="hover"
                  ref={ref}
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-4 h-24 w-24 rounded-full bg-gray-200 overflow-hidden shadow-2xl">
                      <img src="/path/to/image.jpg" className="h-full w-full object-cover" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{member.name}</h2>
                    <div className="bg-white rounded-lg px-3 py-1 text-xs font-medium text-gray-800 mb-4">
                      {member.role}
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-800 mt-2 shadow-md">
                      {member.description}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
        <section className="mt-16 space-y-12">
          <motion.div
            className="text-center text-3xl font-bold text-white"
            initial="hidden"
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Team Members
          </motion.div>
          {teamMembers.map((teamSection, sectionIndex) => (
            <div key={sectionIndex}>
              <motion.div
                className={`rounded-lg p-6 shadow-lg ${roleColors[teamSection.role]}`}
                initial="hidden"
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.2 }}
              >
                <h2 className="mb-4 text-center text-2xl font-bold text-white">
                  {teamSection.role}
                </h2>
                <p className="text-sm text-center text-white mb-4">
                  {teamSection.description}
                </p>
                <div className={`grid gap-4 ${teamSection.members.length === 1 ? 'justify-center' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {teamSection.members.map((member, memberIndex) => {
                    const controls = useAnimation();
                    const ref = useRef<HTMLDivElement>(null);
                    const inView = useInView(ref);

                    useEffect(() => {
                      if (inView) {
                        controls.start("visible");
                      } else {
                        controls.start("hidden");
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
                        <div className="mb-4 h-24 w-24 rounded-full bg-gray-200 overflow-hidden shadow-xl">
                          <img src="/path/to/image.jpg" className="h-full w-full object-cover" />
                        </div>
                        <p className="text-lg font-semibold text-white">{member.name}</p>
                        <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-800 mt-2 shadow-md">
                          {member.description}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ))}
        </section>
      </div>
      {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
    </div>
  );
};

export default MeetTheTeamPage;
