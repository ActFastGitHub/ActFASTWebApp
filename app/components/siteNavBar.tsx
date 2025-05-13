"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";

import AFlogo from "@/app/images/actfast-logo.jpg";

interface NavbarProps {
  onPortalClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onPortalClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handlePortalClick = () => {
    const localStorageAccessCode = localStorage.getItem("accessCode");
    const cookieAccessCode = getCookie("accessCode");
    const envAccessCode = process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE;

    if (
      localStorageAccessCode === envAccessCode &&
      cookieAccessCode === envAccessCode
    ) {
      router.push("/login");
    } else {
      if (localStorageAccessCode !== envAccessCode || !cookieAccessCode) {
        localStorage.removeItem("accessCode");
        deleteCookie("accessCode");
      }
      onPortalClick();
    }
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-10 bg-black bg-opacity-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/">
                <img
                  src={AFlogo.src}
                  alt="Logo"
                  className="h-12 w-auto md:h-16"
                />
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="hidden md:block">
            <div className="ml-6 flex items-baseline space-x-4">
              <Link
                href="/"
                className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/services"
                className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Services
              </Link>
              <Link
                href="/featured"
                className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Featured
              </Link>
              <Link
                href="/teampage"
                className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Meet Our Team
              </Link>
              <button
                onClick={handlePortalClick}
                className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Employee Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/services"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
            >
              Services
            </Link>
            <Link
              href="/featured"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
            >
              Featured
            </Link>
            <Link
              href="/teampage"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
            >
              Meet Our Team
            </Link>
            <button
              onClick={handlePortalClick}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
            >
              Employee Portal
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
