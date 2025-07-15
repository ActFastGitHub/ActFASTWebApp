"use client";

import React from "react";
import { motion } from "framer-motion";

/* ----------------------------- types ----------------------------- */
export interface VideoItem {
  title: string;
  embedUrl: string;
}

export interface VideoCarouselSectionProps {
  videos: VideoItem[];
}

/* --------------------------- component --------------------------- */
const VideoCarouselSection: React.FC<VideoCarouselSectionProps> = ({
  videos,
}) => {
  const single = videos.length === 1;

  return (
    <section className="bg-gray-900 py-12 text-white">
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-12 text-center text-4xl font-bold md:text-5xl"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Video Gallery
        </motion.h2>

        {/* grid lays videos “on top of each other” then breaks into columns */}
        <div
          className={
            single
              ? "flex flex-col items-center"
              : "grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3"
          }
        >
          {videos.map(({ title, embedUrl }, idx) => (
            <article
              key={idx}
              className={
                single ? "w-full max-w-4xl space-y-4" : "w-full space-y-4"
              }
            >
              <h3 className="text-center text-xl font-semibold">{title}</h3>

              <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-700 shadow-lg">
                <iframe
                  className="h-full w-full"
                  /* vq=hd1080 hints highest quality; YouTube will drop down if bandwidth is poor */
                  src={`${embedUrl}?rel=0&playsinline=1&vq=hd1080`}
                  title={`YouTube video: ${title}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoCarouselSection;
