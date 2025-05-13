"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import axios from "axios";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ---------- helpers ---------- */
interface Testimonial {
  name: string;
  feedback: string;
  image: string;
  rating: number;
}
const Star = ({ className }: { className: string }) => (
  <svg className={`h-4 w-4 ${className}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.251-.541.921-.541 1.172 0l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z" />
  </svg>
);
const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating % 1 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="mb-4 flex justify-center">
      {Array(full).fill(null).map((_, i) => <Star key={`f${i}`} className="text-yellow-400" />)}
      {half === 1 && <Star className="text-yellow-400" />}
      {Array(empty).fill(null).map((_, i) => <Star key={`e${i}`} className="text-gray-400" />)}
    </div>
  );
};
const Trunc = ({ text, max = 100 }: { text: string; max?: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 break-words text-xl font-semibold">
      {open ? text : `${text.slice(0, max)}...`}
      <span className="ml-1 cursor-pointer text-blue-500" onClick={() => setOpen(!open)}>
        {open ? "Show less" : "Read more"}
      </span>
    </div>
  );
};

/* ---------- main component ---------- */
export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/testimonials");
      const mapped: Testimonial[] = (data.reviews || []).map((r: any) => ({
        name: r.author,
        feedback: r.text,
        rating: r.rating,
        image: r.photoUrl || "/images/blank-profile.jpg",
      }));
      setTestimonials(mapped);
    } catch (err) {
      setError("We couldn’t load reviews. Please try again.");
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* first load */
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /* intersection for heading fade-in */
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  /* ---------- empty state ---------- */
  const Empty = () => (
    <div className="mx-auto max-w-md rounded bg-gray-200 p-6 text-center shadow-lg">
      <p className="mb-4 text-gray-700">
        {error ?? "No testimonials right now. Want to refresh?"}
      </p>
      <button
        onClick={fetchReviews}
        className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
      >
        Refresh Testimonials
      </button>
    </div>
  );

  /* ---------- decide what to render ---------- */
  const showSwiper = testimonials.length > 0 && !loading;

  return (
    <section ref={ref} className="bg-gray-800 py-12">
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-8 text-center text-5xl font-bold text-white"
          initial={{ opacity: 0, y: -50 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          Testimonials
        </motion.h2>

        {!showSwiper ? (
          <Empty />
        ) : (
          <Swiper
            /* ⭐ FIX 1: force full re-init whenever list size changes */
            key={testimonials.length}
            modules={
              testimonials.length < 3
                ? [Pagination, Autoplay]
                : [EffectCoverflow, Pagination, Autoplay]
            }
            effect={testimonials.length < 3 ? undefined : "coverflow"}
            coverflowEffect={
              testimonials.length < 3
                ? undefined
                : { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: false }
            }
            grabCursor
            centeredSlides
            slidesPerView={testimonials.length < 2 ? 1 : "auto"}
            loop={testimonials.length >= 3}
            breakpoints={{ 640: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            autoplay={{ delay: 2500, disableOnInteraction: true }}
            pagination={{ clickable: true }}
            className="mySwiper"
          >
            {testimonials.map((t, i) => (
              <SwiperSlide key={i}>
                {/* ⭐ FIX 2: remove opacity 0 initial state */}
                <div className="mx-auto max-w-md rounded bg-white p-6 text-center shadow-2xl">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="mx-auto mb-4 h-16 w-16 rounded-full"
                    onError={(e) =>
                      ((e.currentTarget as HTMLImageElement).src = "/images/blank-profile.jpg")
                    }
                  />
                  <Stars rating={t.rating} />
                  <Trunc text={t.feedback} />
                  <p className="text-gray-600">- {t.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
