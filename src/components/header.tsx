'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import main from '@/assets/images/main.png'
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b-2 fixed top-0 left-0 bg-white z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center">
            <Image 
              src={main} 
              alt="Activator Panel Logo" 
              width={40} 
              height={40} 
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-xl font-semibold text-blue-700 ml-2 mt-[15px]">
              Activator Panel
            </span>
          </Link>
        </div>

        {/* Hamburger Button (visible on mobile) */}
        <button
          className="md:hidden text-blue-700 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>

        {/* Navigation Links */}
        <nav
          className={`${
            isOpen ? 'flex' : 'hidden'
          } md:flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 z-40`}
        >
          <Link href="/" className="text-blue-600 text-lg hover:text-blue-800">
            Home
          </Link>
          <Link href="/profile" className="text-blue-600 text-lg hover:text-blue-800">
            Connect
          </Link>
          <Link href="/profile" className="text-blue-600 text-lg hover:text-blue-800">
            Contact
          </Link>
          <Link href="/profile" className="text-blue-600 text-lg hover:text-blue-800">
            FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
}