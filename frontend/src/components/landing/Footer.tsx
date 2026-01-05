'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { footerContent } from '@/data/navigation/footer';

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Twitter,
  Linkedin,
  Github,
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Logo className="h-8 w-auto text-white mb-4" />
            <p className="text-sm text-gray-400 max-w-[280px] mb-6">
              {footerContent.tagline}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {footerContent.social.map((social) => {
                const IconComponent = iconMap[social.icon];
                return (
                  <Link
                    key={social.platform}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    aria-label={social.platform}
                  >
                    {IconComponent && <IconComponent size={18} />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {footerContent.columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-white font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {footerContent.copyright.replace('{year}', new Date().getFullYear().toString())}
            </p>
            <div className="flex items-center gap-6">
              {footerContent.bottomLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
