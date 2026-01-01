'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function CTA() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-900 rounded-[36px] px-6 py-12 md:px-12 md:py-16 lg:p-20"
        >
          {/* Content Container */}
          <div className="flex flex-col items-center gap-6 max-w-[936px] mx-auto">
            {/* Heading */}
            <motion.h2
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[32px] md:text-[44px] lg:text-[56px] font-medium text-white leading-[1.2] text-center capitalize max-w-[718px]"
            >
              Start Getting Things Done Visually And Effortlessly
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-white/70 text-center leading-[1.5] max-w-[936px]"
            >
              Unlock your team's potential by organizing tasks with Tasktrox —
              the modern, intuitive to-do app designed to boost productivity and
              reduce chaos.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-white text-[#262730] px-6 py-2.5 rounded-[7px] text-sm font-medium capitalize border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
