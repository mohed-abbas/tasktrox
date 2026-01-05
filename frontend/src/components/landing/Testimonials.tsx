'use client';

import { motion } from 'framer-motion';
import { TestimonialCard, VideoTestimonialCard } from './testimonials/index';
import { testimonialsSection } from '@/data/landing/testimonials';
import { easing, scrollViewport } from '@/lib/animations';

// Helper to get testimonial by ID with default fallback
const getTestimonial = (id: string) => {
  const t = testimonialsSection.testimonials.find((t) => t.id === id);
  const defaultTestimonial = {
    quote: '',
    author: {
      name: '',
      role: '',
      avatar: '',
    },
    thumbnailSrc: '',
    isVideo: false,
  };

  if (!t) return defaultTestimonial;

  return {
    quote: t.quote ? `"${t.quote}"` : '',
    author: {
      name: t.name,
      role: `${t.role} – ${t.company}`,
      avatar: t.avatar || `/images/testimonials/avatar-${t.id}.png`,
    },
    thumbnailSrc: t.videoThumbnail || '/images/testimonials/video-bg.png',
    isVideo: t.isVideo || false,
  };
};

// Get testimonials for easier access
const testimonials = {
  octavia: getTestimonial('octavia'),
  ravi: getTestimonial('ravi'),
  daniel: getTestimonial('daniel'),
  zainab: getTestimonial('zainab'),
  layla: getTestimonial('layla'),
  areeba: getTestimonial('areeba'),
};

export function Testimonials() {
  return (
    <section className="bg-gray-50 py-16 lg:py-[120px] px-4 sm:px-6 lg:px-[100px]">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12 lg:gap-[80px]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.7, ease: easing.smooth }}
            className="text-3xl sm:text-4xl lg:text-[48px] font-medium text-black leading-[1.2] capitalize max-w-[458px]"
          >
            {testimonialsSection.header}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.7, ease: easing.smooth, delay: 0.1 }}
            className="text-lg lg:text-xl text-gray-500/70 leading-[1.5] max-w-[494px]"
          >
            {testimonialsSection.description}
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        {/* Desktop: 3 asymmetric columns */}
        <div className="hidden lg:flex gap-8 justify-center">
          {/* Column 1 - Two equal height cards */}
          <div className="flex flex-col gap-8 w-[392px] h-[878px]">
            <TestimonialCard
              quote={testimonials.octavia.quote}
              author={testimonials.octavia.author}
              className="flex-1 min-h-0"
              index={0}
            />
            <TestimonialCard
              quote={testimonials.ravi.quote}
              author={testimonials.ravi.author}
              className="flex-1 min-h-0"
              index={1}
            />
          </div>

          {/* Column 2 - Short card + Video card */}
          <div className="flex flex-col gap-8 w-[392px]">
            <TestimonialCard
              quote={testimonials.daniel.quote}
              author={testimonials.daniel.author}
              className="h-[325px]"
              index={2}
            />
            <VideoTestimonialCard
              author={testimonials.zainab.author}
              thumbnailSrc={testimonials.zainab.thumbnailSrc}
              className="h-[521px]"
              index={3}
            />
          </div>

          {/* Column 3 - Two equal height cards */}
          <div className="flex flex-col gap-8 w-[392px] h-[878px]">
            <TestimonialCard
              quote={testimonials.layla.quote}
              author={testimonials.layla.author}
              className="flex-1 min-h-0"
              index={4}
            />
            <TestimonialCard
              quote={testimonials.areeba.quote}
              author={testimonials.areeba.author}
              className="flex-1 min-h-0"
              index={5}
            />
          </div>
        </div>

        {/* Tablet: 2 columns */}
        <div className="hidden md:flex lg:hidden gap-6 justify-center">
          {/* Column 1 */}
          <div className="flex flex-col gap-6 flex-1">
            <TestimonialCard
              quote={testimonials.octavia.quote}
              author={testimonials.octavia.author}
              index={0}
            />
            <TestimonialCard
              quote={testimonials.daniel.quote}
              author={testimonials.daniel.author}
              index={1}
            />
            <TestimonialCard
              quote={testimonials.layla.quote}
              author={testimonials.layla.author}
              index={2}
            />
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6 flex-1">
            <TestimonialCard
              quote={testimonials.ravi.quote}
              author={testimonials.ravi.author}
              index={3}
            />
            <VideoTestimonialCard
              author={testimonials.zainab.author}
              thumbnailSrc={testimonials.zainab.thumbnailSrc}
              className="h-[400px]"
              index={4}
            />
            <TestimonialCard
              quote={testimonials.areeba.quote}
              author={testimonials.areeba.author}
              index={5}
            />
          </div>
        </div>

        {/* Mobile: Single column, stacked */}
        <div className="flex md:hidden flex-col gap-6">
          <TestimonialCard
            quote={testimonials.octavia.quote}
            author={testimonials.octavia.author}
            index={0}
          />
          <TestimonialCard
            quote={testimonials.ravi.quote}
            author={testimonials.ravi.author}
            index={1}
          />
          <TestimonialCard
            quote={testimonials.daniel.quote}
            author={testimonials.daniel.author}
            index={2}
          />
          <VideoTestimonialCard
            author={testimonials.zainab.author}
            thumbnailSrc={testimonials.zainab.thumbnailSrc}
            className="h-[350px] sm:h-[400px]"
            index={3}
          />
          <TestimonialCard
            quote={testimonials.layla.quote}
            author={testimonials.layla.author}
            index={4}
          />
          <TestimonialCard
            quote={testimonials.areeba.quote}
            author={testimonials.areeba.author}
            index={5}
          />
        </div>
      </div>
    </section>
  );
}
