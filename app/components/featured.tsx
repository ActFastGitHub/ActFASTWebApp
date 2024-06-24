"use client";

import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FeaturedProjectProps {
  title: string;
  description: string;
  beforeImages: string[];
  afterImages: string[];
}

const FeaturedProject: React.FC<FeaturedProjectProps> = ({
  title,
  description,
  beforeImages,
  afterImages,
}) => {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    controls.start(inView ? "visible" : "hidden");
  }, [controls, inView]);

  const combinedImages = beforeImages.flatMap((beforeImage, index) => [
    { src: beforeImage, label: "Before" },
    { src: afterImages[index], label: "After" },
  ]);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden"
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.5 }}
      ref={ref}
    >
      <div className="p-6">
        <motion.h2
          className="mb-4 text-center text-3xl font-bold text-black"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mb-6 text-center text-lg text-black"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {description}
        </motion.p>
        <Swiper
          effect="fade"
          navigation
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          slidesPerView={1}
          className="w-full"
          modules={[EffectFade, Navigation, Pagination, Autoplay]}
        >
          {combinedImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative flex w-full items-center justify-center"
                style={{ height: "500px" }}
              >
                <motion.img
                  src={image.src}
                  alt={`${title} ${image.label} ${index + 1}`}
                  className="h-full w-full object-cover rounded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />
                <span className="absolute left-2 top-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm text-white">
                  {image.label}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </motion.div>
  );
};

export default FeaturedProject;

