'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { companies } from '@/data/landing/companies';

export function LogoBar() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center lg:justify-between gap-8 lg:gap-0"
        >
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {company.logo && (
                <div className="w-12 h-12 shrink-0">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full"
                  />
                </div>
              )}
              <span className="text-[22px] font-semibold text-[#636e7c] whitespace-nowrap">
                {company.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
