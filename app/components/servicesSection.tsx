// "use client";

// import React, { useEffect } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/effect-flip";
// import "swiper/css/pagination";
// import "swiper/css/navigation";
// import { EffectFlip, Pagination, Navigation } from "swiper/modules";
// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// const services = [
//   {
//     title: "Water Damage Restoration",
//     description: "Quick and efficient water damage repair services.",
//     images: [
//       "/images/WaterDamage/image1.jpg",
//       "/images/WaterDamage/image2.jpg",
//       "/images/WaterDamage/image3.jpg",
//       "/images/WaterDamage/image4.jpg",
//     ],
//   },
//   {
//     title: "Fire Damage Restoration",
//     description: "Comprehensive fire damage restoration and cleanup.",
//     images: [
//       "/images/FireDamage/image1.jpg",
//       "/images/FireDamage/image2.jpg",
//       "/images/FireDamage/image3.jpg",
//       "/images/FireDamage/image4.jpg",
//     ],
//   },
//   {
//     title: "Mold Remediation",
//     description: "Safe and effective mold removal services.",
//     images: [
//       "/images/MoldRemediation/image1.jpg",
//       "/images/MoldRemediation/image2.jpg",
//       "/images/MoldRemediation/image3.jpg",
//       "/images/MoldRemediation/image4.jpg",
//     ],
//   },
//   {
//     title: "General Repairs",
//     description: "Quality repairs for all parts of your home.",
//     images: [
//       "/images/GeneralRepairs/image1.jpg",
//       "/images/GeneralRepairs/image2.jpg",
//       "/images/GeneralRepairs/image3.jpg",
//       "/images/GeneralRepairs/image4.jpg",
//     ],
//   },
//   {
//     title: "Contents Restoration",
//     description:
//       "We safely store, clean, and restore your belongings with expert handling, ensuring a seamless process from pack-out to pack-back, including insurance coordination.",
//     images: [
//       "/images/ContentsRestoration/image1.jpg",
//       "/images/ContentsRestoration/image2.jpg",
//       "/images/ContentsRestoration/image3.jpg",
//       "/images/ContentsRestoration/image4.jpg",
//     ],
//   },
// ];

// const ServicesSection = () => {
//   const { ref, inView } = useInView({
//     triggerOnce: false,
//     threshold: 0.2,
//   });

//   const controls = useAnimation();

//   useEffect(() => {
//     if (inView) {
//       controls.start("visible");
//     } else {
//       controls.start("hidden");
//     }
//   }, [controls, inView]);

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
//           Our Services
//         </motion.h2>

//         {/* Main Swiper for horizontal scrolling of the 5 service cards */}
//         <Swiper
//           // Adjust these values as you prefer
//           spaceBetween={30}
//           slidesPerView={1}
//           navigation
//           pagination={{ clickable: true }}
//           modules={[Pagination, Navigation]}
//           breakpoints={{
//             640: { slidesPerView: 1 },
//             768: { slidesPerView: 2 },
//             1024: { slidesPerView: 3 },
//             1280: { slidesPerView: 4 },
//           }}
//           className="servicesSwiper"
//         >
//           {services.map((service, index) => (
//             <SwiperSlide key={index}>
//               <motion.div
//                 className="mx-auto max-w-xs rounded bg-white p-6 text-center shadow-2xl"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 initial="hidden"
//                 animate={controls}
//                 variants={{
//                   visible: { opacity: 1, y: 0 },
//                   hidden: { opacity: 0, y: 50 },
//                 }}
//                 transition={{ duration: 0.5, delay: index * 0.2 }}
//               >
//                 {/* Nested Swiper for flipping through images of the current service */}
//                 <Swiper
//                   effect="flip"
//                   grabCursor={true}
//                   navigation
//                   pagination={false}
//                   modules={[EffectFlip, Pagination, Navigation]}
//                   className="mySwiper mb-4"
//                 >
//                   {service.images.map((image, imgIndex) => (
//                     <SwiperSlide key={imgIndex}>
//                       <img
//                         src={image}
//                         alt={`Slide ${imgIndex + 1}`}
//                         className="h-64 w-full rounded object-cover"
//                       />
//                     </SwiperSlide>
//                   ))}
//                 </Swiper>
//                 <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
//                 <p className="text-gray-600">{service.description}</p>
//               </motion.div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </section>
//   );
// };

// export default ServicesSection;

"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EffectFlip, Pagination, Navigation } from "swiper/modules";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ---------- service list (folder-only, no image counts) ---------- */
type Service = { title: string; description: string; folder: string };

const services: readonly Service[] = [
  {
    title: "Water Damage Restoration",
    description:
      "Rapid extraction, structural drying, and full repairs after a flood.",
    folder: "WaterDamage",
  },
  {
    title: "Fire Damage Restoration",
    description:
      "Soot removal, odor elimination, and complete rebuild after fire loss.",
    folder: "FireDamage",
  },
  {
    title: "Mold Remediation",
    description:
      "Certified inspection, containment, and safe removal of mold colonies.",
    folder: "MoldRemediation",
  },
  {
    title: "Asbestos Abatement",
    description:
      "Licensed testing and removal to keep your home free of asbestos hazards.",
    folder: "AsbestosAbatement",
  },
  {
    title: "General Repairs",
    description:
      "Skilled carpentry, drywall, and finishing to restore any part of your home.",
    folder: "GeneralRepairs",
  },
  {
    title: "Contents Restoration",
    description:
      "Pack-out, specialist cleaning, storage, and insurance coordination.",
    folder: "ContentsRestoration",
  },
];

export default function ServicesSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const controls = useAnimation();

  /* ---------- dynamic image cache ---------- */
  const [imagesByFolder, setImagesByFolder] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    controls.start(inView ? "visible" : "hidden");
  }, [inView, controls]);

  /* fetch images once (build-time safe & client-side only) */
  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      const entries = await Promise.all(
        services.map(async (svc) => {
          const res = await fetch(`/api/images?folder=${svc.folder}`);
          const list = (await res.json()) as string[];
          return [svc.folder, list] as const;
        }),
      );
      if (!cancelled) {
        setImagesByFolder(Object.fromEntries(entries));
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section ref={ref} className="bg-gray-800 py-12">
      <div className="container mx-auto px-4">
        <motion.h2
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: -50 },
          }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-5xl font-bold text-white"
        >
          Our Services
        </motion.h2>

        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          modules={[Pagination, Navigation]}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {services.map((svc, idx) => {
            const images = imagesByFolder[svc.folder] ?? []; // may be empty while loading
            return (
              <SwiperSlide key={svc.title}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial="hidden"
                  animate={controls}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 50 },
                  }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="mx-auto max-w-xs rounded bg-white p-6 text-center shadow-2xl"
                >
                  {/* flip-swiper only shows when images loaded; fallback text otherwise */}
                  {images.length ? (
                    <Swiper
                      effect="flip"
                      grabCursor
                      navigation
                      pagination={false}
                      modules={[EffectFlip, Navigation]}
                      className="mySwiper mb-4"
                    >
                      {images.map((src) => (
                        <SwiperSlide key={src}>
                          <img
                            src={src}
                            alt={svc.title}
                            className="h-64 w-full rounded object-cover object-center" 
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="mb-4 flex h-64 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                      Loading…
                    </div>
                  )}

                  <h3 className="mb-2 text-xl font-semibold">{svc.title}</h3>
                  <p className="text-gray-600">{svc.description}</p>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
