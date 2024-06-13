"use client";

import React, { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EffectFlip, Pagination, Navigation } from "swiper/modules";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const services = [
  {
    title: "Water Damage Restoration",
    description: "Quick and efficient water damage repair services.",
    images: [
      "/images/WaterDamage/image1.jpg",
      "/images/WaterDamage/image2.jpg",
      "/images/WaterDamage/image3.jpg",
      "/images/WaterDamage/image4.jpg",
    ],
  },
  {
    title: "Fire Damage Restoration",
    description: "Comprehensive fire damage restoration and cleanup.",
    images: [
      "/images/FireDamage/image1.jpg",
      "/images/FireDamage/image2.jpg",
      "/images/FireDamage/image3.jpg",
      "/images/FireDamage/image4.jpg",
    ],
  },
  {
    title: "Mold Remediation",
    description: "Safe and effective mold removal services.",
    images: [
      "/images/MoldRemediation/image1.jpg",
      "/images/MoldRemediation/image2.jpg",
      "/images/MoldRemediation/image3.jpg",
      "/images/MoldRemediation/image4.jpg",
    ],
  },
  {
    title: "General Repairs",
    description: "Quality repairs for all parts of your home.",
    images: [
      "/images/GeneralRepairs/image1.jpg",
      "/images/GeneralRepairs/image2.jpg",
      "/images/GeneralRepairs/image3.jpg",
      "/images/GeneralRepairs/image4.jpg",
    ],
  },
];

const ServicesSection = () => {
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

  return (
    <section className="bg-gray-800 py-12" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-8 text-center text-5xl font-bold text-white"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: -50 },
          }}
          transition={{ duration: 0.5 }}
        >
          Our Services
        </motion.h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="rounded bg-white p-6 text-center shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial="hidden"
              animate={controls}
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 50 },
              }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Swiper
                effect={"flip"}
                grabCursor={true}
                pagination={false}
                navigation={true}
                modules={[EffectFlip, Pagination, Navigation]}
                className="mySwiper mb-4"
              >
                {service.images.map((image, imgIndex) => (
                  <SwiperSlide key={imgIndex}>
                    <img
                      src={image}
                      alt={`Slide ${imgIndex + 1}`}
                      className="h-64 w-full rounded object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
