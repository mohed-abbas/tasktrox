'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PricingCheckIcon } from '@/components/icons';

interface PlanFeature {
  text: string;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  features: PlanFeature[];
  cta: string;
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    description: 'Kickstart your productivity journey',
    price: '$9',
    period: 'Per Month',
    features: [
      { text: 'Up to 5 team members' },
      { text: 'Access to all core features' },
      { text: 'Kanban, List & Grid views' },
      { text: 'Task labels, due dates, and priorities' },
      { text: 'Email support' },
    ],
    cta: 'Choose Plan',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Built for fast-growing teams',
    price: '$19',
    period: 'Per Month',
    features: [
      { text: 'Up to 25 team members' },
      { text: 'Recurring tasks & reminders' },
      { text: 'Shared team boards' },
      { text: 'Commenting & file attachments' },
      { text: 'Priority support' },
    ],
    cta: 'Choose Plan',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'Customized for large teams & organizations',
    price: '$999',
    period: 'Per Month',
    features: [
      { text: 'Unlimited members & projects' },
      { text: 'Advanced admin controls & roles' },
      { text: 'Dedicated account manager' },
      { text: 'Custom integrations' },
      { text: 'SAML/SSO and team analytics' },
    ],
    cta: 'Choose Plan',
    highlighted: false,
  },
];

function PricingCard({ plan, index }: { plan: Plan; index: number }) {
  const isHighlighted = plan.highlighted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`relative flex flex-col gap-6 bg-white rounded-2xl p-6 ${
        isHighlighted
          ? 'border-[1.5px] border-[#0048ad] shadow-pricing-pro'
          : 'border border-gray-200'
      }`}
    >
      {/* Recommended Badge - only for Pro */}
      {isHighlighted && (
        <div className="absolute top-[18px] right-6 bg-gray-900 text-gray-50 text-xs font-medium px-2.5 py-1.5 rounded-[10px]">
          Recommended
        </div>
      )}

      {/* Card Header Section */}
      <div className="flex flex-col gap-4">
        {/* Plan Name & Description */}
        <div className="flex flex-col">
          <h3 className="text-[32px] font-semibold text-gray-800 leading-[1.5]">
            {plan.name}
          </h3>
          <p className="text-base text-black/70 leading-[1.5]">
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <span className="text-[40px] font-semibold text-gray-800 leading-[1.5]">
            {plan.price}
          </span>
          <span className="text-base text-black/70 leading-[1.5]">
            {plan.period}
          </span>
        </div>

        {/* CTA Button */}
        {isHighlighted ? (
          <Link
            href="/login"
            className="relative w-full text-center py-2.5 px-6 rounded-[7px] text-sm text-white capitalize overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #262730 80.186%, rgba(56, 57, 66, 0.7) 100%)',
              border: '1px solid white',
            }}
          >
            <span className="relative z-10">{plan.cta}</span>
            {/* Inner shadow highlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0px 3px 0px 0px rgba(255, 255, 255, 0.2)',
              }}
            />
          </Link>
        ) : (
          <Link
            href="/login"
            className="w-full text-center py-2.5 px-6 rounded-[7px] text-sm text-gray-800 capitalize bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {plan.cta}
          </Link>
        )}
      </div>

      {/* Separator Line */}
      <div className="w-full h-px border-t border-dashed border-gray-300" />

      {/* Features Section */}
      <div className="flex flex-col gap-5">
        <p className="text-base font-medium text-gray-900 leading-[1.5]">
          Includes everything, plus
        </p>

        <div className="flex flex-col gap-[13px]">
          {plan.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-center gap-3">
              <PricingCheckIcon size={20} className="shrink-0 text-black" />
              <span className="text-base text-black/70 leading-[1.5]">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-[120px] bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-6 text-center mb-[67px]">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-[48px] font-medium text-black leading-[1.2] capitalize max-w-[458px]"
          >
            Find the Right Plan for Your Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg lg:text-xl text-black/70 leading-[1.5] max-w-[560px]"
          >
            Choose from flexible plans designed to help teams of all sizes plan, collaborate, and complete work efficiently.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[31px]">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
