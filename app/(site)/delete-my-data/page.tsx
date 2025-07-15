"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AFLogo from "@/app/images/actfast-logo.jpg";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const DataDeletionInstructions = () => {
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
          Data Deletion Instructions
        </h1>

        <p className="mb-8 text-center italic text-gray-400">
          Effective Date: June 19, 2025
        </p>

        <section className="mb-6">
          <p>
            At ActFAST Restoration and Repairs, we respect your privacy. If you
            have revoked our app’s access or completed your engagement with us
            and wish to permanently delete your personal data from our systems,
            please follow the instructions below.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            How to Request Data Deletion
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Email us</strong> at{' '}
              <a
                href="mailto:info@actfast.ca?subject=Data%20Deletion%20Request"
                className="text-red-600 underline hover:text-red-400"
              >
                info@actfast.ca
              </a>{' '}
              with the subject line <em>“Data Deletion Request”</em>.
            </li>
            <li>
              In your message, please include:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Full name</li>
                <li>Email or phone number used with us</li>
                <li>Any project code or account ID (if available)</li>
              </ul>
            </li>
            <li>
              We will acknowledge receipt within <strong>2 business days</strong>
              and complete deletion within <strong>30 days</strong>.
            </li>
          </ol>
        </section>

        <section className="mb-6">
          <p>
            <strong>Self‑service deletion:</strong> If you have an online
            account, you can log in and navigate to{' '}
            <em>Account &gt; Privacy Settings &gt; Delete My Data</em> for an
            immediate deletion request.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Contact Information
          </h2>
          <address className="space-y-1 not-italic text-gray-300">
            ActFAST Restoration and Repairs<br />
            Phone: <a href="tel:+16045185129" className="underline hover:text-red-400">+1‑604‑518‑5129</a><br />
            Email:{' '}
            <a
              href="mailto:info@actfast.ca"
              className="text-red-600 underline hover:text-red-400"
            >
              info@actfast.ca
            </a><br />
            Address: Unit 108 – 11539 136 St., Surrey, BC V3R 0G3, Canada
          </address>
        </section>

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

export default DataDeletionInstructions;
