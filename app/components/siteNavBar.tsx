// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { getCookie, deleteCookie } from "cookies-next";

// import AFlogo from "@/app/images/actfast-logo.jpg";

// interface NavbarProps {
//   onPortalClick: () => void;
// }

// const Navbar: React.FC<NavbarProps> = ({ onPortalClick }) => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const router = useRouter();

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const handlePortalClick = () => {
//     const localStorageAccessCode = localStorage.getItem("accessCode");
//     const cookieAccessCode = getCookie("accessCode");
//     const envAccessCode = process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE;

//     if (
//       localStorageAccessCode === envAccessCode &&
//       cookieAccessCode === envAccessCode
//     ) {
//       router.push("/login");
//     } else {
//       if (localStorageAccessCode !== envAccessCode || !cookieAccessCode) {
//         localStorage.removeItem("accessCode");
//         deleteCookie("accessCode");
//       }
//       onPortalClick();
//     }
//   };

//   return (
//     <nav className="fixed left-0 right-0 top-0 z-50 bg-black">
//       <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
//         <div className="flex h-16 items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex-shrink-0">
//               <Link href="/">
//                 <img
//                   src={AFlogo.src}
//                   alt="Logo"
//                   className="h-12 w-auto md:h-16"
//                 />
//               </Link>
//             </div>
//           </div>
//           <div className="-mr-2 flex md:hidden">
//             <button
//               type="button"
//               className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none"
//               aria-controls="mobile-menu"
//               aria-expanded={isMobileMenuOpen}
//               onClick={toggleMobileMenu}
//             >
//               <span className="sr-only">Open main menu</span>
//               <svg
//                 className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M4 6h16M4 12h16m-7 6h7"
//                 />
//               </svg>
//               <svg
//                 className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>
//           <div className="hidden md:block">
//             <div className="ml-6 flex items-baseline space-x-4">
//               <Link
//                 href="/"
//                 className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
//               >
//                 Home
//               </Link>
//               <Link
//                 href="/services"
//                 className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
//               >
//                 Services
//               </Link>
//               <Link
//                 href="/featured"
//                 className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
//               >
//                 Featured
//               </Link>
//               <Link
//                 href="/teampage"
//                 className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
//               >
//                 Meet Our Team
//               </Link>
//               <button
//                 onClick={handlePortalClick}
//                 className="rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
//               >
//                 Employee Portal
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {isMobileMenuOpen && (
//         <div className="md:hidden" id="mobile-menu">
//           <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
//             <Link
//               href="/"
//               className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
//             >
//               Home
//             </Link>
//             <Link
//               href="/services"
//               className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
//             >
//               Services
//             </Link>
//             <Link
//               href="/featured"
//               className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
//             >
//               Featured
//             </Link>
//             <Link
//               href="/teampage"
//               className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
//             >
//               Meet Our Team
//             </Link>
//             <button
//               onClick={handlePortalClick}
//               className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
//             >
//               Employee Portal
//             </button>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";

import AFlogo from "@/app/images/actfast-logo.jpg";
import { BRANCHES } from "@/app/config/branches";

interface NavbarProps {
  onPortalClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onPortalClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isMobileLocationsOpen, setIsMobileLocationsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const locationsRef = useRef<HTMLDivElement | null>(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

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

  // Build branch links
  const branchLinks = useMemo(() => {
    return BRANCHES.map((b) => ({
      key: b.slug,
      label: b.navLabel ?? b.label,
      href: b.isMain ? "/" : `/${b.slug}`,
    }));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!isLocationsOpen) return;
      const target = e.target as Node;
      if (locationsRef.current && !locationsRef.current.contains(target)) {
        setIsLocationsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isLocationsOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsLocationsOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileLocationsOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-black">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
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

          {/* Mobile hamburger */}
          <div className="-mr-2 flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>

              {/* Menu icon */}
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

              {/* Close icon */}
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

          {/* Desktop menu */}
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

              {/* ✅ Locations dropdown */}
              <div className="relative" ref={locationsRef}>
                <button
                  type="button"
                  onClick={() => setIsLocationsOpen((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:text-white"
                  aria-haspopup="menu"
                  aria-expanded={isLocationsOpen}
                >
                  Locations
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      isLocationsOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isLocationsOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/95 shadow-2xl backdrop-blur"
                  >
                    <div className="py-2">
                      {branchLinks.map((b) => (
                        <Link
                          key={b.key}
                          href={b.href}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white"
                          role="menuitem"
                        >
                          {b.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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

      {/* Mobile menu */}
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

            {/* ✅ Mobile Locations expandable */}
            <button
              type="button"
              onClick={() => setIsMobileLocationsOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-base font-medium text-gray-300 hover:text-white"
              aria-expanded={isMobileLocationsOpen}
            >
              <span>Locations</span>
              <svg
                className={`h-5 w-5 transition-transform ${
                  isMobileLocationsOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isMobileLocationsOpen && (
              <div className="ml-3 border-l border-white/10 pl-3">
                {branchLinks.map((b) => (
                  <Link
                    key={b.key}
                    href={b.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                  >
                    {b.label}
                  </Link>
                ))}
              </div>
            )}

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
              className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-300 hover:text-white"
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
