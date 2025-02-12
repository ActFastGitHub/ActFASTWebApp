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
    if (inView) controls.start("visible");
    else controls.start("hidden");
  }, [controls, inView]);

  // Merge the before/after images into a single array
  const combinedImages = beforeImages.flatMap((beforeImage, index) => [
    { src: beforeImage, label: "Before" },
    { src: afterImages[index], label: "After" },
  ]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-6">
        {/* Title */}
        <motion.h2
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4 text-center text-3xl font-bold text-black"
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 text-center text-lg text-black"
        >
          {description}
        </motion.p>

        {/* Swiper Carousel */}
        <Swiper
          effect="fade"
          fadeEffect={{ crossFade: true }}
          navigation
          pagination={{ clickable: true }}
          loop
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          slidesPerView={1}
          modules={[EffectFade, Navigation, Pagination, Autoplay]}
          className="w-full"
        >
          {combinedImages.map((image, idx) => (
            <SwiperSlide key={idx}>
              {/* 
                Responsive fixed-height container
                - h-64 on small devices (256px)
                - h-80 on sm screens (~320px)
                - h-96 on md screens (~384px)
                - h-[500px] on lg screens (500px)
              */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-white flex items-center justify-center overflow-hidden rounded">
                <img
                  src={image.src}
                  alt={`${title} ${image.label} ${idx + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                {/* Label in top-left corner */}
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
