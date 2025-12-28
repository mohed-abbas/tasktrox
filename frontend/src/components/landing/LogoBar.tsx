'use client';

import { motion } from 'framer-motion';

const companies = [
  { name: 'Zentora', icon: 'Z' },
  { name: 'Pulseframe', icon: 'P' },
  { name: 'Nexvio', icon: 'N' },
  { name: 'Cloudova', icon: 'C' },
  { name: 'Quantura', icon: 'Q' },
];

export function LogoBar() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center lg:justify-between gap-8 lg:gap-4"
        >
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              {/* Company Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-600">
                  {company.icon}
                </span>
              </div>
              {/* Company Name */}
              <span className="text-xl font-semibold text-gray-700">
                {company.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
