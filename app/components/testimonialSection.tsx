"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import axios from "axios";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

/** Shape of a single testimonial for your UI. */
interface Testimonial {
  name: string;      // e.g. "Jane Doe"
  feedback: string;  // the review text
  image: string;     // a photo URL
  rating: number;    // star rating
}

/** The rating star component props. */
interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex justify-center mb-4">
      {Array(fullStars)
        .fill(0)
        .map((_, index) => (
          <svg
            key={`full-${index}`}
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z" />
          </svg>
        ))}
      {halfStar && (
        <svg
          className="w-4 h-4 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z" />
        </svg>
      )}
      {Array(emptyStars)
        .fill(0)
        .map((_, index) => (
          <svg
            key={`empty-${index}`}
            className="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z" />
          </svg>
        ))}
    </div>
  );
};

interface TruncatedTextProps {
  text: string;
  maxLength: number;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength }) => {
  const [isTruncated, setIsTruncated] = useState(true);

  const toggleTruncate = () => {
    setIsTruncated(!isTruncated);
  };

  return (
    <div className="text-xl font-semibold mb-4 overflow-auto break-words">
      {isTruncated ? (
        <>
          {text.slice(0, maxLength)}...
          <span className="text-blue-500 cursor-pointer ml-1" onClick={toggleTruncate}>
            Read more
          </span>
        </>
      ) : (
        <>
          {text}
          <span className="text-blue-500 cursor-pointer ml-1" onClick={toggleTruncate}>
            Show less
          </span>
        </>
      )}
    </div>
  );
};

/** Data shape returned by /api/getPlaceDetails (or /api/testimonials). */
interface PlaceReviewData {
  author: string;
  text: string;
  rating: number;
  photoUrl: string;
  publishedAt: string;
}

interface PlaceDetailsData {
  resourceName: string;
  name: string;
  address: string;
  rating: number;
  totalRatings: number;
  reviews: PlaceReviewData[];
}

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const controls = useAnimation();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Example: If your new route is /api/getPlaceDetails:
        // const { data } = await axios.get<PlaceDetailsData>("/api/getPlaceDetails");
        // For demonstration, we keep using "/api/testimonials".
        const response = await axios.get<PlaceDetailsData>("/api/testimonials");
        const data = response.data;

        // Convert the PlaceDetailsData.reviews into the local Testimonial structure
        const mappedTestimonials = data.reviews.map((review) => ({
          name: review.author,
          feedback: review.text,
          rating: review.rating,
          // Provide a fallback so there's never an empty string.
          // But we also handle broken links in the <img onError> below.
          image: review.photoUrl || "/images/blank-profile.jpg",
        }));

        setTestimonials(mappedTestimonials);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <section className="py-12 bg-gray-800" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold text-center text-white mb-8"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: -50 },
          }}
          transition={{ duration: 0.5 }}
        >
          Testimonials
        </motion.h2>

        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          loop={true}
          breakpoints={{
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
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: true,
          }}
          pagination={false}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="mySwiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="bg-white p-6 shadow-2xl rounded text-center max-w-md mx-auto overflow-auto"
                initial="hidden"
                animate={controls}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 50 },
                }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                  /* If the URL is broken/invalid, fallback to a default */
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/blank-profile.jpg";
                  }}
                />
                <StarRating rating={testimonial.rating} />
                <TruncatedText text={testimonial.feedback} maxLength={100} />
                <p className="text-gray-600">- {testimonial.name}</p>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;
