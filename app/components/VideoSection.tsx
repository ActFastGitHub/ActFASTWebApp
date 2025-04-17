"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface VideoItem {
  title: string;
  embedUrl: string;
}

interface VideoCarouselSectionProps {
  videos: VideoItem[];
}

const VideoCarouselSection: React.FC<VideoCarouselSectionProps> = ({ videos }) => {
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Video Gallery
        </motion.h2>

        <Swiper
          grabCursor={true}
          spaceBetween={30}
          navigation
          pagination={{ clickable: true }}
          modules={[Pagination, Navigation]}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="max-w-7xl mx-auto"
        >
          {videos.map((video, index) => (
            <SwiperSlide key={index}>
              <div className="space-y-4">
                <h3 className="text-xl text-center font-semibold">{video.title}</h3>
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-gray-700">
                  <iframe
                    className="w-full h-full"
                    src={video.embedUrl}
                    title={`YouTube video: ${video.title}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default VideoCarouselSection;
