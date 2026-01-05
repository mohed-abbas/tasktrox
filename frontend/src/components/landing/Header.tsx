'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { headerNavLinks, headerCTA } from '@/data/navigation/header';
import {
  mobileMenuVariants,
  mobileMenuItemVariants,
} from '@/lib/animations';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        <nav className="flex items-center justify-between h-[82px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo className="h-9 w-auto text-gray-800" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {headerNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 text-base font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link
              href={headerCTA.href}
              className="inline-flex items-center justify-center bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              {headerCTA.text}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
              className="px-6 py-4 space-y-3"
            >
              {headerNavLinks.map((link) => (
                <motion.div key={link.label} variants={mobileMenuItemVariants}>
                  <Link
                    href={link.href}
                    className="block text-gray-600 hover:text-gray-900 text-base font-medium py-2 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={mobileMenuItemVariants}>
                <Link
                  href={headerCTA.href}
                  className="block w-full text-center bg-gray-800 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {headerCTA.text}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
