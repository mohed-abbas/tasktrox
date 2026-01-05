'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { easing, scrollViewport } from '@/lib/animations';

interface FloatingProgressCardProps {
  variant?: 'floating' | 'stacked';
}

export function FloatingProgressCard({ variant = 'floating' }: FloatingProgressCardProps) {
  const isFloating = variant === 'floating';

  // SVG parameters for semi-circular gauge
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const progress = 86;
  const progressOffset = circumference - (progress / 100) * circumference;

  const content = (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-[0_0_20px_rgba(0,0,0,0.08)] h-full flex flex-col">
      {/* Title */}
      <h4 className="font-medium text-base text-gray-800 text-center mb-4">
        Project Progress
      </h4>

      {/* Gauge */}
      <div className="relative flex justify-center items-end h-[90px] mb-2 flex-1">
        <svg
          width={size}
          height={size / 2 + 10}
          className="overflow-visible"
        >
          {/* Background arc (gray) */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc (dark) */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Inner decorative arc */}
          <path
            d={`M ${strokeWidth / 2 + 14} ${size / 2} A ${radius - 14} ${radius - 14} 0 0 1 ${size - strokeWidth / 2 - 14} ${size / 2}`}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>

        {/* Center content */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          {/* Small clock icon */}
          <div className="w-4 h-4 mx-auto mb-1 text-gray-400">
            <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Percentage */}
          <span className="text-xl font-bold text-gray-800 tracking-wide">
            86%
          </span>
        </div>
      </div>

      {/* Comparison text */}
      <div className="flex items-center justify-center gap-1 text-gray-600">
        <TrendingUp className="w-3 h-3 text-emerald-500" />
        <span className="text-[11px]">+12% vs Last Week</span>
      </div>
    </div>
  );

  if (isFloating) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -40, y: -30 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={scrollViewport}
        transition={{ duration: 0.8, ease: easing.smooth, delay: 0.5 }}
        className="absolute left-0 bottom-[60px] z-10 w-[280px]"
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
      transition={{ duration: 0.7, ease: easing.smooth, delay: 0.2 }}
    >
      {content}
    </motion.div>
  );
}
