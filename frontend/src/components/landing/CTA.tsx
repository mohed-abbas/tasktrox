'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-purple-600 to-purple-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
          >
            Start Getting Things Done
            <br />
            Visually And Effortlessly
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-purple-100 max-w-[600px] mx-auto mb-10"
          >
            Join thousands of teams building their projects smarter with a
            modern, clean, and intuitive task management experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-lg text-base font-semibold hover:bg-purple-50 transition-colors"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-base font-medium text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              View Pricing
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-purple-200 text-sm mt-6"
          >
            No credit card required • 14-day free trial • Cancel anytime
          </motion.p>
        </div>
      </div>
    </section>
  );
}
