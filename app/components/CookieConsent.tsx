"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "actfast-cookie-consent-v1";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(localStorage.getItem(CONSENT_KEY) !== "accepted");
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-gray-950/95 px-4 py-4 text-white shadow-2xl backdrop-blur sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl text-sm leading-6 text-gray-200">
          <p className="font-semibold text-white">Cookie Notice</p>
          <p>
            ActFAST uses necessary cookies and browser storage for site
            functions such as employee portal access, secure login sessions,
            form handling, and saved preferences. We do not use advertising
            cookies or analytics trackers in the current site code.
          </p>
          <p className="mt-1">
            Review our{" "}
            <Link href="/cookiepolicy" className="text-red-400 underline">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacypolicy" className="text-red-400 underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={acceptCookies}
          className="shrink-0 rounded bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
