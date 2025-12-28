'use client';

import { motion } from 'framer-motion';
import {
  LayoutGrid,
  Users,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  FileText,
  MessageSquare,
} from 'lucide-react';

export function ProductShowcase() {
  return (
    <section className="py-20 lg:py-32 bg-white">
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
            Your All-In-One Task
            <br />
            Command Center
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-500 max-w-[600px] mx-auto"
          >
            Manage all your projects in one place with our intuitive,
            visual-first dashboard designed for teams.
          </motion.p>
        </div>

        {/* Product Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-md px-3 py-1.5 text-xs text-gray-400 border border-gray-200 max-w-[300px]">
                  app.tasktrox.com/projects/marketing
                </div>
              </div>
            </div>

            {/* App Interface */}
            <div className="flex min-h-[600px]">
              {/* Sidebar */}
              <div className="w-60 bg-white border-r border-gray-100 p-4 hidden lg:block">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="font-semibold text-gray-800">Tasktrox</span>
                </div>

                {/* Navigation */}
                <nav className="space-y-1 mb-8">
                  {[
                    { icon: LayoutGrid, label: 'Dashboard', active: true },
                    { icon: Calendar, label: 'Calendar', active: false },
                    { icon: Users, label: 'Team', active: false },
                    { icon: MessageSquare, label: 'Messages', active: false },
                    { icon: FileText, label: 'Files', active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        item.active
                          ? 'bg-gray-100 text-gray-800 font-medium'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>

                {/* Projects */}
                <div className="mb-6">
                  <div className="flex items-center justify-between px-3 mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase">
                      Projects
                    </span>
                    <Plus size={14} className="text-gray-400" />
                  </div>
                  {[
                    { name: 'Marketing', color: 'bg-blue-500' },
                    { name: 'Development', color: 'bg-green-500' },
                    { name: 'Design System', color: 'bg-purple-500' },
                  ].map((project) => (
                    <div
                      key={project.name}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <div className={`w-2 h-2 rounded-full ${project.color}`} />
                      <span>{project.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 bg-page p-6">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-800">
                      Marketing Campaign
                    </h1>
                    <p className="text-sm text-gray-500">
                      Q4 2025 product launch
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"
                        />
                      ))}
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                        +3
                      </div>
                    </div>
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Plus size={16} />
                      Add Task
                    </button>
                  </div>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-4 gap-4">
                  {/* To Do Column */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-800" />
                        <span className="font-semibold text-gray-800 text-sm">
                          To Do
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded">
                          4
                        </span>
                      </div>
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <KanbanCard
                        title="Research competitors"
                        tags={['Research']}
                        date="Dec 20"
                      />
                      <KanbanCard
                        title="Draft press release"
                        tags={['Content']}
                        date="Dec 22"
                      />
                      <KanbanCard
                        title="Update landing page"
                        tags={['Design', 'Dev']}
                        date="Dec 25"
                        priority="high"
                      />
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="font-semibold text-gray-800 text-sm">
                          In Progress
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded">
                          3
                        </span>
                      </div>
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <KanbanCard
                        title="Social media campaign"
                        tags={['Marketing']}
                        date="Dec 18"
                        hasComments
                      />
                      <KanbanCard
                        title="Email newsletter"
                        tags={['Content']}
                        date="Dec 19"
                      />
                    </div>
                  </div>

                  {/* In Review Column */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="font-semibold text-gray-800 text-sm">
                          In Review
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded">
                          2
                        </span>
                      </div>
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <KanbanCard
                        title="Brand guidelines v2"
                        tags={['Design']}
                        date="Dec 15"
                        hasAttachment
                      />
                    </div>
                  </div>

                  {/* Completed Column */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-semibold text-gray-800 text-sm">
                          Completed
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded">
                          8
                        </span>
                      </div>
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <KanbanCard
                        title="Kickoff meeting"
                        tags={['Team']}
                        date="Dec 10"
                        completed
                      />
                      <KanbanCard
                        title="Budget approval"
                        tags={['Finance']}
                        date="Dec 12"
                        completed
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Kanban Card Component
function KanbanCard({
  title,
  tags,
  date,
  priority,
  hasComments,
  hasAttachment,
  completed,
}: {
  title: string;
  tags: string[];
  date: string;
  priority?: 'high' | 'medium' | 'low';
  hasComments?: boolean;
  hasAttachment?: boolean;
  completed?: boolean;
}) {
  const tagColors: Record<string, string> = {
    Research: 'bg-blue-100 text-blue-700',
    Content: 'bg-green-100 text-green-700',
    Design: 'bg-purple-100 text-purple-700',
    Dev: 'bg-orange-100 text-orange-700',
    Marketing: 'bg-pink-100 text-pink-700',
    Team: 'bg-gray-100 text-gray-700',
    Finance: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div
      className={`bg-gray-50 rounded-lg p-3 ${completed ? 'opacity-60' : ''}`}
    >
      <p
        className={`text-sm font-medium text-gray-700 mb-2 ${completed ? 'line-through' : ''}`}
      >
        {title}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-[10px] px-1.5 py-0.5 rounded ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}
          >
            {tag}
          </span>
        ))}
        {priority === 'high' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
            High
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasComments && <MessageSquare size={12} />}
          {hasAttachment && <FileText size={12} />}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
        </div>
      </div>
    </div>
  );
}
