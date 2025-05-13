/* app/unauthorized/page.tsx */
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LockClosedIcon } from "@heroicons/react/24/solid";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8"
    >
      {/* Icon scales up on bigger screens */}
      <LockClosedIcon className="h-16 w-16 text-red-500 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28" />

      {/* Heading scales too */}
      <h1 className="mt-4 text-2xl font-semibold text-gray-800 sm:text-3xl md:text-4xl">
        Access&nbsp;Denied
      </h1>

      <p className="mt-2 max-w-md text-center text-sm text-gray-600 sm:text-base md:text-lg lg:max-w-lg">
        You don’t have permission to view this page. If you believe this is a
        mistake, please contact an administrator.
      </p>

      <button
        onClick={handleBack}
        className="mt-6 rounded-xl border border-gray-300 px-6 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:text-base"
      >
        Go&nbsp;Back
      </button>
    </motion.main>
  );
}
