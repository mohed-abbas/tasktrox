'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      "Tasktrox is a perfect fit for teams. From sprints to stand-ups, it keeps everyone on the same page without the usual chaos.",
    author: 'Sarah Mitchell',
    role: 'Product Manager at Zentora',
    rating: 5,
    avatar: 'SM',
  },
  {
    quote:
      "The intuitive interface makes project management a breeze. Our team's productivity has increased by 40% since switching to Tasktrox.",
    author: 'James Chen',
    role: 'Engineering Lead at Pulseframe',
    rating: 5,
    avatar: 'JC',
  },
  {
    quote:
      "Finally, a tool that understands how modern teams work. The real-time collaboration features are game-changing for remote teams.",
    author: 'Emily Rodriguez',
    role: 'Design Director at Nexvio',
    rating: 5,
    avatar: 'ER',
  },
  {
    quote:
      "We tried dozen task managers before landing on Tasktrox. The drag-and-drop Kanban board is smooth, and the analytics help us spot bottlenecks instantly.",
    author: 'Michael Park',
    role: 'CTO at Cloudova',
    rating: 5,
    avatar: 'MP',
  },
  {
    quote:
      "Onboarding new team members is now effortless. Tasktrox's clean design means less training time and more productive work.",
    author: 'Lisa Thompson',
    role: 'HR Manager at Quantura',
    rating: 5,
    avatar: 'LT',
  },
  {
    quote:
      "The integration with our existing tools was seamless. Tasktrox fits perfectly into our workflow without disrupting what already works.",
    author: 'David Kim',
    role: 'Operations Lead at Novascale',
    rating: 5,
    avatar: 'DK',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight max-w-[400px]"
          >
            What Our Users Say About Tasktrox
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-500 max-w-[400px]"
          >
            Teams around the world trust Tasktrox to keep their projects
            organized and their teams productive.
          </motion.p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-medium">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
