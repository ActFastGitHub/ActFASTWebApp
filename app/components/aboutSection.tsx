// // "use client";

// // import React, { useEffect } from "react";
// // import { Swiper, SwiperSlide } from "swiper/react";
// // import { EffectFade, Navigation, Autoplay } from "swiper/modules";

// // import "swiper/css";
// // import "swiper/css/effect-fade";
// // import "swiper/css/navigation";

// // import { motion, useAnimation } from "framer-motion";
// // import { useInView } from "react-intersection-observer";

// // import { useLightbox } from "@/app/context/LightboxProvider";
// // import { EyeIcon } from "@heroicons/react/24/outline";
// // import MissionImage from "@/app/images/mission.jpg";
// // import VisionImage from "@/app/images/vision.jpg";

// // const aboutImages = [
// //   "/images/About/image (1).jpg",
// //   "/images/About/image (2).jpg",
// //   "/images/About/image (3).jpg",
// //   "/images/About/image (4).jpg",
// //   "/images/About/image (5).JPG",
// //   "/images/About/image (6).JPG",
// //   "/images/About/image (7).JPG",
// //   "/images/About/image (8).JPG",
// //   "/images/About/image (9).JPG",
// //   "/images/About/image (10).jpg",
// //   "/images/About/image (11).jpg",
// //   "/images/About/image (12).jpg",
// //   "/images/About/image (13).jpg",
// //   "/images/About/image (14).jpg",
// //   "/images/About/image (15).jpg",
// //   "/images/About/image (16).jpg",
// //   "/images/About/image (17).jpg",
// //   "/images/About/image (18).jpg",
// //   "/images/About/image (19).jpg",
// // ];

// // export default function AboutSection() {
// //   const { open } = useLightbox();

// //   const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
// //   const controls = useAnimation();
// //   useEffect(() => {
// //     if (inView) controls.start("visible");
// //   }, [inView, controls]);

// //   return (
// //     <section className="bg-gray-800 py-12" ref={ref}>
// //       <div className="container mx-auto px-4">
// //         <motion.h2
// //           className="mb-8 text-center text-5xl font-bold text-white"
// //           initial="hidden"
// //           animate={controls}
// //           variants={{
// //             visible: { opacity: 1, y: 0 },
// //             hidden: { opacity: 0, y: -50 },
// //           }}
// //           transition={{ duration: 0.5 }}
// //         >
// //           About Us
// //         </motion.h2>
// //         <div className="relative mb-12 flex flex-col items-center rounded-lg bg-gray-100 p-6 shadow-2xl lg:flex-row">
// //           {/* carousel */}
// //           <div className="relative z-0 mb-8 w-full lg:mb-0 lg:w-1/2 lg:pr-8">
// //             <Swiper
// //               effect="fade"
// //               autoplay={{ delay: 2500, disableOnInteraction: false }}
// //               loop
// //               navigation={false}
// //               modules={[EffectFade, Navigation, Autoplay]}
// //               className="h-64 w-full"
// //             >
// //               {aboutImages.map((src, i) => (
// //                 <SwiperSlide key={src}>
// //                   <div
// //                     className="relative h-64 w-full select-none group cursor-pointer"
// //                     tabIndex={0}
// //                     role="button"
// //                     aria-label={`Open gallery for About images`}
// //                     onClick={() => open(aboutImages, i)}
// //                     onKeyDown={e => {
// //                       if (e.key === "Enter" || e.key === " ") open(aboutImages, i);
// //                     }}
// //                     draggable={false}
// //                   >
// //                     <motion.img
// //                       src={src}
// //                       alt={`About image ${i + 1}`}
// //                       className="h-64 w-full object-cover rounded transition-transform group-hover:scale-105 duration-300"
// //                       initial={{ opacity: 0 }}
// //                       animate={controls}
// //                       variants={{
// //                         visible: { opacity: 1 },
// //                         hidden: { opacity: 0 },
// //                       }}
// //                       transition={{ duration: 0.8 }}
// //                       draggable={false}
// //                     />
// //                     {/* Gradient overlay (no pointer events) */}
// //                     <div
// //                       className="
// //                         absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
// //                         opacity-100 md:opacity-0 md:group-hover:opacity-80
// //                         transition-opacity duration-200 pointer-events-none
// //                       "
// //                     ></div>
// //                     {/* View Gallery Icon (pointer events enabled for this wrapper and span) */}
// //                     <div
// //                       className="
// //                         absolute inset-x-0 bottom-4 flex justify-center
// //                         opacity-100 md:opacity-0 md:group-hover:opacity-100
// //                         transition-opacity duration-200
// //                         pointer-events-auto
// //                       "
// //                     >
// //                       <span className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md pointer-events-auto select-none">
// //                         <EyeIcon className="w-5 h-5" />
// //                         View Gallery
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </SwiperSlide>
// //               ))}
// //             </Swiper>
// //           </div>
// //           {/* text */}
// //           <motion.div
// //             className="w-full lg:w-1/2 lg:pl-8"
// //             initial="hidden"
// //             animate={controls}
// //             variants={{
// //               visible: { opacity: 1, x: 0 },
// //               hidden: { opacity: 0, x: 50 },
// //             }}
// //             transition={{ duration: 0.5, delay: 0.2 }}
// //           >
// //             <p className="mb-4 text-gray-600">
// //               We are a restoration and repairs company dedicated to providing
// //               top‑notch services. Our experienced team restores your home to its
// //               former glory—specialising in water, fire, and mold damage plus
// //               general repairs.
// //             </p>
// //             <p className="text-gray-600">
// //               Customers are never just a claim number. We handle every project
// //               with empathy, easing the stress of families in peril.
// //             </p>
// //           </motion.div>
// //         </div>
// //         <div className="flex flex-col items-center justify-center lg:flex-row lg:space-x-8">
// //           {/* Mission */}
// //           <motion.div
// //             className="flex w-full flex-col items-center lg:w-1/2"
// //             initial="hidden"
// //             animate={controls}
// //             variants={{
// //               visible: { opacity: 1, y: 0 },
// //               hidden: { opacity: 0, y: 50 },
// //             }}
// //             transition={{ duration: 0.5, delay: 0.4 }}
// //           >
// //             <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
// //               <div className="absolute -top-8 mb-4 h-40 w-40">
// //                 <img
// //                   src={MissionImage.src}
// //                   alt="Mission"
// //                   className="h-full w-full rounded-full border-4 border-red-600 object-cover"
// //                 />
// //               </div>
// //               <div className="mt-16 text-center">
// //                 <h3 className="mb-2 text-xl font-semibold">Our Mission</h3>
// //                 <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
// //                   To provide the best experience for our customers in insurance
// //                   claims and construction‑related services, constantly improving
// //                   for customers, associates, and community.
// //                 </p>
// //               </div>
// //             </div>
// //           </motion.div>
// //           {/* Vision */}
// //           <motion.div
// //             className="mt-12 flex w-full flex-col items-center lg:mt-6 lg:w-1/2"
// //             initial="hidden"
// //             animate={controls}
// //             variants={{
// //               visible: { opacity: 1, y: 0 },
// //               hidden: { opacity: 0, y: 50 },
// //             }}
// //             transition={{ duration: 0.5, delay: 0.6 }}
// //           >
// //             <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
// //               <div className="absolute -top-8 mb-4 h-40 w-40">
// //                 <img
// //                   src={VisionImage.src}
// //                   alt="Vision"
// //                   className="h-full w-full rounded-full border-4 border-red-600 object-cover"
// //                 />
// //               </div>
// //               <div className="mt-16 text-center">
// //                 <h3 className="mb-2 text-xl font-semibold">Our Vision</h3>
// //                 <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
// //                   To be the leading restoration company known for innovation,
// //                   reliability, and excellence—setting new standards for the
// //                   industry.
// //                 </p>
// //               </div>
// //             </div>
// //           </motion.div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }

// "use client";

// import React, { useEffect } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectFade, Navigation, Autoplay } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/effect-fade";
// import "swiper/css/navigation";

// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// import { useLightbox } from "@/app/context/LightboxProvider";
// import { EyeIcon } from "@heroicons/react/24/outline";
// import MissionImage from "@/app/images/mission.jpg";
// import VisionImage from "@/app/images/vision.jpg";

// const aboutImages = [
//   "/images/About/image (1).jpg",
//   "/images/About/image (2).jpg",
//   "/images/About/image (3).jpg",
//   "/images/About/image (4).jpg",
//   "/images/About/image (5).JPG",
//   "/images/About/image (6).JPG",
//   "/images/About/image (7).JPG",
//   "/images/About/image (8).JPG",
//   "/images/About/image (9).JPG",
//   "/images/About/image (10).jpg",
//   "/images/About/image (11).jpg",
//   "/images/About/image (12).jpg",
//   "/images/About/image (13).jpg",
//   "/images/About/image (14).jpg",
//   "/images/About/image (15).jpg",
//   "/images/About/image (16).jpg",
//   "/images/About/image (17).jpg",
//   "/images/About/image (18).jpg",
//   "/images/About/image (19).jpg",
// ];

// export default function AboutSection() {
//   const { open } = useLightbox();

//   const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
//   const controls = useAnimation();
//   useEffect(() => {
//     if (inView) controls.start("visible");
//   }, [inView, controls]);

//   return (
//     <section className="bg-gray-800 py-12" ref={ref}>
//       <div className="container mx-auto px-4">
//         <motion.h2
//           className="mb-8 text-center text-5xl font-bold text-white"
//           initial="hidden"
//           animate={controls}
//           variants={{
//             visible: { opacity: 1, y: 0 },
//             hidden: { opacity: 0, y: -50 },
//           }}
//           transition={{ duration: 0.5 }}
//         >
//           About Us
//         </motion.h2>
//         <div className="relative mb-12 flex flex-col items-center rounded-lg bg-gray-100 p-6 shadow-2xl lg:flex-row">
//           {/* carousel */}
//           <div className="relative z-0 mb-8 w-full lg:mb-0 lg:w-1/2 lg:pr-8">
//             <Swiper
//               effect="fade"
//               autoplay={{ delay: 2500, disableOnInteraction: false }}
//               loop
//               navigation={false}
//               modules={[EffectFade, Navigation, Autoplay]}
//               className="h-64 w-full"
//             >
//               {aboutImages.map((src, i) => (
//                 <SwiperSlide key={src}>
//                   {/* --- group must wrap BOTH img and overlay --- */}
//                   <div
//                     className="relative h-64 w-full group cursor-pointer select-none rounded"
//                     tabIndex={0}
//                     role="button"
//                     aria-label={`Open gallery for About images`}
//                     onClick={() => open(aboutImages, i)}
//                     onKeyDown={e => {
//                       if (e.key === "Enter" || e.key === " ") open(aboutImages, i);
//                     }}
//                     draggable={false}
//                   >
//                     {/* Main image */}
//                     <motion.img
//                       src={src}
//                       alt={`About image ${i + 1}`}
//                       className="h-64 w-full object-cover rounded transition-transform group-hover:scale-105 duration-300"
//                       initial={{ opacity: 0 }}
//                       animate={controls}
//                       variants={{
//                         visible: { opacity: 1 },
//                         hidden: { opacity: 0 },
//                       }}
//                       transition={{ duration: 0.8 }}
//                       draggable={false}
//                     />
//                     {/* Gradient overlay (no pointer events so can't block hover) */}
//                     <div
//                       className="
//                         absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
//                         opacity-100 md:opacity-0 md:group-hover:opacity-80
//                         transition-opacity duration-200 pointer-events-none
//                         rounded
//                       "
//                     ></div>
//                     {/* View Gallery Icon (pointer events enabled so keeps hover) */}
//                     <div
//                       className="
//                         absolute inset-x-0 bottom-4 flex justify-center
//                         opacity-100 md:opacity-0 md:group-hover:opacity-100
//                         transition-opacity duration-200
//                         pointer-events-auto z-20
//                       "
//                     >
//                       <span className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md pointer-events-auto select-none z-20">
//                         <EyeIcon className="w-5 h-5" />
//                         View Gallery
//                       </span>
//                     </div>
//                   </div>
//                 </SwiperSlide>
//               ))}
//             </Swiper>
//           </div>
//           {/* text */}
//           <motion.div
//             className="w-full lg:w-1/2 lg:pl-8"
//             initial="hidden"
//             animate={controls}
//             variants={{
//               visible: { opacity: 1, x: 0 },
//               hidden: { opacity: 0, x: 50 },
//             }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             <p className="mb-4 text-gray-600">
//               We are a restoration and repairs company dedicated to providing
//               top‑notch services. Our experienced team restores your home to its
//               former glory—specialising in water, fire, and mold damage plus
//               general repairs.
//             </p>
//             <p className="text-gray-600">
//               Customers are never just a claim number. We handle every project
//               with empathy, easing the stress of families in peril.
//             </p>
//           </motion.div>
//         </div>
//         <div className="flex flex-col items-center justify-center lg:flex-row lg:space-x-8">
//           {/* Mission */}
//           <motion.div
//             className="flex w-full flex-col items-center lg:w-1/2"
//             initial="hidden"
//             animate={controls}
//             variants={{
//               visible: { opacity: 1, y: 0 },
//               hidden: { opacity: 0, y: 50 },
//             }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//           >
//             <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
//               <div className="absolute -top-8 mb-4 h-40 w-40">
//                 <img
//                   src={MissionImage.src}
//                   alt="Mission"
//                   className="h-full w-full rounded-full border-4 border-red-600 object-cover"
//                 />
//               </div>
//               <div className="mt-16 text-center">
//                 <h3 className="mb-2 text-xl font-semibold">Our Mission</h3>
//                 <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
//                   To provide the best experience for our customers in insurance
//                   claims and construction‑related services, constantly improving
//                   for customers, associates, and community.
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//           {/* Vision */}
//           <motion.div
//             className="mt-12 flex w-full flex-col items-center lg:mt-6 lg:w-1/2"
//             initial="hidden"
//             animate={controls}
//             variants={{
//               visible: { opacity: 1, y: 0 },
//               hidden: { opacity: 0, y: 50 },
//             }}
//             transition={{ duration: 0.5, delay: 0.6 }}
//           >
//             <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
//               <div className="absolute -top-8 mb-4 h-40 w-40">
//                 <img
//                   src={VisionImage.src}
//                   alt="Vision"
//                   className="h-full w-full rounded-full border-4 border-red-600 object-cover"
//                 />
//               </div>
//               <div className="mt-16 text-center">
//                 <h3 className="mb-2 text-xl font-semibold">Our Vision</h3>
//                 <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
//                   To be the leading restoration company known for innovation,
//                   reliability, and excellence—setting new standards for the
//                   industry.
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Autoplay } from "swiper/modules";
import { EyeIcon, MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useLightbox } from "@/app/context/LightboxProvider";
import MissionImage from "@/app/images/mission.jpg";
import VisionImage from "@/app/images/vision.jpg";

// --- Company "birthdate" for dynamic counter ---
const COMPANY_BIRTHDATE = new Date("2015-12-15T00:00:00Z");

const aboutImages = [
  "/images/About/image (1).jpg",
  "/images/About/image (2).jpg",
  "/images/About/image (3).jpg",
  "/images/About/image (4).jpg",
  "/images/About/image (5).JPG",
  "/images/About/image (6).JPG",
  "/images/About/image (7).JPG",
  "/images/About/image (8).JPG",
  "/images/About/image (9).JPG",
  "/images/About/image (10).jpg",
  "/images/About/image (11).jpg",
  "/images/About/image (12).jpg",
  "/images/About/image (13).jpg",
  "/images/About/image (14).jpg",
  "/images/About/image (15).jpg",
  "/images/About/image (16).jpg",
  "/images/About/image (17).jpg",
  "/images/About/image (18).jpg",
  "/images/About/image (19).jpg",
];

// --- Certification images (use bigger, lightboxable cards) ---
const certifications = [
  { src: "/images/Certifications/bbb-accredited.png", alt: "BBB Accredited" },
  { src: "/images/Certifications/1000claims.png", alt: "1000 Claims Certified" },
];

// Location stuff
const LOCATION_URL = "https://maps.app.goo.gl/cEr3uFjKEuKyhNdm9";
const LOCATION_TEXT = "Unit 108 - 11539 136 Street, Surrey, BC";

// Years Counter (integer, increments every Dec 15)
function YearsInBusiness() {
  const [years, setYears] = useState(0);
  const target = useRef(0);

  useEffect(() => {
    const now = new Date();
    let diff = now.getFullYear() - COMPANY_BIRTHDATE.getFullYear();
    const anniv = new Date(now.getFullYear(), COMPANY_BIRTHDATE.getMonth(), COMPANY_BIRTHDATE.getDate());
    if (now < anniv) diff -= 1;
    target.current = diff;
    let frame: number;
    let start: number;
    function animate(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 900, 1);
      setYears(Math.floor(progress * target.current));
      if (progress < 1) frame = requestAnimationFrame(animate);
      else setYears(target.current);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, filter: "blur(6px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0)" }}
      transition={{ duration: 1.0, type: "spring", bounce: 0.32 }}
      className="flex flex-col items-center justify-center mb-12"
    >
      <div
        className="
          relative flex items-center justify-center
          bg-gradient-to-br from-[#222b5a] via-[#684bb1] to-[#ffe066]
          rounded-full shadow-2xl border-4 border-white
          px-12 py-7 md:px-20 md:py-12
          text-[2.7rem] md:text-[4.5rem] xl:text-[6rem]
          font-extrabold text-white tracking-tight
          select-none z-10
          animate-glow-border-royal
        "
        style={{
          letterSpacing: "0.04em",
          textShadow: "0 8px 36px #684bb1bb, 0 2px 12px #000000b3, 0 1px 0 #fff",
        }}
      >
        <span>{years}</span>
        <span className="ml-4 text-3xl md:text-4xl xl:text-5xl font-bold drop-shadow">
          YEARS
        </span>
        {/* Royalty sparkles */}
        <span className="absolute top-2 left-8 md:left-16 animate-twinkle text-[#ffe066] text-4xl md:text-5xl select-none">
          ✨
        </span>
        <span className="absolute bottom-4 right-8 md:right-16 animate-spin-slow text-white text-3xl">
          ❂
        </span>
        <span className="absolute top-4 right-5 animate-bounce text-[#e2c275] text-2xl">
          ★
        </span>
      </div>
      <span className="mt-4 text-white text-lg md:text-xl tracking-wide font-semibold drop-shadow-sm">
        In Business Since <span className="font-bold">2015</span>
      </span>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.22); }
        }
        .animate-twinkle { animation: twinkle 2s infinite; }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        @keyframes glow-border-royal {
          0%, 100% { box-shadow: 0 0 60px 12px #684bb1bb, 0 0 36px 7px #ffe066cc, 0 0 0 0 #fff0; }
          45% { box-shadow: 0 0 80px 14px #222b5abb, 0 0 30px 5px #ffe066dd; }
          75% { box-shadow: 0 0 96px 14px #ffe066bb, 0 0 20px 4px #684bb1cc, 0 0 0 0 #fff0; }
        }
        .animate-glow-border-royal { animation: glow-border-royal 4.8s infinite alternate; }
      `}</style>
    </motion.div>
  );
}

export default function AboutSection() {
  const { open } = useLightbox();
  const { ref, inView } = useInView({ threshold: 0.18, triggerOnce: true });
  const controls = useAnimation();

  // For lightbox support of certs, flatten image array
  const certImgs = certifications.map((c) => c.src);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <section ref={ref} className="bg-gray-800 py-12 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* --- HERO/INTRO --- */}
        <motion.h2
          className="mb-8 text-center text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: -64 },
          }}
          transition={{ duration: 0.66 }}
        >
          About Us
        </motion.h2>

        {/* --- YEARS IN BUSINESS COUNTER --- */}
        <YearsInBusiness />

        {/* --- Main Gallery & About Text --- */}
        <motion.div
          className="relative flex flex-col lg:flex-row items-center rounded-3xl bg-white shadow-2xl ring-1 ring-white/20 px-4 py-8 md:px-8 md:py-10 mb-14"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 32 },
          }}
          transition={{ duration: 0.6, delay: 0.13 }}
        >
          {/* GALLERY (LEFT) */}
          <div className="relative w-full lg:w-[45%] mb-8 lg:mb-0 lg:mr-10">
            <Swiper
              effect="fade"
              autoplay={{ delay: 2400, disableOnInteraction: false }}
              loop
              navigation={false}
              modules={[EffectFade, Navigation, Autoplay]}
              className="rounded-xl h-64 md:h-72 w-full shadow-lg"
            >
              {aboutImages.map((src, i) => (
                <SwiperSlide key={src}>
                  <div
                    className="relative group h-64 md:h-72 w-full select-none rounded-xl cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label={`Open gallery for About images`}
                    onClick={() => open(aboutImages, i)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") open(aboutImages, i);
                    }}
                  >
                    <motion.img
                      src={src}
                      alt={`About image ${i + 1}`}
                      className="h-64 md:h-72 w-full object-cover rounded-xl transition-transform group-hover:scale-105 duration-300"
                      initial={{ opacity: 0 }}
                      animate={controls}
                      variants={{
                        visible: { opacity: 1 },
                        hidden: { opacity: 0 },
                      }}
                      transition={{ duration: 0.8 }}
                      draggable={false}
                    />
                    {/* Gradient overlay */}
                    <div className="
                      absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 to-transparent
                      opacity-100 md:opacity-0 md:group-hover:opacity-80
                      transition-opacity duration-200 pointer-events-none
                    " />
                    {/* View Gallery */}
                    <div className="
                      absolute inset-x-0 bottom-4 flex justify-center
                      opacity-100 md:opacity-0 md:group-hover:opacity-100
                      transition-opacity duration-200 pointer-events-auto z-20
                    ">
                      <span className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full text-white text-sm font-medium shadow-md pointer-events-auto select-none z-20">
                        <EyeIcon className="w-5 h-5" />
                        View Gallery
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* ABOUT TEXT (RIGHT) */}
          <div className="w-full lg:w-[55%] lg:pl-2">
            <motion.div
              initial="hidden"
              animate={controls}
              variants={{
                visible: { opacity: 1, x: 0 },
                hidden: { opacity: 0, x: 60 },
              }}
              transition={{ duration: 0.6, delay: 0.14 }}
              className="text-center lg:text-left"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Who We Are</h3>
              <p className="mb-3 text-gray-700 text-lg leading-relaxed">
                We are a restoration and repairs company dedicated to providing top‑notch service. 
                Our experienced team restores your home to its former glory—specializing in water, fire, and mold damage as well as general repairs.
              </p>
              <p className="text-gray-700 text-base leading-relaxed">
                Customers are never just a claim number. We handle every project with empathy, easing the stress of families in peril. 
                From emergency restoration to finishing touches, your peace of mind is our mission.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* --- MISSION & VISION --- */}
        <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-10 mb-14">
          {/* Mission */}
          <motion.div
            className="flex-1 w-full flex justify-center"
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 40 },
            }}
            transition={{ duration: 0.7, delay: 0.20 }}
          >
            <div className="relative flex flex-col items-center rounded-2xl bg-white p-6 pt-14 shadow-lg ring-1 ring-white/20 min-h-[240px] max-w-[420px] w-full">
              <div className="absolute -top-10 h-20 w-20 md:h-24 md:w-24">
                <img
                  src={MissionImage.src}
                  alt="Mission"
                  className="h-full w-full rounded-full border-4 border-red-600 object-cover shadow-lg"
                />
              </div>
              <div className="mt-10 text-center">
                <h3 className="mb-1 text-xl font-bold text-gray-900">Our Mission</h3>
                <p className="text-gray-700 px-2 sm:px-4 text-base md:text-lg">
                  To provide the best experience for our customers in insurance claims and construction‑related services, 
                  constantly improving for customers, associates, and the community.
                </p>
              </div>
            </div>
          </motion.div>
          {/* Vision */}
          <motion.div
            className="flex-1 w-full flex justify-center"
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 40 },
            }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <div className="relative flex flex-col items-center rounded-2xl bg-white p-6 pt-14 shadow-lg ring-1 ring-white/20 min-h-[240px] max-w-[420px] w-full">
              <div className="absolute -top-10 h-20 w-20 md:h-24 md:w-24">
                <img
                  src={VisionImage.src}
                  alt="Vision"
                  className="h-full w-full rounded-full border-4 border-red-600 object-cover shadow-lg"
                />
              </div>
              <div className="mt-10 text-center">
                <h3 className="mb-1 text-xl font-bold text-gray-900">Our Vision</h3>
                <p className="text-gray-700 px-2 sm:px-4 text-base md:text-lg">
                  To be the leading restoration company known for innovation, reliability, and excellence—setting new standards for the industry.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- CERTIFICATIONS/LOGOS (Bigger + Lightbox) --- */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.6, delay: 0.33 }}
          className="mb-16 relative"
        >
          <h3 className="text-center text-2xl md:text-3xl font-semibold text-white mb-7 tracking-wide drop-shadow-lg">
            <span className="relative inline-block">
              Our Certifications & Accreditations
              <span className="absolute -top-2 -right-6 animate-twinkle text-yellow-200 text-2xl md:text-3xl select-none">✨</span>
              <span className="absolute top-3 left-[-2.6rem] animate-spin-slow text-cyan-300 text-lg md:text-2xl select-none">❂</span>
            </span>
          </h3>
          <div className="flex flex-wrap justify-center gap-10">
            {certifications.map((cert, idx) => (
              <motion.div
                key={cert.src}
                className={`
                  bg-white rounded-2xl shadow-2xl p-7
                  flex flex-col items-center justify-center
                  min-h-[160px] min-w-[210px] 
                  max-h-[230px] max-w-[340px]
                  transition-transform hover:scale-105 border border-white/30 relative
                  cursor-pointer group
                  outline-none focus:ring-4 focus:ring-cyan-400
                `}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.18 * idx }}
                tabIndex={0}
                role="button"
                aria-label={`View enlarged ${cert.alt}`}
                onClick={() => open(certImgs, idx)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") open(certImgs, idx);
                }}
              >
                {/* Rotating sparkle around logo */}
                <span className="absolute -top-3 left-4 animate-spin-slow2 text-pink-300 text-3xl select-none">✸</span>
                <img
                  src={cert.src}
                  alt={cert.alt}
                  className={`
                    object-contain
                    max-h-[120px] md:max-h-[180px] max-w-[260px] w-auto h-auto
                    drop-shadow-xl
                    transition-all duration-300 group-hover:scale-105
                  `}
                  loading="lazy"
                  draggable={false}
                />
                <span className="absolute bottom-3 right-5 animate-twinkle text-yellow-400 text-2xl select-none">★</span>
                {/* Overlay for hover/active */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity bg-cyan-300" />
                {/* View icon when hovered/focused */}
                <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-20 pointer-events-none">
                  <span className="flex items-center gap-2 bg-black/70 px-4 py-1 rounded-full text-white text-base font-semibold shadow-lg select-none">
                    <EyeIcon className="w-6 h-6" />
                    View Larger
                  </span>
                </div>
                <style>{`
                  @keyframes spin-slow2 { 100% { transform: rotate(-360deg); } }
                  .animate-spin-slow2 { animation: spin-slow2 14s linear infinite; }
                `}</style>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* --- MAP/LOCATION --- */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 60 },
          }}
          transition={{ duration: 0.7, delay: 0.41 }}
        >
          <h3 className="text-center text-2xl md:text-3xl font-semibold text-white mb-5 drop-shadow-lg">
            Find Us
          </h3>
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6">
            <div className="w-full md:w-2/3 lg:w-1/2 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white mx-auto">
              <iframe
                title="ActFast Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2600.8369554033364!2d-122.85340328442359!3d49.20775827932414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5485d835f401d47b%3A0x9447e47f4f9a7b28!2sUnit%20108%20-%2011539%20136%20St%2C%20Surrey%2C%20BC!5e0!3m2!1sen!2sca!4v1657834328830!5m2!1sen!2sca"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-64"
              />
            </div>
            <div className="flex flex-col items-center md:items-start">
              <a
                href={LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-cyan-200 hover:underline text-lg md:text-xl"
              >
                <MapPinIcon className="h-6 w-6 text-red-600" />
                <span className="text-white font-bold">{LOCATION_TEXT}</span>
                <ArrowRightIcon className="h-5 w-5 text-cyan-300" />
              </a>
              <p className="mt-2 text-gray-200">Open by appointment or during regular business hours.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
