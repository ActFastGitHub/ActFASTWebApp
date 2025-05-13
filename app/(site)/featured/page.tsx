// "use client";

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import Navbar from "@/app/components/siteNavBar";
// import Modal  from "@/app/components/modal";
// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// /* ============ 1 .  data  (add more later) ============ */
// const projects = [
//   {
//     title: "Agas Fire Restoration",
//     description:
//       "Complete rebuild of a house totally destroyed by fire—restored better than new.",
//     before: [
//       "/images/Projects/Agas/Before/Before (1).jpg",
//       "/images/Projects/Agas/Before/Before (2).jpg",
//       "/images/Projects/Agas/Before/Before (3).jpg",
//       "/images/Projects/Agas/Before/Before (4).jpg",
//       "/images/Projects/Agas/Before/Before (5).jpg",
//       "/images/Projects/Agas/Before/Before (6).jpg",
//     ],
//     after: [
//       "/images/Projects/Agas/After/After (1).jpg",
//       "/images/Projects/Agas/After/After (2).jpg",
//       "/images/Projects/Agas/After/After (3).jpg",
//       "/images/Projects/Agas/After/After (4).jpg",
//       "/images/Projects/Agas/After/After (5).jpg",
//       "/images/Projects/Agas/After/After (6).jpg",
//     ],
//   },
// ];

// /* ============ 2 .  light-box hook (unchanged) ============ */
// function useLightbox() {
//   const [viewer, setViewer] = useState<{ imgs: string[]; idx: number } | null>(null);

//   const open  = (imgs: string[], idx: number) => setViewer({ imgs, idx });
//   const close = () => setViewer(null);
//   const next  = () => setViewer(v => v && { ...v, idx: (v.idx + 1) % v.imgs.length });
//   const prev  = () => setViewer(v => v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length });

//   /* keys */
//   const onKey = useCallback((e: KeyboardEvent) => {
//     if (!viewer) return;
//     if (e.key === "Escape") close();
//     if (e.key === "ArrowRight") next();
//     if (e.key === "ArrowLeft")  prev();
//   }, [viewer]);
//   useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);

//   /* swipe */
//   const startX = useRef<number | null>(null);
//   const touchStart = (x: number) => (startX.current = x);
//   const touchEnd   = (x: number) => {
//     if (!viewer || startX.current === null) return;
//     const dx = x - startX.current;
//     if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
//     startX.current = null;
//   };

//   const overlay = viewer && (
//     <div
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
//       onClick={close}
//       onPointerDown={e => touchStart(e.clientX)}
//       onPointerUp={e => touchEnd(e.clientX)}
//     >
//       <button className="absolute right-4 top-4 rounded bg-black/60 p-2 text-white" onClick={close}>✕</button>
//       <img
//         src={viewer.imgs[viewer.idx]}
//         className="max-h-full max-w-full object-contain"
//         onClick={e => e.stopPropagation()}
//         alt=""
//       />
//     </div>
//   );
//   return { open, overlay };
// }

// /* helper: B0 A0 B1 A1 … */
// const interleave = (a: string[], b: string[]) =>
//   a.flatMap((v, i) => (b[i] ? [v, b[i]] : [v])).concat(b.slice(a.length));

// /* ============ 3 .  responsive project block ============ */
// function Project({ project, idx, open }: {
//   project: typeof projects[number]; idx: number;
//   open: (imgs: string[], i: number) => void;
// }) {
//   const slides = interleave(project.before, project.after);
//   const { ref, inView } = useInView({ threshold: .2 });
//   const anim = useAnimation();
//   useEffect(() => { anim.start(inView ? "visible" : "hidden"); }, [inView, anim]);

//   const rowDir = idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse";

//   return (
//     <section ref={ref} className="mx-auto mb-20 max-w-6xl px-4 md:px-6 lg:px-8">
//       <div className={`flex flex-col items-center ${rowDir} lg:space-x-8`}>
//         <motion.div
//           variants={{ hidden:{ opacity:0, x: idx%2?50:-50 }, visible:{ opacity:1,x:0 }}}
//           initial="hidden" animate={anim} transition={{ duration:.5 }}
//           className="w-full lg:w-1/2"
//         >
//           <Swiper navigation pagination={{ clickable:true }} modules={[Navigation,Pagination]}
//                   className="aspect-video w-full rounded-lg shadow-lg">
//             {slides.map((src,i)=>(
//               <SwiperSlide key={src}>
//                 <img src={src} alt="" className="h-full w-full object-cover cursor-pointer"
//                      onClick={()=>open(slides,i)}/>
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         </motion.div>

//         <motion.div
//           variants={{ hidden:{ opacity:0, y:50 }, visible:{ opacity:1, y:0 }}}
//           initial="hidden" animate={anim} transition={{ duration:.5, delay:.2 }}
//           className="mt-6 w-full lg:mt-0 lg:w-1/2"
//         >
//           <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">{project.title}</h2>
//           <p className="text-gray-200">{project.description}</p>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// /* ============ 4 .  page =========================================== */
// export default function FeaturedPage() {
//   const [mounted,setMounted] = useState(false);
//   const [showModal,setShowModal] = useState(false);
//   const lightbox = useLightbox();

//   useEffect(()=>{ setMounted(true); }, []);

//   return (
//     <div className="min-h-screen bg-gray-900 pb-16 pt-24">{/* pt-24 replaces h1 mt-24 */}
//       {lightbox.overlay}
//       <Navbar onPortalClick={()=>setShowModal(true)} />

//       <h1 className="mx-auto mb-14 max-w-6xl px-4 text-center text-4xl font-extrabold text-white lg:text-6xl">
//         Featured Projects
//       </h1>

//       {projects.map((p,i)=>(
//         <Project key={i} project={p} idx={i} open={lightbox.open}/>
//       ))}

//       {mounted && <Modal showModal={showModal} onClose={()=>setShowModal(false)}/>}
//     </div>
//   );
// }

"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  useMemo,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Navbar from "@/app/components/siteNavBar";
import Modal from "@/app/components/modal";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ------------------------------------------------------------------ */
/* 1️⃣  raw data                                                       */
/* ------------------------------------------------------------------ */
const projects = [
  {
    title: "Agas Fire Restoration",
    description:
      "Complete rebuild of a house totally destroyed by fire—restored better than new.",
    before: Array.from({ length: 6 }, (_, i) => `/images/Projects/Agas/Before/Before (${i + 1}).jpg`),
    after: Array.from({ length: 6 }, (_, i) => `/images/Projects/Agas/After/After (${i + 1}).jpg`),
  },
];

/* ------------------------------------------------------------------ */
/* 2️⃣  light-box (unchanged)                                          */
/* ------------------------------------------------------------------ */
function useLightbox() {
  const [viewer, setViewer] = useState<{ imgs: string[]; idx: number } | null>(
    null,
  );

  const open = (imgs: string[], idx: number) => setViewer({ imgs, idx });
  const close = () => setViewer(null);
  const next = () =>
    setViewer((v) => v && { ...v, idx: (v.idx + 1) % v.imgs.length });
  const prev = () =>
    setViewer((v) => v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length });

  /* keys */
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!viewer) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    },
    [viewer],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  /* swipe */
  const startX = useRef<number | null>(null);
  const touchStart = (x: number) => (startX.current = x);
  const touchEnd = (x: number) => {
    if (!viewer || startX.current === null) return;
    const dx = x - startX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
    startX.current = null;
  };

  const overlay =
    viewer && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        onClick={close}
        onPointerDown={(e) => touchStart(e.clientX)}
        onPointerUp={(e) => touchEnd(e.clientX)}
      >
        <button
          className="absolute right-4 top-4 rounded bg-black/60 p-2 text-white"
          onClick={close}
        >
          ✕
        </button>
        <img
          src={viewer.imgs[viewer.idx]}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
          alt=""
        />
      </div>
    );

  return { open, overlay };
}

/* ------------------------------------------------------------------ */
/* helper → B0 A0 B1 A1 …  plus label                                 */
/* ------------------------------------------------------------------ */
const pairSlides = (before: string[], after: string[]) => {
  const out: { src: string; label: "Before" | "After" }[] = [];
  const max = Math.max(before.length, after.length);
  for (let i = 0; i < max; i++) {
    if (before[i]) out.push({ src: before[i], label: "Before" });
    if (after[i]) out.push({ src: after[i], label: "After" });
  }
  return out;
};

/* ------------------------------------------------------------------ */
/* 3️⃣  project block (memoised)                                       */
/* ------------------------------------------------------------------ */
const Project = memo(function Project({
  project,
  idx,
  open,
}: {
  project: (typeof projects)[number];
  idx: number;
  open: (imgs: string[], i: number) => void;
}) {
  const slides = useMemo(
    () => pairSlides(project.before, project.after),
    [project.before, project.after],
  );

  const { ref, inView } = useInView({ threshold: 0.2 });
  const anim = useAnimation();
  useEffect(() => {
    anim.start(inView ? "visible" : "hidden");
  }, [inView, anim]);

  const rowDir = idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse";

  return (
    <section
      ref={ref}
      className="mx-auto mb-20 max-w-6xl px-4 md:px-6 lg:px-8"
    >
      <div
        className={`flex flex-col items-center ${rowDir} lg:space-x-8`}
      >
        {/* slideshow */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: idx % 2 ? 50 : -50 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          animate={anim}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2"
        >
          <Swiper
            navigation
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            className="aspect-video w-full rounded-lg shadow-lg"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={s.src}>
                <div className="relative h-full w-full">
                  <img
                    src={s.src}
                    alt={`${s.label} image ${i + 1} for ${project.title}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full cursor-pointer object-cover"
                    onClick={() =>
                      open(
                        slides.map((sl) => sl.src),
                        i,
                      )
                    }
                  />
                  {/* label overlay */}
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-semibold uppercase text-white tracking-wider">
                    {s.label}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* description */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate={anim}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 w-full lg:mt-0 lg:w-1/2"
        >
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            {project.title}
          </h2>
          <p className="text-gray-200">{project.description}</p>
        </motion.div>
      </div>
    </section>
  );
});

/* ------------------------------------------------------------------ */
/* 4️⃣  page component                                                */
/* ------------------------------------------------------------------ */
export default function FeaturedPage() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const lightbox = useLightbox();

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-gray-900 pb-16 pt-24">
      {lightbox.overlay}
      <Navbar onPortalClick={() => setShowModal(true)} />

      <h1 className="mx-auto mb-14 max-w-6xl px-4 text-center text-4xl font-extrabold text-white lg:text-6xl">
        Featured Projects
      </h1>

      {projects.map((p, i) => (
        <Project key={i} project={p} idx={i} open={lightbox.open} />
      ))}

      {mounted && (
        <Modal showModal={showModal} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

