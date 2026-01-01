'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export interface TestimonialCardProps {
  quote: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  className?: string;
  index?: number;
}

export function TestimonialCard({
  quote,
  author,
  className = '',
  index = 0,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between ${className}`}
    >
      {/* Quote */}
      <p className="text-xl text-gray-700 leading-[1.5]">{quote}</p>

      {/* Author */}
      <div className="flex items-center gap-4 mt-6">
        <div className="relative w-[52px] h-[52px] flex-shrink-0">
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xl font-medium text-gray-800 leading-[1.4]">
            {author.name}
          </p>
          <p className="text-base text-gray-500 leading-[1.4]">{author.role}</p>
        </div>
      </div>
    </motion.div>
  );
}
