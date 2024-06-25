"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

import facebookIcon from "@/app/images/facebookIcon.png";
import instagramIcon from "@/app/images/instagramIcon.png";
import AFlogo from "@/app/images/actfast-logo.jpg";

const Footer: React.FC = () => {
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
    <footer className="bg-gray-800 py-8 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          className="mb-4 flex flex-row justify-center space-x-4 md:space-x-8"
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5 }}
        >
          <Link href="#" className="hover:underline">
            Home
          </Link>
          <Link href="/under-construction" className="hover:underline">
            Services
          </Link>
          <Link href="/under-construction" className="hover:underline">
            Featured
          </Link>
          <Link href="/teampage" className="hover:underline">
            Team
          </Link>
        </motion.div>
        <motion.img
          src={AFlogo.src}
          className="mx-auto mb-4 h-12 w-auto bg-gray-500"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, scale: 1 },
            hidden: { opacity: 0, scale: 0.8 },
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.div
          className="mb-4"
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p>Unit 108 - 11539 136 St.</p>
          <p>Surrey, BC V3R 0G3, CA</p>
          <p>+1-604-518-5129</p>
          <p>
            <a href="mailto:info@actfast.ca" className="hover:underline">
              info@actfast.ca
            </a>
          </p>
          <div className="mt-2 flex flex-col items-center justify-center space-y-2 md:flex-row md:space-x-4 md:space-y-0">
            <Link
              href="https://www.facebook.com/ActFASTVancouver/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:underline"
            >
              <img
                src={facebookIcon.src}
                alt="Facebook"
                className="mr-2 h-6 w-6"
              />
              Facebook
            </Link>
            <Link
              href="https://www.instagram.com/actfastvancouver/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:underline"
            >
              <img
                src={instagramIcon.src}
                alt="Instagram"
                className="mr-2 h-6 w-6"
              />
              Instagram
            </Link>
          </div>
        </motion.div>
        <motion.p
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          &copy; {new Date().getFullYear()} Restoration & Repairs. All rights
          reserved.
        </motion.p>
      </div>
    </footer>
  );
};

export default Footer;
