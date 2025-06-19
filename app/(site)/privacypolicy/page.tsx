"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AFLogo from "@/app/images/actfast-logo.jpg";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const PrivacyPolicy = () => {
  return (
    <section className="min-h-screen bg-gray-900 px-6 py-16 font-sans text-white sm:px-12 md:px-24 lg:px-36">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl rounded-lg bg-gray-800 p-8 shadow-lg"
      >
        {/* Logo with clickable link back home */}
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <img
              src={AFLogo.src}
              alt="ActFAST Restoration and Repairs Logo"
              className="h-auto max-w-[200px] cursor-pointer sm:max-w-[250px]"
            />
          </Link>
        </div>

        <h1 className="mb-6 text-center text-3xl font-bold text-red-600">
          Privacy Policy
        </h1>

        <p className="mb-8 text-center italic text-gray-400">
          Effective Date: June 19, 2025
        </p>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Information We Collect
          </h2>
          <p>
            We collect personal information that you voluntarily provide when
            using our <em>Contact Us</em> form, which may include your full
            name, phone number, email address, and message content.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            How We Use Your Information
          </h2>
          <p>
            The information you provide is used solely to respond to your
            inquiry or request. We do not store this information in a database;
            instead, it is sent directly to our designated company email for
            prompt handling.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            How We Protect Your Information
          </h2>
          <p>
            We implement reasonable administrative and technical measures to
            protect your personal data, including securing our website with
            HTTPS encryption and restricting access to email communications to
            authorized personnel only.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Sharing Your Information
          </h2>
          <p>
            We do not sell, rent, or share your personal information with third
            parties except as required by law or to comply with legal processes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Your Rights
          </h2>
          <p>
            You have the right to request access to the personal information we
            have received from you, request corrections, or request that we
            delete your information. To exercise these rights, please contact us
            at{" "}
            <a
              href="mailto:info@actfast.ca"
              className="text-red-600 underline hover:text-red-400"
            >
              info@actfast.ca
            </a>
            .
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Cookies and Tracking
          </h2>
          <p>
            Our website does not use cookies or tracking technologies to collect
            personal information beyond what is submitted in the Contact Us
            form.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or legal requirements. We encourage you to
            review this page periodically for updates.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Contact Us
          </h2>
          <address className="space-y-1 not-italic text-gray-300">
            ActFAST Restoration and Repairs
            <br />
            Email:{" "}
            <a
              href="mailto:info@actfast.ca"
              className="text-red-600 underline hover:text-red-400"
            >
              info@actfast.ca
            </a>
            <br />
            Phone: (604) 518-5129
            <br />
            Address: Unit 108 - 11539 136 St. Surrey, BC V3R 0G3, CA
          </address>
        </section>
        {/* Added Go to Home button */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-block rounded bg-red-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Go to Home
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default PrivacyPolicy;
