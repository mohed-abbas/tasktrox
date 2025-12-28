'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, BarChart3, FileText, CheckCircle } from 'lucide-react';

const features = [
  {
    title: 'Plan with Precision',
    description:
      'Turn ideas into actionable tasks with clear deadlines, priorities, and team ownership.',
    preview: 'task-card',
  },
  {
    title: 'Collaborate Without Chaos',
    description:
      'Easily invite teammates, assign tasks, and stay aligned — whether remote or in-office.',
    preview: 'invite-card',
  },
  {
    title: 'Track What Matters',
    description:
      'Get insights into team progress with visual charts, status updates, and completion metrics.',
    preview: 'analytics-card',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight max-w-[458px]"
          >
            Why Teams Love Using Tasktrox
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-500 max-w-[494px]"
          >
            Discover how Tasktrox simplifies team collaboration, boosts
            productivity, and helps you stay on top of every task — every day.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                {/* Preview Area */}
                <div className="h-[260px] bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
                  {feature.preview === 'task-card' && <TaskCardPreview />}
                  {feature.preview === 'invite-card' && <InviteCardPreview />}
                  {feature.preview === 'analytics-card' && (
                    <AnalyticsCardPreview />
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Task Card Preview Component
function TaskCardPreview() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-[260px]">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <Calendar size={14} />
        <span>July 6, 2025</span>
      </div>
      <h4 className="font-semibold text-gray-800 text-sm mb-1">
        Redesign Dashboard
      </h4>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        Refine header with minimal layout, icon buttons, and improved spacing.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
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
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FileText size={12} />
          <span>5 Files</span>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Invite Card Preview Component
function InviteCardPreview() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-[260px]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800 text-sm">Add New Member</h4>
        <span className="text-gray-400 text-lg">×</span>
      </div>
      <div className="space-y-3">
        {[
          { name: 'Awais Raza', role: 'Designer' },
          { name: 'Hamail Hassan', role: 'Senior Designer' },
        ].map((person) => (
          <div
            key={person.name}
            className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{person.name}</p>
              <p className="text-xs text-gray-400">{person.role}</p>
            </div>
            <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors">
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analytics Card Preview Component
function AnalyticsCardPreview() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-[260px]">
      <div className="flex items-center justify-center mb-4">
        <h4 className="font-semibold text-gray-800 text-sm">Task Progress</h4>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 mb-4">
        {[
          { label: 'Completed', value: 65, color: 'bg-green-500' },
          { label: 'In Progress', value: 25, color: 'bg-yellow-500' },
          { label: 'To Do', value: 10, color: 'bg-gray-300' },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">24</p>
          <p className="text-[10px] text-gray-400">Total Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">16</p>
          <p className="text-[10px] text-gray-400">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-600">6</p>
          <p className="text-[10px] text-gray-400">In Progress</p>
        </div>
      </div>
    </div>
  );
}
