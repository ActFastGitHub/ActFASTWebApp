"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import { Fade } from "react-awesome-reveal";

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
  const combinedImages = beforeImages.reduce(
    (acc, beforeImage, index) => {
      acc.push({ src: beforeImage, label: "Before" });
      if (afterImages[index]) {
        acc.push({ src: afterImages[index], label: "After" });
      }
      return acc;
    },
    [] as { src: string; label: string }[],
  );

  return (
    <div className="bg-gray-800 py-12">
      <div className="container mx-auto px-4">
        <Fade triggerOnce>
          <motion.h2
            className="mb-8 text-center text-5xl font-bold text-white"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="mb-8 text-center text-xl text-gray-300"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {description}
          </motion.p>
          <div className="relative mb-12 flex flex-col items-center rounded-lg bg-gray-100 p-6 shadow-2xl">
            <Swiper
              effect={"fade"}
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
                    className="relative flex w-full items-center justify-center bg-gray-200"
                    style={{ height: "500px" }}
                  >
                    <motion.img
                      src={image.src}
                      alt={`${title} ${image.label} ${index + 1}`}
                      className="max-h-full max-w-full rounded object-contain"
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
        </Fade>
      </div>
    </div>
  );
};

export default FeaturedProject;
