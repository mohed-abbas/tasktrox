'use client';

import { motion } from 'framer-motion';
import { Calendar, Paperclip } from 'lucide-react';
import Image from 'next/image';
import { easing, scrollViewport } from '@/lib/animations';

const tags = [
  { label: 'UI/UX', bgColor: 'bg-green-50', textColor: 'text-emerald-500' },
  { label: 'Design', bgColor: 'bg-amber-50', textColor: 'text-amber-500' },
  { label: 'High', bgColor: 'bg-blue-50', textColor: 'text-blue-500' },
  { label: 'Wireframe', bgColor: 'bg-violet-50', textColor: 'text-violet-500' },
  { label: 'Prototype', bgColor: 'bg-pink-50', textColor: 'text-pink-500' },
];

const avatars = [
  '/images/showcase/avatar-1.png',
  '/images/showcase/avatar-2.png',
  '/images/showcase/avatar-3.png',
  '/images/showcase/avatar-4.png',
];

interface FloatingTaskCardProps {
  variant?: 'floating' | 'stacked';
}

export function FloatingTaskCard({ variant = 'floating' }: FloatingTaskCardProps) {
  const isFloating = variant === 'floating';

  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-[0_0_20px_rgba(0,0,0,0.08)] h-full">
      {/* Date */}
      <div className="flex items-center gap-1.5 mb-3">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">July 6, 2025</span>
      </div>

      {/* Title & Description */}
      <div className="mb-3">
        <h4 className="font-semibold text-sm text-gray-900 mb-1">
          Redesign Dashboard
        </h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          Refine header with minimal layout, icon buttons, and improved spacing.
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((tag) => (
          <span
            key={tag.label}
            className={`${tag.bgColor} ${tag.textColor} text-[10px] px-2 py-1 rounded-md font-medium`}
          >
            {tag.label}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-3" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Paperclip className="w-3.5 h-3.5" />
          <span className="text-[10px]">5 Files</span>
        </div>

        {/* Avatar Stack */}
        <div className="flex -space-x-2">
          {avatars.map((src, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
            >
              <Image
                src={src}
                alt={`Team member ${index + 1}`}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isFloating) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -40, y: 30 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={scrollViewport}
        transition={{ duration: 0.8, ease: easing.smooth, delay: 0.3 }}
        className="absolute left-0 top-[80px] z-10 w-[280px]"
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={scrollViewport}
      transition={{ duration: 0.7, ease: easing.smooth, delay: 0.1 }}
    >
      {content}
    </motion.div>
  );
}
