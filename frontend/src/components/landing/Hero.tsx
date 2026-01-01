'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

export function Hero() {
  return (
    <section className="relative pt-[91px] overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/hero/grid-background.svg"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        {/* Hero Content */}
        <div className="text-center max-w-[785px] mx-auto pt-[88px]">
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-[#f5f5f5] rounded-full px-2 py-1.5 mb-3"
          >
            <span className="bg-[#090909] text-white text-sm font-medium px-2.5 py-0.5 rounded-full">
              New
            </span>
            <span className="text-[#090909] text-base pr-1">
              Built for Smart Teams
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[48px] md:text-[64px] lg:text-[76px] font-medium text-black leading-[1.2] tracking-tight capitalize"
          >
            Your Daily Tasks
            <br />
            Organized Effortlessly
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-[rgba(68,69,78,0.7)] max-w-[749px] mx-auto mt-[22px] leading-[1.5]"
          >
            Tasktrox helps you manage daily tasks, assign teammates, and track
            progress — all in a simple, fast, and visual workspace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-2.5 mt-7"
          >
            <Link
              href="/login"
              className="relative inline-flex items-center justify-center bg-gradient-to-b from-[#262730] from-[80%] to-[rgba(56,57,66,0.7)] text-white px-6 py-2.5 rounded-[7px] text-sm capitalize border border-white/20 overflow-hidden hover:opacity-90 transition-opacity"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 shadow-[inset_0px_3px_0px_0px_rgba(255,255,255,0.2)]" />
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-[#262730] px-6 py-2.5 rounded-[7px] text-sm font-medium capitalize shadow-[0px_-0.5px_1px_0px_rgba(0,0,0,0.15),0px_1px_1px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 transition-colors"
            >
              View Demo
            </button>
          </motion.div>
        </div>

        {/* ============================================ */}
        {/* DESKTOP: Hero Content Image Visualization   */}
        {/* ============================================ */}
        <div className="relative mt-16 lg:mt-20 h-[500px] hidden lg:block">
          {/* SVG Elbow Connector Lines - Right angle turns with rounded corners */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1240 500"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Line from center to right/up (to task card) */}
            {/* Path: start at center → horizontal right → rounded 90° corner (15px radius) → vertical up */}
            <path
              d="M620 250
                 H 735
                 Q 750 250, 750 235
                 V 120"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Diamond arrow at the end (pointing up) */}
            <path
              d="M750 115 L754.5 121 L750 127 L745.5 121 Z"
              fill="#9CA3AF"
            />

            {/* Line from center to left/down (to Add Member button) */}
            {/* Path: start at center → horizontal left → rounded 90° corner (15px radius) → vertical down */}
            <path
              d="M620 250
                 H 505
                 Q 490 250, 490 265
                 V 375"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Diamond arrow at the end (pointing down) */}
            <path
              d="M490 380 L494.5 374 L490 368 L485.5 374 Z"
              fill="#9CA3AF"
            />
          </svg>

          {/* Center Tasktrox Logo */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-[58px] h-[58px] bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <Image
                src="/images/hero/tasktrox-icon.svg"
                alt="Tasktrox"
                width={24}
                height={36}
                className="brightness-0 invert"
              />
            </div>
          </motion.div>

          {/* New Task Button (Orange) */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.7 }}
            className="absolute flex items-center justify-center gap-1.5 bg-[#f59e0b] text-white px-6 py-2.5 rounded-[7px] text-sm capitalize border border-white shadow-[0px_35px_50px_10px_rgba(245,158,11,0.25)]"
            style={{ left: '53%', top: '18%' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>New Task</span>
            <div className="absolute inset-0 rounded-[7px] shadow-[inset_0px_3px_0px_0px_rgba(255,255,255,0.2)]" />
          </motion.div>

          {/* Add Member Button (Purple) */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.75 }}
            className="absolute flex items-center justify-center gap-1.5 bg-[#8b5cf6] text-white px-[18px] py-2.5 rounded-[7px] text-sm capitalize border border-white shadow-[0px_35px_50.5px_10px_rgba(139,92,246,0.25)]"
            style={{ left: '35%', top: '68%' }}
          >
            <span>Add Member</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 rounded-[7px] shadow-[inset_0px_3px_0px_0px_rgba(255,255,255,0.2)]" />
          </motion.div>

          {/* Larry Charles Cursor */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.4, delay: 0.9 }}
            className="absolute flex items-center"
            style={{ left: '60%', top: '28%' }}
          >
            <Image
              src="/images/hero/cursor-blue.svg"
              alt=""
              width={24}
              height={24}
              className="absolute -left-4 -top-4"
            />
            <div className="bg-[#3b82f6] text-white text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
              Larry Charles
            </div>
          </motion.div>

          {/* Christophe Bird Cursor */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.4, delay: 0.95 }}
            className="absolute flex items-center"
            style={{ left: '46%', top: '78%' }}
          >
            <Image
              src="/images/hero/cursor-pink.svg"
              alt=""
              width={24}
              height={24}
              className="absolute -left-4 -top-4"
            />
            <div className="bg-[#ec4899] text-white text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
              Christophe Bird
            </div>
          </motion.div>

          {/* Add New Member Card (Left) */}
          <motion.div
            variants={fadeInLeft}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute left-0 top-[28%] w-[390px] bg-white rounded-[15px] border border-gray-200 shadow-[0px_0px_26.4px_0px_rgba(0,0,0,0.1)]"
          >
            <div className="p-6 shadow-[0px_6px_12px_0px_rgba(0,0,0,0.15)] rounded-[10px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-black">Add New Member</h3>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <Image
                    src="/images/hero/icon-close.svg"
                    alt="Close"
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-md mb-6">
                <Image
                  src="/images/hero/icon-search.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-50"
                />
                <span className="text-sm text-[#737a82]">Search</span>
              </div>

              {/* Team Members */}
              <div className="space-y-4">
                <p className="text-xs text-gray-500">Team Member</p>
                <div className="space-y-2.5">
                  {/* Robert Stark */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src="/images/hero/avatar-robert.png"
                        alt="Robert Stark"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-sm text-gray-800">Robert Stark</p>
                        <p className="text-xs text-gray-500 font-light">Designer</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="relative bg-gradient-to-b from-[#262730] from-[80%] to-[rgba(56,57,66,0.7)] text-white px-4 py-1.5 rounded-[7px] text-sm capitalize border border-white/20 overflow-hidden"
                    >
                      <span className="relative z-10">Invite</span>
                      <div className="absolute inset-0 shadow-[inset_0px_3px_0px_0px_rgba(255,255,255,0.2)]" />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200" />

                  {/* Henry Williams */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src="/images/hero/avatar-henry.png"
                        alt="Henry Williams"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-sm text-gray-800">Henry Williams</p>
                        <p className="text-xs text-gray-500 font-light">Senior Designer</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="relative bg-gradient-to-b from-[#262730] from-[80%] to-[rgba(56,57,66,0.7)] text-white px-4 py-1.5 rounded-[7px] text-sm capitalize border border-white/20 overflow-hidden"
                    >
                      <span className="relative z-10">Invite</span>
                      <div className="absolute inset-0 shadow-[inset_0px_3px_0px_0px_rgba(255,255,255,0.2)]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Redesign Dashboard Card (Right) */}
          <motion.div
            variants={fadeInRight}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.55 }}
            className="absolute right-0 top-[5%] w-[397px] bg-white rounded-[15px] border border-gray-200 shadow-[0px_0px_26.4px_0px_rgba(0,0,0,0.1)] p-4"
          >
            <div className="space-y-3.5">
              {/* Header with date */}
              <div className="flex items-center gap-1.5">
                <Image
                  src="/images/hero/icon-calendar.svg"
                  alt=""
                  width={22}
                  height={22}
                />
                <span className="text-[15px] text-gray-500">July 6, 2025</span>
              </div>

              {/* Title and Description */}
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-black">
                  Redesign Dashboard
                </h4>
                <p className="text-[15px] text-gray-500 leading-[1.5]">
                  Refine header with minimal layout, icon buttons, and improved spacing.
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#ecfdf5] text-[#10b981] text-xs px-2.5 py-1 rounded-full">
                  UI/UX
                </span>
                <span className="bg-[#fffbeb] text-[#f59e0b] text-xs px-2.5 py-1 rounded-full">
                  Design
                </span>
                <span className="bg-[#eff6ff] text-[#3b82f6] text-xs px-2.5 py-1 rounded-full">
                  High
                </span>
                <span className="bg-[#f5f3ff] text-[#8b5cf6] text-xs px-2.5 py-1 rounded-full">
                  Wireframe
                </span>
                <span className="bg-[#fdf2f8] text-[#ec4899] text-xs px-2.5 py-1 rounded-full">
                  Prototype
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 w-[70%]" />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/images/hero/icon-files.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                  <span className="text-xs text-gray-500">5 Files</span>
                </div>

                {/* Avatar Stack */}
                <div className="flex -space-x-3">
                  <Image
                    src="/images/hero/avatar-1.png"
                    alt=""
                    width={34}
                    height={34}
                    className="rounded-full border-[1.2px] border-white"
                  />
                  <Image
                    src="/images/hero/avatar-2.png"
                    alt=""
                    width={34}
                    height={34}
                    className="rounded-full border-[1.2px] border-white"
                  />
                  <Image
                    src="/images/hero/avatar-3.png"
                    alt=""
                    width={34}
                    height={34}
                    className="rounded-full border-[1.2px] border-white"
                  />
                  <Image
                    src="/images/hero/avatar-4.png"
                    alt=""
                    width={34}
                    height={34}
                    className="rounded-full border-[1.2px] border-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ============================================ */}
        {/* MOBILE/TABLET: Simplified Hero Visualization */}
        {/* ============================================ */}
        <div className="relative mt-12 lg:hidden">
          {/* Single Task Card for Mobile */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-[360px] bg-white rounded-[15px] border border-gray-200 shadow-[0px_0px_26.4px_0px_rgba(0,0,0,0.1)] p-4"
          >
            <div className="space-y-3">
              {/* Header with date */}
              <div className="flex items-center gap-1.5">
                <Image
                  src="/images/hero/icon-calendar.svg"
                  alt=""
                  width={20}
                  height={20}
                />
                <span className="text-sm text-gray-500">July 6, 2025</span>
              </div>

              {/* Title and Description */}
              <div className="space-y-1.5">
                <h4 className="text-lg font-semibold text-black">
                  Redesign Dashboard
                </h4>
                <p className="text-sm text-gray-500 leading-[1.5]">
                  Refine header with minimal layout, icon buttons, and improved spacing.
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-[#ecfdf5] text-[#10b981] text-[11px] px-2 py-0.5 rounded-full">
                  UI/UX
                </span>
                <span className="bg-[#fffbeb] text-[#f59e0b] text-[11px] px-2 py-0.5 rounded-full">
                  Design
                </span>
                <span className="bg-[#eff6ff] text-[#3b82f6] text-[11px] px-2 py-0.5 rounded-full">
                  High
                </span>
                <span className="bg-[#f5f3ff] text-[#8b5cf6] text-[11px] px-2 py-0.5 rounded-full">
                  Wireframe
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200" />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/images/hero/icon-files.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                  <span className="text-xs text-gray-500">5 Files</span>
                </div>

                {/* Avatar Stack */}
                <div className="flex -space-x-2">
                  <Image
                    src="/images/hero/avatar-1.png"
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full border border-white"
                  />
                  <Image
                    src="/images/hero/avatar-2.png"
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full border border-white"
                  />
                  <Image
                    src="/images/hero/avatar-3.png"
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full border border-white"
                  />
                  <Image
                    src="/images/hero/avatar-4.png"
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full border border-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Action Buttons (Mobile) */}
          <div className="flex justify-center gap-3 mt-6">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center justify-center gap-1.5 bg-[#f59e0b] text-white px-4 py-2 rounded-[7px] text-sm capitalize border border-white shadow-[0px_20px_40px_5px_rgba(245,158,11,0.2)]"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>New Task</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex items-center justify-center gap-1.5 bg-[#8b5cf6] text-white px-4 py-2 rounded-[7px] text-sm capitalize border border-white shadow-[0px_20px_40px_5px_rgba(139,92,246,0.2)]"
            >
              <span>Add Member</span>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.div>
          </div>

          {/* Cursor Labels (Mobile) */}
          <div className="flex justify-center gap-4 mt-4">
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.4, delay: 0.8 }}
              className="flex items-center gap-1"
            >
              <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-xs text-gray-500">Larry Charles</span>
            </motion.div>
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.4, delay: 0.85 }}
              className="flex items-center gap-1"
            >
              <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
              <span className="text-xs text-gray-500">Christophe Bird</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-16 lg:h-0" />
      </div>
    </section>
  );
}
