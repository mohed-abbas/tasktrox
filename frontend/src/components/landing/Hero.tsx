'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-[82px] overflow-hidden">
      {/* Background grid lines (decorative) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-[100px] pt-20 pb-16">
        {/* Content */}
        <div className="text-center max-w-[785px] mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="bg-gray-800 text-white text-sm font-medium px-3 py-1 rounded-full">
              New
            </span>
            <span className="text-gray-600 text-base">
              Built for Smart Teams
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-[64px] font-bold text-gray-800 leading-[1.1] tracking-tight mb-6"
          >
            Your Daily Tasks
            <br />
            Organized Effortlessly
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-500 max-w-[749px] mx-auto mb-10"
          >
            Tasktrox helps you manage daily tasks, assign teammates, and track
            progress — all in a simple, fast, and visual workspace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-gray-800 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Get Started
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Play size={16} className="fill-current" />
              View Demo
            </button>
          </motion.div>
        </div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mt-16 lg:mt-20"
        >
          {/* Dashboard Preview Container */}
          <div className="relative mx-auto max-w-[1200px]">
            {/* Main Dashboard Image */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1.5 text-xs text-gray-400 border border-gray-200 max-w-[300px]">
                    app.tasktrox.com/dashboard
                  </div>
                </div>
              </div>

              {/* App Screenshot Placeholder - will be replaced with actual image */}
              <div className="aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-full max-w-4xl mx-auto">
                    {/* Kanban Board Preview */}
                    <div className="grid grid-cols-4 gap-4 p-6">
                      {/* Column: To Do */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-gray-800" />
                          <span className="text-sm font-semibold text-gray-800">
                            To Do
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto">
                            3
                          </span>
                        </div>
                        <div className="space-y-2">
                          <TaskCard title="Redesign Dashboard" tags={['UI/UX', 'Design']} />
                          <TaskCard title="Update API docs" tags={['Backend']} />
                        </div>
                      </div>

                      {/* Column: In Progress */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            In Progress
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto">
                            2
                          </span>
                        </div>
                        <div className="space-y-2">
                          <TaskCard title="Build auth flow" tags={['Frontend']} priority="high" />
                        </div>
                      </div>

                      {/* Column: In Review */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            In Review
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto">
                            1
                          </span>
                        </div>
                        <div className="space-y-2">
                          <TaskCard title="Mobile layout" tags={['Design']} />
                        </div>
                      </div>

                      {/* Column: Completed */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            Completed
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto">
                            5
                          </span>
                        </div>
                        <div className="space-y-2">
                          <TaskCard title="Setup CI/CD" tags={['DevOps']} completed />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            {/* Task Card Popup - Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -left-4 top-1/3 bg-white rounded-xl shadow-xl p-4 w-[280px] border border-gray-100 hidden lg:block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  Add New Member
                </span>
                <span className="text-gray-400">×</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Awais Raza</p>
                  <p className="text-xs text-gray-500">Designer</p>
                </div>
                <button className="ml-auto text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200">
                  Invite
                </button>
              </div>
            </motion.div>

            {/* Task Detail Popup - Right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute -right-4 top-1/4 bg-white rounded-xl shadow-xl p-4 w-[300px] border border-gray-100 hidden lg:block"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <div className="w-4 h-4 rounded bg-gray-200" />
                <span>July 6, 2025</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                Redesign Dashboard
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                Refine header with minimal layout, icon buttons, and improved
                spacing.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  UI/UX
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  Design
                </span>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  High
                </span>
              </div>
            </motion.div>

            {/* Cursor Indicator - Bottom */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute bottom-20 right-1/4 hidden lg:flex items-center gap-2"
            >
              <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-md">
                Hamail Hassan
              </div>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-purple-500 -ml-2"
              >
                <path
                  d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86h8.79c.27 0 .5-.22.5-.5V3.21c0-.28-.22-.5-.5-.5H6c-.28 0-.5.22-.5.5z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Mini Task Card Component for Hero Preview
function TaskCard({
  title,
  tags,
  priority,
  completed,
}: {
  title: string;
  tags: string[];
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
}) {
  const tagColors: Record<string, string> = {
    'UI/UX': 'bg-purple-100 text-purple-700',
    Design: 'bg-blue-100 text-blue-700',
    Frontend: 'bg-green-100 text-green-700',
    Backend: 'bg-yellow-100 text-yellow-700',
    DevOps: 'bg-orange-100 text-orange-700',
  };

  return (
    <div
      className={`bg-gray-50 rounded-md p-2 ${completed ? 'opacity-60' : ''}`}
    >
      <p
        className={`text-xs font-medium text-gray-700 mb-1.5 ${completed ? 'line-through' : ''}`}
      >
        {title}
      </p>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-[9px] px-1.5 py-0.5 rounded ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}
          >
            {tag}
          </span>
        ))}
        {priority === 'high' && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
            High
          </span>
        )}
      </div>
    </div>
  );
}
