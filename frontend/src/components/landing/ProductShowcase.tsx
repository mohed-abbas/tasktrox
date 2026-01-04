'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FloatingTaskCard } from './showcase/FloatingTaskCard';
import { FloatingProgressCard } from './showcase/FloatingProgressCard';
import { FloatingMemberDialog } from './showcase/FloatingMemberDialog';
import { productShowcaseContent } from '@/data/landing/product-showcase';
import { easing, scrollViewport } from '@/lib/animations';

export function ProductShowcase() {
  return (
    <section className="py-16 lg:py-32 bg-white overflow-hidden" id="product-showcase">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px]">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.7, ease: easing.smooth }}
            className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-800 leading-tight mb-4 lg:mb-6"
          >
            {productShowcaseContent.header.line1}
            <br />
            {productShowcaseContent.header.line2}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.7, ease: easing.smooth, delay: 0.1 }}
            className="text-base lg:text-lg text-gray-500 max-w-[560px] mx-auto leading-relaxed"
          >
            {productShowcaseContent.description}
          </motion.p>
        </div>

        {/* Desktop Layout (lg+): Floating cards around MacBook */}
        <div className="hidden lg:block">
          <div className="relative px-16">
            {/* Floating Cards - Absolute positioned */}
            <FloatingTaskCard variant="floating" />
            <FloatingProgressCard variant="floating" />
            <FloatingMemberDialog variant="floating" />

            {/* MacBook Image */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={scrollViewport}
              transition={{ duration: 0.8, ease: easing.smooth, delay: 0.2 }}
              className="relative w-full max-w-[1100px] mx-auto"
            >
              <Image
                src="/images/showcase/Macbook.png"
                alt="Tasktrox Dashboard on MacBook"
                width={1218}
                height={690}
                className="w-full h-auto"
                priority
              />
            </motion.div>
          </div>
        </div>

        {/* Tablet/Mobile Layout: Stacked */}
        <div className="lg:hidden">
          {/* MacBook Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.8, ease: easing.smooth }}
            className="mb-8 sm:mb-12"
          >
            <Image
              src="/images/showcase/Macbook.png"
              alt="Tasktrox Dashboard on MacBook"
              width={1218}
              height={690}
              className="w-full h-auto"
              priority
            />
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <FloatingTaskCard variant="stacked" />
            <FloatingProgressCard variant="stacked" />
            <FloatingMemberDialog variant="stacked" />
          </div>
        </div>
      </div>
    </section>
  );
}
