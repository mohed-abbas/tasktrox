'use client';

import { motion } from 'framer-motion';
import { TestimonialCard, VideoTestimonialCard } from './testimonials/index';

// Testimonial data from Figma design
const testimonials = {
  // Column 1
  octavia: {
    quote:
      '"Tasktrox has completely changed how we operate. I used to manage my team\'s tasks across multiple tools, but with Tasktrox, everything is centralized and effortless. From assigning tasks to tracking progress — it just works."',
    author: {
      name: 'Octavia Khan',
      role: 'People Ops – Craftwise',
      avatar: '/images/testimonials/avatar-octavia.png',
    },
  },
  ravi: {
    quote:
      '"We run a fast-paced dev team and needed something lightweight yet powerful. Tasktrox delivered. Tagging, priorities, due dates — it\'s all customizable and built for how real teams work."',
    author: {
      name: 'Ravi Malhotra',
      role: 'Engineering Manager – Hexware',
      avatar: '/images/testimonials/avatar-ravi.png',
    },
  },

  // Column 2
  daniel: {
    quote:
      '"The clarity Tasktrox provides is unmatched. I can glance at our dashboard and instantly understand what\'s in progress, what\'s stuck, and who needs help. We\'ve saved hours every week just by switching."',
    author: {
      name: 'Daniel H.',
      role: 'Product Manager – NovaTech',
      avatar: '/images/testimonials/avatar-daniel.png',
    },
  },
  zainab: {
    author: {
      name: 'Zainab Shaikh',
      role: 'Head of Projects – Lumenly',
    },
    thumbnailSrc: '/images/testimonials/video-bg.png',
    // videoSrc will be added when video is available
  },

  // Column 3
  layla: {
    quote:
      '"We\'ve used other task platforms before, but none felt this clean and fast. The UI is intuitive, onboarding is painless, and the ability to toggle views (Kanban to list) has made managing projects far easier."',
    author: {
      name: 'Layla Mendez',
      role: 'UX Lead – Loop Studio',
      avatar: '/images/testimonials/avatar-layla.png',
    },
  },
  areeba: {
    quote:
      '"Honestly, we didn\'t expect a task tool to impact our creative workflow this much. Tasktrox keeps everyone in sync — even across departments. The collaboration tools are smooth and effective."',
    author: {
      name: 'Areeba Qureshi',
      role: 'Senior Designer – BrightGrid',
      avatar: '/images/testimonials/avatar-areeba.png',
    },
  },
};

export function Testimonials() {
  return (
    <section className="bg-gray-50 py-16 lg:py-[120px] px-4 sm:px-6 lg:px-[100px]">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12 lg:gap-[80px]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-[48px] font-medium text-black leading-[1.2] capitalize max-w-[458px]"
          >
            What Our Users Say About Tasktrox
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg lg:text-xl text-gray-500/70 leading-[1.5] max-w-[494px]"
          >
            Teams love how Tasktrox helps them stay organized, collaborate
            seamlessly, and complete work faster — without the chaos.
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
