"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import AFLogo from "@/app/images/actfast-logo.jpg";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

type LegalPageShellProps = {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
};

export default function LegalPageShell({
  title,
  effectiveDate,
  children,
}: LegalPageShellProps) {
  return (
    <section className="min-h-screen bg-gray-900 px-6 py-16 font-sans text-white sm:px-12 md:px-24 lg:px-36">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl rounded-lg bg-gray-800 p-8 shadow-lg"
      >
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
          {title}
        </h1>

        <p className="mb-8 text-center italic text-gray-400">
          Effective Date: {effectiveDate}
        </p>

        <div className="space-y-6 text-gray-100">{children}</div>

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
}
