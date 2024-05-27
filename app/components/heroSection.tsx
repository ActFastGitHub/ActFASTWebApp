'use client';

import React, { useState } from "react";
import Link from "next/link";

// Logos and Images
import AFBuilding from "@/app/images/actfast-building.jpg";
import AFlogo from "@/app/images/actfast-logo.jpg";

// Define the props interface
interface HeroSectionProps {
  onPortalClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onPortalClick }) => {
  return (
    <div className='relative bg-cover bg-center h-screen' style={{ backgroundImage: `url(${AFBuilding.src})` }}>
      <nav className='bg-black bg-opacity-50 fixed top-0 left-0 right-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Link href='/'>
                  <img src={AFlogo.src} alt='Logo' className='h-12 w-auto md:h-16' />
                </Link>
              </div>
            </div>
            <div className='-mr-2 flex md:hidden'>
              <button
                type='button'
                className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white'
                aria-controls='mobile-menu'>
                <span className='sr-only'>Open main menu</span>
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4 6h16M4 12h16m-7 6h7'
                  />
                </svg>
              </button>
            </div>
            <div className='hidden md:block'>
              <div className='ml-10 flex items-baseline space-x-4'>
                <Link href='/' className='text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'>
                  Home
                </Link>
                <Link href='/services' className='text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'>
                  Services
                </Link>
                <Link href='/featured' className='text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'>
                  Featured
                </Link>
                <button
                  onClick={onPortalClick}
                  className='text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'>
                  Employee Portal
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='md:hidden' id='mobile-menu'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            <Link href='/' className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium'>
              Home
            </Link>
            <Link href='/services' className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium'>
              Services
            </Link>
            <Link href='/featured' className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium'>
              Featured
            </Link>
            <button
              onClick={onPortalClick}
              className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium'>
              Employee Portal
            </button>
          </div>
        </div>
      </nav>
      <div className='absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center text-white p-4'>
        <h1 className='text-4xl md:text-6xl font-bold mb-4'>Restoration & Repairs</h1>
        <p className='text-lg md:text-2xl mb-6'>Bringing your home back to life</p>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
