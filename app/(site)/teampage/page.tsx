"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import Navbar from "@/app/components/siteNavBar";
import Modal  from "@/app/components/modal";
import {
  motion,
  useAnimation,
  useInView,
  AnimatePresence,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/* 0) Double-tap on mobile → scroll to top                            */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* 1) Light-box hook (typed, animated zoom-in flair)                  */
/* ------------------------------------------------------------------ */
type LightboxState = { imgs: string[]; idx: number } | null;

function useLightbox() {
  const [viewer, setViewer] = useState<LightboxState>(null);

  const open  = (imgs: string[], idx: number) => setViewer({ imgs, idx });
  const close = () => setViewer(null);
  const next  = () =>
    setViewer(v => (v ? { ...v, idx: (v.idx + 1) % v.imgs.length } : v));
  const prev  = () =>
    setViewer(v => (v ? { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length } : v));

  /* keys */
  const onKey = useCallback((e: KeyboardEvent) => {
    if (!viewer) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft")  prev();
  }, [viewer]);
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  /* swipe */
  const startX = useRef<number | null>(null);
  const start  = (x: number) => (startX.current = x);
  const end    = (x: number) => {
    if (!viewer || startX.current === null) return;
    const dx = x - startX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
    startX.current = null;
  };

  const overlay = (
    <AnimatePresence>
      {viewer && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          onPointerDown={e => start(e.clientX)}
          onPointerUp={e => end(e.clientX)}
        >
          {/* close */}
          <button
            className="absolute right-4 top-4 z-10 rounded bg-black/60 p-2 text-white backdrop-blur-md"
            onClick={e => { e.stopPropagation(); close(); }}
          >
            ✕
          </button>
          {/* arrows – only phones */}
          <button
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded bg-black/60 p-2 text-white md:hidden"
            onClick={e => { e.stopPropagation(); prev(); }}
          >◀</button>
          <button
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded bg-black/60 p-2 text-white md:hidden"
            onClick={e => { e.stopPropagation(); next(); }}
          >▶</button>

          <motion.img
            key={viewer.imgs[viewer.idx]}
            src={viewer.imgs[viewer.idx]}
            alt=""
            className="max-h-full max-w-full rounded-lg shadow-xl"
            initial={{ scale: .8, rotate: -5, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: .8, rotate: 5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={e => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
  return { open, overlay };
}

/* ------------------------------------------------------------------ */
/* 2) Data (original arrays)                                          */
/* ------------------------------------------------------------------ */
interface TeamMember { name: string; role: string; description: string; }
interface TeamSection { role: string; members:{ name:string; description:string }[]; description:string; }

const upperManagement: TeamMember[] = [
  { name:"Carlo Bernabe", role:"Project Manager", description:"Seasoned professional with over 20 years of experience, overseeing key aspects of restoration and repair projects." },
  { name:"Jun Adasa",     role:"Project Manager", description:"Leads multiple projects with a focus on strategic coordination, ensuring budgets, schedules, and client expectations are met." },
  { name:"Albert Siscar", role:"Project Manager", description:"Senior manager who drives project timelines, fosters strong client relationships, and guarantees high-quality outcomes." },
  { name:"DJ Lopez",      role:"Construction Manager", description:"Directs all final repair operations, managing budgets and collaborating with subcontractors to meet project scopes." },
  { name:"Ervin Ong",     role:"Project Coordinator", description:"Facilitates communication between teams, assisting in scheduling, client interaction, and on-site coordination." },
  { name:"Mac De Guzman", role:"Project Coordinator", description:"Focuses on large-scale projects, managing employee schedules and ensuring timely progress on key deliverables." },
  { name:"April Adasa",   role:"Purchasing Officer", description:"Oversees procurement and supply management, supporting both final repairs and contents operations." },
  { name:"Girlie Atienza",role:"Controller", description:"Manages financial tasks including bookkeeping, payroll, and time sheet administration." },
  { name:"Angelo Guerra", role:"Technical Support Analyst", description:"Provides IT solutions, web development, and process optimization to streamline company operations." },
];

const teamSections: TeamSection[] = [
  {
    role:"Contents Team",
    members:[
      { name:"Julia",  description:"Lead member ensuring smooth coordination of sorting, packing, labeling, and record-keeping." },
      { name:"Beth",   description:"Senior member focused on efficient team collaboration and thorough preparation for transport." },
      { name:"Lisa",   description:"Lead member ensuring all items are accurately tracked, labeled, and ready for packout and packback." },
      { name:"Lorena", description:"Contributes to every stage of content handling, maintaining accurate records of item locations." },
      { name:"Vivian", description:"Supports all aspects of sorting, labeling, and cleanup to keep operations running smoothly." },
    ],
    description:
      "The Contents Team collaboratively manages sorting, packing, proper labeling, and recording of items. They also handle initial cleanup and ensure everything is accounted for before and after transport.",
  },
  {
    role:"Emergency Team",
    members:[
      { name:"Ricco",    description:"Most tenured responder specializing in plumbing, ready for any urgent restoration needs." },
      { name:"Theo",     description:"Expert in demolition and asbestos abatement, ensuring quick, safe resolutions." },
      { name:"Chriskie", description:"Skilled in demolition and asbestos abatement, delivering prompt support for water, fire, smoke, and mold incidents." },
      { name:"Julius",   description:"Newest team member capable of handling a broad range of emergency tasks." },
    ],
    description:
      "The Emergency Team is the frontline crew for urgent restoration situations—whether water, fire, smoke, or mold. They respond swiftly, bring specialized equipment, and stabilize conditions alongside Project Managers on-site.",
  },
  {
    role:"Logistics Team",
    members:[
      { name:"George", description:"Coordinates packouts and packbacks with precision, ensuring items move safely from client sites to storage." },
      { name:"Lito",   description:"Oversees pickups, deliveries, and organizes stored items in designated pods for clients." },
    ],
    description:
      "The Logistics Team manages transportation and delivery, from retrieving packed items at client sites to placing them in secure warehouse pods, as well as delivering ordered materials to project locations.",
  },
  {
    role:"Final Repairs Team",
    members:[
      { name:"Fred",        description:"Specialist in final repairs, touch-ups, and warranty work to ensure top-quality results." },
      { name:"Bobby",       description:"Highly adept at final repairs with a strong specialty in drywalling; also flexible in handling various tasks."},
      { name:"Christopher", description:"Newest member of the final repairs team with strong expertise in HVAC systems." },
    ],
    description:
      "The Final Repairs Team handles the end-stage fixes, from essential touch-ups to warranty repairs. They step in for in-house repairs if subcontractors aren’t utilized.",
  },
  {
    role:"Automotive",
    members:[
      { name:"Jun C", description:"Handles all vehicle maintenance and repairs, providing support to other departments as needed." },
    ],
    description:
      "Our Automotive Specialist ensures company vehicles are in prime condition and assists other teams whenever necessary.",
  },
];

/* role-color map */
const roleColors: Record<string,string> = {
  "Project Manager":"bg-cyan-500",
  "Construction Manager":"bg-blue-500",
  "Project Coordinator":"bg-yellow-500",
  "Purchasing Officer":"bg-purple-500",
  Controller:"bg-pink-500",
  "Technical Support Analyst":"bg-lime-500",

  /* departments */
  "Contents Team":"bg-orange-500",
  "Emergency Team":"bg-blue-600",
  "Logistics Team":"bg-green-700",
  "Final Repairs Team":"bg-yellow-700",
  Automotive:"bg-indigo-700",
};

/* ------------------------------------------------------------------ */
/* 3) Helpers                                                         */
/* ------------------------------------------------------------------ */
const getImagePath = (name: string): string =>
  `/images/team/${name.toLowerCase().replace(/ /g, "_")}.jpg`;

const getGridClasses = (len:number) =>
  len===1 ? "justify-center"
  : len===10 ? "justify-center sm:grid-cols-5"
  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

const animationVariants = {
  hidden:{ opacity:0, y:50 },
  visible:{ opacity:1, y:0 },
  hover:{ scale:1.05, transition:{ duration:.3 }},
  tap:{ scale:1.05, transition:{ duration:.3 }},
};

/* ------------------------------------------------------------------ */
/* 4) Page component                                                  */
/* ------------------------------------------------------------------ */
export default function MeetTheTeamPage() {
  const [showModal, setShowModal] = useState(false);
  const [showMenu,  setShowMenu]  = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  useDoubleTapToTop();
  const lightbox = useLightbox();

  const toggleMenu = () => setShowMenu(v => !v);
  const scrollTo = (id:string) => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth"});
    setShowMenu(false);
  };

  const owner = upperManagement.find(m => m.role === "General Manager");
  const managers = upperManagement.filter(m => m.role !== "General Manager");
  const officeImgs = managers.map(m => getImagePath(m.name));

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
      {lightbox.overlay}
      <Navbar onPortalClick={() => setShowModal(true)} />

      {/* title */}
      <motion.h1
        className="mb-10 cursor-pointer text-center text-4xl font-extrabold text-white lg:text-6xl"
        initial={{ opacity:0, y:50 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:.5 }}
        onClick={toggleMenu}
      >
        Meet the Team
      </motion.h1>

      {/* menu */}
      {showMenu && (
        <div className="absolute left-0 top-16 z-50 w-full bg-gray-800 py-3 text-white shadow-xl">
          <button className="absolute right-4 top-1 text-2xl" onClick={toggleMenu}>×</button>
          <ul className="flex flex-col items-center space-y-2">
            <li className="cursor-pointer hover:text-cyan-300" onClick={()=>scrollTo("office-team")}>Office Team</li>
            {teamSections.map(s=>(
              <li key={s.role} className="cursor-pointer hover:text-cyan-300" onClick={()=>scrollTo(s.role)}>{s.role}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="container mx-auto mt-6 px-6 space-y-16">
        {/* Office Team */}
        <section id="office-team" className="space-y-12">
          <motion.h2
            className="text-center text-3xl font-bold text-white"
            initial={{ opacity:0, y:50 }}
            whileInView={{ opacity:1, y:0 }}
            transition={{ duration:.5 }}
          >
            Office Team
          </motion.h2>

          {/* managers */}
          <div className={`flex flex-wrap justify-center gap-12 ${getGridClasses(managers.length)}`}>
            {managers.map((m,i)=>{
              const ref = useRef<HTMLDivElement>(null);
              const inView = useInView(ref,{ once:true });
              const controls = useAnimation();
              useEffect(()=>{ if(inView) controls.start("visible") },[inView]);

              return (
                <motion.div
                  key={m.name}
                  ref={ref}
                  variants={animationVariants}
                  initial="hidden"
                  animate={controls}
                  whileHover="hover"
                  transition={{ duration:.5, delay:i*.1 }}
                  onClick={()=>lightbox.open(officeImgs,i)}
                  className={`cursor-pointer rounded-2xl p-6 shadow-xl ${roleColors[m.role]}`}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative -mt-16 mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-2xl ring-4 ring-white lg:-mt-20 lg:h-32 lg:w-32">
                      <img src={getImagePath(m.name)} className="h-full w-full object-cover" />
                    </div>
                    <h3 className="text-xl font-semibold text-white lg:text-2xl">{m.name}</h3>
                    <div className="mb-4 mt-1 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">{m.role}</div>
                    <p className="rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md lg:text-base">{m.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Departments */}
        {teamSections.map(sec=>{
          const imgs = sec.members.map(m=>getImagePath(m.name));
          return (
            <section id={sec.role} key={sec.role} className="space-y-12">
              <motion.h2 className="text-center text-3xl font-bold text-white"
                initial={{ opacity:0, y:50 }}
                whileInView={{ opacity:1, y:0 }}
                transition={{ duration:.5 }}>
                {sec.role}
              </motion.h2>

              <motion.div className={`rounded-2xl p-6 shadow-xl ${roleColors[sec.role]||"bg-orange-500"}`}
                initial={{ opacity:0, y:50 }}
                whileInView={{ opacity:1, y:0 }}
                transition={{ duration:.6 }}>
                <p className="mb-4 text-center text-sm text-white">{sec.description}</p>

                <div className={`grid gap-4 ${getGridClasses(sec.members.length)}`}>
                  {sec.members.map((m,idx)=>{
                    const ref = useRef<HTMLDivElement>(null);
                    const inView = useInView(ref,{ once:true });
                    const controls = useAnimation();
                    useEffect(()=>{ if(inView) controls.start("visible") },[inView]);

                    return (
                      <motion.div key={m.name} ref={ref}
                        variants={animationVariants}
                        initial="hidden"
                        animate={controls}
                        whileHover="hover"
                        transition={{ duration:.5, delay:idx*.1 }}
                        className="flex cursor-pointer flex-col items-center text-center"
                        onClick={()=>lightbox.open(imgs,idx)}
                      >
                        <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-xl ring-4 ring-white">
                          <img src={getImagePath(m.name)} className="h-full w-full object-cover" />
                        </div>
                        <p className="text-lg font-semibold text-white">{m.name}</p>
                        <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md">{m.description}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </section>
          );
        })}
      </div>

      {/* modal portal */}
      {isMounted && <Modal showModal={showModal} onClose={()=>setShowModal(false)} />}
    </div>
  );
}

