import Link from 'next/link';

import facebookIcon from "@/app/images/facebookIcon.png";
import instagramIcon from "@/app/images/instagramIcon.png";
import AFlogo from "@/app/images/actfast-logo.jpg";

const Footer = () => (
  <footer className='bg-gray-800 text-white py-8'>
    <div className='container mx-auto px-4 text-center'>
      <div className='flex flex-row justify-center space-x-4 md:space-x-8 mb-4'>
        <Link href='#' className='hover:underline'>
          Home
        </Link>
        <Link href='#' className='hover:underline'>
          Services
        </Link>
        <Link href='#' className='hover:underline'>
          About
        </Link>
        <Link href='#' className='hover:underline'>
          Contact
        </Link>
      </div>
      <img src={AFlogo.src} className='w-auto h-12 bg-gray-500 mx-auto mb-4'></img>
      <div className='mb-4'>
        <p>Unit 108 - 11539 136 St.</p>
        <p>Surrey, BC V3R 0G3, CA</p>
        <p>+1-604-518-5129</p>
        <p>
          <a href='mailto:info@actfast.ca' className='hover:underline'>
            info@actfast.ca
          </a>
        </p>
        <div className='flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4 mt-2'>
          <Link href='https://www.facebook.com/ActFASTVancouver/' target='_blank' rel='noopener noreferrer' className='flex items-center hover:underline'>
            <img src={facebookIcon.src} alt='Facebook' className='w-6 h-6 mr-2' />
            Facebook
          </Link>
          <Link href='https://www.instagram.com/actfastvancouver/' target='_blank' rel='noopener noreferrer' className='flex items-center hover:underline'>
            <img src={instagramIcon.src} alt='Instagram' className='w-6 h-6 mr-2' />
            Instagram
          </Link>
        </div>
      </div>
      <p>&copy; {new Date().getFullYear()} Restoration & Repairs. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
