
"use client";

import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/app/components/siteNavBar";
import Modal from "@/app/components/modal";
import { LightboxProvider, useLightbox } from "@/app/context/LightboxProvider";
import { motion, useAnimation, useInView } from "framer-motion";

// Section color accents
const sectionColors: Record<
  string,
  { gradient: string; glow: string; inner: string }
> = {
  "Contents Team": {
    gradient: "from-orange-400/30 via-orange-100/30 to-white/10",
    glow: "rgba(251,146,60,0.13)",
    inner: "hover:bg-orange-100/70",
  },
  "Emergency Team": {
    gradient: "from-blue-500/20 via-blue-100/20 to-white/10",
    glow: "rgba(37,99,235,0.12)",
    inner: "hover:bg-blue-100/70",
  },
  "Logistics Team": {
    gradient: "from-green-600/20 via-green-100/20 to-white/10",
    glow: "rgba(21,128,61,0.10)",
    inner: "hover:bg-green-100/70",
  },
  "Final Repairs Team": {
    gradient: "from-yellow-400/30 via-yellow-100/30 to-white/10",
    glow: "rgba(202,138,4,0.11)",
    inner: "hover:bg-yellow-100/70",
  },
  Automotive: {
    gradient: "from-indigo-500/20 via-indigo-100/20 to-white/10",
    glow: "rgba(67,56,202,0.10)",
    inner: "hover:bg-indigo-100/70",
  },
};

const roleColors: Record<
  string,
  { border: string; ring: string; glow: string; gradient: string }
> = {
  "Project Manager": {
    border: "border-cyan-500",
    ring: "ring-cyan-400",
    glow: "rgba(34,211,238,0.18)",
    gradient: "from-cyan-400/20 via-cyan-200/10 to-white/10",
  },
  "Construction Manager": {
    border: "border-blue-500",
    ring: "ring-blue-400",
    glow: "rgba(59,130,246,0.16)",
    gradient: "from-blue-400/20 via-blue-200/10 to-white/10",
  },
  "Project Coordinator": {
    border: "border-yellow-500",
    ring: "ring-yellow-400",
    glow: "rgba(250,204,21,0.13)",
    gradient: "from-yellow-300/20 via-yellow-100/10 to-white/10",
  },
  "Purchasing Officer": {
    border: "border-purple-500",
    ring: "ring-purple-400",
    glow: "rgba(192,132,252,0.13)",
    gradient: "from-purple-400/20 via-purple-200/10 to-white/10",
  },
  Controller: {
    border: "border-pink-500",
    ring: "ring-pink-400",
    glow: "rgba(244,114,182,0.14)",
    gradient: "from-pink-400/20 via-pink-200/10 to-white/10",
  },
  "Technical Support Analyst": {
    border: "border-lime-500",
    ring: "ring-lime-400",
    glow: "rgba(163,230,53,0.11)",
    gradient: "from-lime-400/20 via-lime-200/10 to-white/10",
  },
};

type TeamMember = { name: string; role: string; description: string };
type TeamSection = {
  role: string;
  members: { name: string; description: string }[];
  description: string;
};

const upperManagement: TeamMember[] = [
  { name: "Carlo Bernabe", role: "Project Manager", description: "Seasoned professional with over 20 years of experience, overseeing key aspects of restoration and repair projects." },
  { name: "Jun Adasa", role: "Project Manager", description: "Leads multiple projects with a focus on strategic coordination, ensuring budgets, schedules, and client expectations are met." },
  { name: "Albert Siscar", role: "Project Manager", description: "Senior manager who drives project timelines, fosters strong client relationships, and guarantees high-quality outcomes." },
  { name: "DJ Lopez", role: "Construction Manager", description: "Directs all final repair operations, managing budgets and collaborating with subcontractors to meet project scopes." },
  { name: "Ervin Ong", role: "Project Coordinator", description: "Facilitates communication between teams, assisting in scheduling, client interaction, and on-site coordination." },
  { name: "Mac De Guzman", role: "Project Coordinator", description: "Focuses on large-scale projects, managing employee schedules and ensuring timely progress on key deliverables." },
  { name: "April Adasa", role: "Purchasing Officer", description: "Oversees procurement and supply management, supporting both final repairs and contents operations." },
  { name: "Girlie Atienza", role: "Controller", description: "Manages financial tasks including bookkeeping, payroll, and time sheet administration." },
  { name: "Angelo Guerra", role: "Technical Support Analyst", description: "Provides IT solutions, web development, and process optimization to streamline company operations." },
];

const teamSections: TeamSection[] = [
  {
    role: "Contents Team",
    description: "The Contents Team collaboratively manages sorting, packing, proper labeling, and recording of items. They also handle initial cleanup and ensure everything is accounted for before and after transport.",
    members: [
      { name: "Julia", description: "Lead member ensuring smooth coordination of sorting, packing, labeling, and record-keeping." },
      { name: "Beth", description: "Senior member focused on efficient team collaboration and thorough preparation for transport." },
      { name: "Lisa", description: "Lead member ensuring all items are accurately tracked, labeled, and ready for pack-out and pack-back." },
      { name: "Lorena", description: "Contributes to every stage of content handling, maintaining accurate records of item locations." },
      { name: "Vivian", description: "Supports all aspects of sorting, labeling, and cleanup to keep operations running smoothly." },
    ],
  },
  {
    role: "Emergency Team",
    description: "The Emergency Team is the frontline crew for urgent restoration situations—whether water, fire, smoke, or mold. They respond swiftly, bring specialized equipment, and stabilize conditions alongside Project Managers on-site.",
    members: [
      { name: "Ricco", description: "Most tenured responder specializing in plumbing, ready for any urgent restoration needs." },
      { name: "Theo", description: "Expert in demolition and asbestos abatement, ensuring quick, safe resolutions." },
      { name: "Chriskie", description: "Skilled in demolition and asbestos abatement, delivering prompt support for water, fire, smoke, and mold incidents." },
      { name: "Julius", description: "Newest team member capable of handling a broad range of emergency tasks." },
    ],
  },
  {
    role: "Logistics Team",
    description: "The Logistics Team manages transportation and delivery, from retrieving packed items at client sites to placing them in secure warehouse pods, as well as delivering ordered materials to project locations.",
    members: [
      { name: "George", description: "Coordinates pack-outs and pack-backs with precision, ensuring items move safely from client sites to storage." },
      { name: "Lito", description: "Oversees pickups, deliveries, and organizes stored items in designated pods for clients." },
    ],
  },
  {
    role: "Final Repairs Team",
    description: "The Final Repairs Team handles the end-stage fixes, from essential touch-ups to warranty repairs. They step in for in-house repairs if subcontractors aren’t utilized.",
    members: [
      { name: "Fred", description: "Specialist in final repairs, touch-ups, and warranty work to ensure top-quality results." },
      { name: "Bobby", description: "Highly adept at final repairs with a strong specialty in drywalling; also flexible in handling various tasks." },
      { name: "Christopher", description: "Newest member of the final repairs team with strong expertise in HVAC systems." },
      { name: "Dann", description: "Specialist in floor covering installation, expertly fitting hardwood, laminate, and vinyl to ensure seamless, durable, and aesthetically pleasing finishes." },
    ],
  },
  {
    role: "Automotive",
    description: "Our Automotive Specialist ensures company vehicles are in prime condition and assists other teams whenever necessary.",
    members: [
      { name: "Jun C", description: "Handles all vehicle maintenance and repairs, providing support to other departments as needed." },
    ],
  },
];

const getImagePath = (name: string) =>
  `/images/team/${name.toLowerCase().replace(/ /g, "_")}.jpg`;

function SectionDivider({ colors = "from-cyan-400 via-white to-cyan-400", className = "" }) {
  return (
    <div
      className={`mx-auto h-1 w-2/3 rounded-full bg-gradient-to-r ${colors} blur-[1px] opacity-60 ${className}`}
    />
  );
}

function TeamPageInner() {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useDoubleTapToTop();
  const { open } = useLightbox();

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const toggleMenu = () => setShowMenu((v) => !v);
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setShowMenu(false);
  };

  const managers = upperManagement.filter((m) => m.role !== "General Manager");
  const officeImgs = managers.map((m) => getImagePath(m.name));

  return (
    <div className="relative bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 min-h-screen">
      {/* SVG Noise Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/noise.png')",
          opacity: 0.07,
        }}
      />

      <div>
        <Navbar onPortalClick={() => setShowModal(true)} />

        {/* -- SECTION MENU: restored for jump-to-section -- */}
        <div className="w-full flex justify-center items-center pt-6 pb-2">
          <motion.h1
            className="mt-16 text-center text-5xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-xl transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              textShadow: "0 2px 16px rgba(0,255,255,0.10), 0 4px 32px rgba(0,0,0,0.14)",
              letterSpacing: "0.04em",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={toggleMenu}
          >
            Meet the Team
          </motion.h1>
        </div>

        {/* Dropdown menu (all teams visible and readable) */}
        {showMenu && (
          <div className="fixed left-0 top-0 w-full h-full bg-black/50 z-50 flex flex-col items-center pt-24">
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.23, ease: "easeOut" }}
              className="relative bg-gradient-to-br from-slate-800/90 via-gray-900/95 to-gray-800/90
                 backdrop-blur-lg border border-white/10 shadow-2xl w-full max-w-sm mx-auto rounded-2xl px-8 py-8"
            >
              <button
                className="absolute right-6 top-4 text-3xl text-white/80 hover:text-white transition"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                ×
              </button>
              <ul className="flex flex-col items-center space-y-4">
                <li
                  className="cursor-pointer text-white text-xl font-extrabold tracking-wide hover:text-cyan-300 transition border-b-2 border-transparent hover:border-cyan-400 px-3 py-1"
                  onClick={() => scrollTo("office-team")}
                  tabIndex={0}
                >
                  Office Team
                </li>
                {teamSections.map((s) => (
                  <li
                    key={s.role}
                    className="cursor-pointer text-white text-xl font-extrabold tracking-wide hover:text-cyan-300 transition border-b-2 border-transparent hover:border-cyan-400 px-3 py-1"
                    onClick={() => scrollTo(s.role)}
                    tabIndex={0}
                  >
                    {s.role}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}

        {/* --- OFFICE TEAM --- */}
        <section id="office-team" className="space-y-10">
          <motion.h2
            className="text-center text-3xl font-bold text-white mb-6 mt-4 tracking-wider"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Office Team
          </motion.h2>
          <div className="w-full flex justify-center">
            <div
              className={`
                grid gap-8
                grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                max-w-5xl w-full justify-center
                px-4
              `}
            >
              {managers.map((m, i) => {
                const ref = useRef<HTMLDivElement>(null);
                const inView = useInView(ref, { once: true });
                const controls = useAnimation();
                useEffect(() => {
                  if (inView) controls.start("visible");
                }, [inView, controls]);
                const accent = roleColors[m.role] || roleColors["Technical Support Analyst"];
                return (
                  <motion.div
                    key={m.name}
                    ref={ref}
                    variants={{
                      hidden: { opacity: 0, y: 50 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    initial="hidden"
                    animate={controls}
                    whileInView="visible"
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    onClick={() => open(officeImgs, i)}
                    className={`
                      cursor-pointer relative flex flex-col items-center
                      rounded-2xl
                      bg-gradient-to-br ${accent.gradient}
                      bg-white/20 backdrop-blur-lg
                      border border-white/30 border-l-8 ${accent.border}
                      min-w-[260px] max-w-[350px] pt-16 pb-7 px-6
                      group
                      transition-all duration-200
                      shadow-xl
                    `}
                    style={{
                      marginTop: "52px",
                      overflow: "visible",
                      boxShadow: `0 16px 40px 0 ${accent.glow}, 0 2px 16px 0 rgba(30,41,59,0.10)`,
                    }}
                    whileHover={{
                      scale: 1.06,
                      boxShadow: `0 36px 80px 0 ${accent.glow}, 0 2px 48px 0 ${accent.glow}, 0 2px 16px 0 rgba(30,41,59,0.19)`,
                      backgroundColor: "rgba(255,255,255,0.38)",
                      transition: { duration: 0.15, type: "tween" },
                    }}
                  >
                    <div
                      className={`
                        absolute -top-14 left-1/2 -translate-x-1/2
                        h-24 w-24 rounded-full
                        bg-gray-200
                        ring-4 ${accent.ring} ring-offset-2 ring-offset-white
                        shadow-2xl flex items-center justify-center z-10
                        group-hover:scale-105
                        transition-transform
                      `}
                      style={{
                        boxShadow: `0 0 0 6px ${accent.glow}`,
                      }}
                    >
                      <img
                        src={getImagePath(m.name)}
                        alt={m.name}
                        className="h-full w-full object-cover rounded-full"
                      />
                      <span
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          boxShadow: `0 0 24px 3px ${accent.glow}`,
                          opacity: 0.5,
                        }}
                      />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white tracking-wide text-center drop-shadow">
                      {m.name}
                    </h3>
                    <div
                      className="mb-3 mt-2 rounded-full bg-white/20 px-4 py-1 text-xs font-semibold text-white shadow backdrop-blur-md"
                      style={{
                        border: `1.5px solid ${accent.glow}`,
                        letterSpacing: "0.08em",
                        display: "inline-block",
                      }}
                    >
                      {m.role}
                    </div>
                    <p
                      className="rounded-xl bg-white/40 px-4 py-3 text-sm text-gray-800 shadow-md font-medium mt-2 text-center"
                      style={{
                        border: "1px solid rgba(255,255,255,0.11)",
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      {m.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <SectionDivider colors="from-cyan-400 via-fuchsia-400 to-lime-300" className="my-12" />

        {/* --- OTHER TEAMS --- */}
        {teamSections.map((sec, sidx) => {
          const imgs = sec.members.map((mem) => getImagePath(mem.name));
          const accent = sectionColors[sec.role] || sectionColors["Contents Team"];
          const isSingle = sec.members.length === 1;
          const isLast = sidx === teamSections.length - 1;
          return (
            <React.Fragment key={sec.role}>
              <section id={sec.role} className="space-y-0">
                <motion.h2
                  className="text-center text-3xl font-bold text-white mb-8 mt-10 tracking-wider"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.06 * sidx }}
                >
                  {sec.role}
                </motion.h2>
                <div className="w-full flex justify-center">
                  <motion.div
                    className={`
                      w-full max-w-4xl
                      bg-gradient-to-br ${accent.gradient} rounded-2xl border border-white/20
                      shadow-2xl backdrop-blur-lg p-6 sm:p-10 transition-all duration-200
                      flex flex-col items-center
                      mx-2 sm:mx-0
                      ${isLast ? "mb-16" : ""}
                    `}
                    style={{
                      boxShadow: `0 4px 28px 0 ${accent.glow}, 0 2px 16px 0 rgba(30,41,59,0.09)`,
                    }}
                    whileHover={{
                      boxShadow: `0 10px 52px 0 ${accent.glow}, 0 6px 36px 0 rgba(30,41,59,0.15)`,
                      transition: { duration: 0.17, type: "tween" },
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.07 * sidx }}
                  >
                    <p className="mb-8 text-center text-base text-white/90 font-medium drop-shadow-sm max-w-2xl mx-auto">
                      {sec.description}
                    </p>
                    <div
                      className={`
                        grid gap-8
                        ${isSingle
                          ? "grid-cols-1 justify-center"
                          : sec.members.length < 4
                          ? "grid-cols-1 sm:grid-cols-2 justify-center"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center"}
                        w-full
                        ${isSingle ? "max-w-xs mx-auto" : ""}
                      `}
                    >
                      {sec.members.map((mem, idx) => {
                        const ref = useRef<HTMLDivElement>(null);
                        const inView = useInView(ref, { once: true });
                        const controls = useAnimation();
                        useEffect(() => {
                          if (inView) controls.start("visible");
                        }, [inView, controls]);
                        return (
                          <motion.div
                            key={mem.name}
                            ref={ref}
                            variants={{
                              hidden: { opacity: 0, y: 50 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            initial="hidden"
                            animate={controls}
                            whileInView="visible"
                            transition={{ duration: 0.55, delay: idx * 0.09 }}
                            onClick={() => open(imgs, idx)}
                            className={`
                              relative flex flex-col items-center rounded-xl
                              bg-white/60 backdrop-blur-md border border-white/20
                              pt-14 pb-6 px-5 shadow
                              transition-all duration-200
                              cursor-pointer
                              ${isSingle ? "mx-auto" : ""}
                              ${accent.inner}
                            `}
                            style={{
                              marginTop: "14px",
                              overflow: "visible",
                            }}
                            whileHover={{
                              scale: 1.045,
                              boxShadow: `0 6px 20px 0 ${accent.glow}`,
                              backgroundColor: "rgba(255,255,255,0.93)",
                              transition: { duration: 0.13, type: "tween" },
                            }}
                          >
                            <div
                              className={`
                                absolute -top-10 left-1/2 -translate-x-1/2
                                h-20 w-20 rounded-full
                                bg-gray-200 ring-4 ring-white/90
                                shadow-lg
                                flex items-center justify-center z-10
                                group-hover:scale-105
                                transition-transform
                              `}
                            >
                              <img
                                src={getImagePath(mem.name)}
                                alt={mem.name}
                                className="h-full w-full object-cover rounded-full"
                              />
                            </div>
                            <p className="text-lg font-bold text-gray-900 tracking-wide text-center">
                              {mem.name}
                            </p>
                            <div
                              className="mt-2 rounded-lg bg-white/90 px-3 py-2 text-sm text-gray-800 shadow-sm font-medium text-center"
                              style={{
                                backdropFilter: "blur(2px)",
                                border: "1px solid rgba(255,255,255,0.13)",
                              }}
                            >
                              {mem.description}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </section>
              {sidx < teamSections.length - 1 && (
                <SectionDivider
                  colors="from-orange-300 via-fuchsia-300 to-cyan-300"
                  className="mt-12 mb-12"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <Modal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

// Double-tap to scroll-to-top
function useDoubleTapToTop() {
  const last = useRef<number | null>(null);
  useEffect(() => {
    const handler = (e: TouchEvent) => {
      const now = Date.now();
      if (last.current && now - last.current < 200) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        e.preventDefault();
      }
      last.current = now;
    };
    window.addEventListener("touchend", handler);
    return () => window.removeEventListener("touchend", handler);
  }, []);
}

export default function MeetTheTeamPage() {
  return (
    <LightboxProvider>
      <TeamPageInner />
    </LightboxProvider>
  );
}
