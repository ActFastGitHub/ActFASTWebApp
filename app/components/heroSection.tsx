// "use client";

// import React from "react";
// import Link from "next/link";
// import Navbar from "@/app/components/siteNavBar";

// import AFBuilding from "@/app/images/actfast-building.jpg";
// import PhoneIcon from "@/app/images/phone-icon.svg";

// interface HeroSectionProps {
//   onPortalClick: () => void;
// }

// const HeroSection: React.FC<HeroSectionProps> = ({ onPortalClick }) => {
//   return (
//     <div
//       className="relative h-screen bg-cover bg-center"
//       style={{ backgroundImage: `url(${AFBuilding.src})` }}
//     >
//       <Navbar onPortalClick={onPortalClick} />
//       <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4 text-center text-white">
//         <h1 className="mb-4 animate-fade-in-up text-5xl font-black font-bold italic hover:animate-text md:text-6xl">
//           24/7 EMERGENCY SERVICE
//         </h1>
//         <p className="mb-6 text-lg md:text-2xl">
//           Bringing your home back to life
//         </p>
//         <Link
//           className="flex items-center justify-center rounded bg-red-800 px-2 py-2 font-bold text-white hover:bg-red-600"
//           href="tel:+16045185129"
//         >
//           <img src={PhoneIcon.src} alt="phone" className="mr-2 h-6 w-6" />
//           CALL NOW
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default HeroSection;
"use client";

import React from "react";
import Link from "next/link";
import { ParallaxProvider, ParallaxBanner } from 'react-scroll-parallax';
import Navbar from "@/app/components/siteNavBar";

import AFBuilding from "@/app/images/actfast-building.jpg";
import PhoneIcon from "@/app/images/phone-icon.svg";

interface HeroSectionProps {
  onPortalClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onPortalClick }) => {
  return (
    <ParallaxProvider>
      <ParallaxBanner
        layers={[
          {
            image: AFBuilding.src,
            speed: -20,
          },
        ]}
        className="relative h-screen"
      >
        <Navbar onPortalClick={onPortalClick} />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4 text-center text-white">
          <h1 className="mb-4 animate-fade-in-up text-5xl font-black font-bold italic hover:animate-text md:text-6xl">
            24/7 EMERGENCY SERVICE
          </h1>
          <p className="mb-6 text-lg md:text-2xl">
            Bringing your home back to life
          </p>
          <Link
            className="flex items-center justify-center rounded bg-red-800 px-2 py-2 font-bold text-white hover:bg-red-600"
            href="tel:+16045185129"
          >
            <img src={PhoneIcon.src} alt="phone" className="mr-2 h-6 w-6" />
            CALL NOW
          </Link>
        </div>
      </ParallaxBanner>
    </ParallaxProvider>
  );
};

export default HeroSection;
