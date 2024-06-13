"use client";

import React, { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Manually import images
import AboutImage1 from "@/app/images/ActFAST-Team.jpg";
import AboutImage2 from "@/app/images/ActFAST-Team1.jpg";
import AboutImage3 from "@/app/images/ActFAST-Team2.jpg";
import AboutImage4 from "@/app/images/ActFAST-Team3.jpg";

// Placeholder images for mission and vision
import MissionImage from "@/app/images/mission.jpg";
import VisionImage from "@/app/images/vision.jpg";

// Array of imported images
const aboutImages = [
  AboutImage1,
  AboutImage2,
  AboutImage3,
  AboutImage4,
  // Add more images as needed
];

const AboutSection = () => {
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
          About Us
        </motion.h2>
        <div className="relative mb-12 flex flex-col items-center rounded-lg bg-gray-100 p-6 shadow-2xl lg:flex-row">
          <div className="relative z-0 mb-8 w-full lg:mb-0 lg:w-1/2 lg:pr-8">
            <Swiper
              effect={"fade"}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              navigation={false}
              pagination={false}
              loop={true}
              className="h-64 w-full"
              modules={[EffectFade, Navigation, Autoplay]}
            >
              {aboutImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <motion.img
                    src={image.src}
                    alt={`About Us ${index + 1}`}
                    className="h-64 w-full rounded object-cover"
                    initial={{ opacity: 0 }}
                    animate={controls}
                    variants={{
                      visible: { opacity: 1 },
                      hidden: { opacity: 0 },
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <motion.div
            className="w-full lg:w-1/2 lg:pl-8"
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, x: 0 },
              hidden: { opacity: 0, x: 50 },
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="mb-4 text-gray-600">
              We are a restoration and repairs company dedicated to providing
              top-notch services to our clients. Our team of experienced
              professionals is here to restore your home and bring it back to
              its former glory. We specialize in water damage restoration, fire
              damage restoration, mold remediation, and general repairs.
            </p>
            <p className="text-gray-600">
              We will provide our customer with personalize service and ensure
              that they are not just an assigned number. Our team is dedicated
              to ease the pain and suffering of a family who has been in a
              peril. We are committed towards providing the best service for the
              insured and insurer to ensure that the claims process is done with
              care and empathy.
            </p>
          </motion.div>
        </div>
        <div className="flex flex-col items-center justify-center lg:flex-row lg:space-x-8">
          <motion.div
            className="flex w-full flex-col items-center lg:w-1/2"
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 50 },
            }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
              <div className="absolute -top-8 mb-4 h-40 w-40">
                <img
                  src={MissionImage.src}
                  alt="Mission"
                  className="h-full w-full rounded-full border-4 border-red-600 object-cover"
                />
              </div>
              <div className="mt-16 text-center">
                <h3 className="mb-2 text-xl font-semibold">Our Mission</h3>
                <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
                  To provide the best experience for our customers in insurance
                  claims and construction related services. To continuously
                  improve our company in servicing its obligation to its
                  customers, associates, and community.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="mt-12 flex w-full flex-col items-center lg:mt-6 lg:w-1/2"
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 50 },
            }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
              <div className="absolute -top-8 mb-4 h-40 w-40">
                <img
                  src={VisionImage.src}
                  alt="Vision"
                  className="h-full w-full rounded-full border-4 border-red-600 object-cover"
                />
              </div>
              <div className="mt-16 text-center">
                <h3 className="mb-2 text-xl font-semibold">Our Vision</h3>
                <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
                  To be the leading restoration company known for innovation,
                  reliability, and excellence in service. We strive to exceed
                  expectations and set new standards in the industry.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
