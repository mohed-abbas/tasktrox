'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started.',
    price: 9,
    period: 'month',
    features: [
      'Up to 5 team members',
      'Unlimited projects',
      'Basic integrations',
      '5GB storage',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Best for growing teams that need more power and flexibility.',
    price: 19,
    period: 'month',
    features: [
      'Up to 25 team members',
      'Unlimited projects',
      'Advanced integrations',
      '50GB storage',
      'Priority support',
      'Custom workflows',
      'Advanced analytics',
      'API access',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with advanced security needs.',
    price: 999,
    period: 'month',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Enterprise integrations',
      'Unlimited storage',
      '24/7 dedicated support',
      'Custom workflows',
      'Advanced analytics',
      'API access',
      'SSO & SAML',
      'Audit logs',
      'Custom contracts',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-4"
          >
            Find The Right Plan
            <br />
            For Your Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-500 max-w-[600px] mx-auto"
          >
            Choose the plan that works best for your team size and requirements.
            All plans include a 14-day free trial.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative bg-white rounded-2xl p-6 lg:p-8 ${
                plan.highlighted
                  ? 'ring-2 ring-gray-800 shadow-xl scale-105'
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-gray-800">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/login"
                className={`block w-full text-center py-3 rounded-lg font-medium transition-colors mb-6 ${
                  plan.highlighted
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  What&apos;s included
                </p>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className={`flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-12"
        >
          All prices in USD. Taxes may apply based on your location.{' '}
          <Link href="#" className="text-gray-800 underline hover:no-underline">
            View full pricing details
          </Link>
        </motion.p>
      </div>
    </section>
  );
}
