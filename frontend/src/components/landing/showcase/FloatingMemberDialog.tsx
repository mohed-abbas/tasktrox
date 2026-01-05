'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { easing, scrollViewport } from '@/lib/animations';

const members = [
  {
    name: 'Dimitri Ivanov',
    role: 'Designer',
    avatar: '/images/showcase/member-awais.png',
  },
  {
    name: 'Hamail Harrison',
    role: 'Senior Designer',
    avatar: '/images/showcase/member-hamail.png',
  },
];

interface FloatingMemberDialogProps {
  variant?: 'floating' | 'stacked';
}

export function FloatingMemberDialog({ variant = 'floating' }: FloatingMemberDialogProps) {
  const isFloating = variant === 'floating';

  const content = (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.08)] h-full">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm text-gray-900">
            Add New Member
          </h4>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Team Member Label */}
        <p className="text-[10px] text-gray-500 mb-3">Team Member</p>

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={member.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Info */}
                  <div>
                    <p className="text-xs font-medium text-gray-800">
                      {member.name}
                    </p>
                    <p className="text-[10px] text-gray-500">{member.role}</p>
                  </div>
                </div>

                {/* Invite Button */}
                <button className="bg-gray-800 hover:bg-gray-700 text-white text-[10px] px-3 py-1.5 rounded-md font-medium transition-colors">
                  Invite
                </button>
              </div>

              {/* Divider (except last) */}
              {index < members.length - 1 && (
                <div className="h-px bg-gray-100 mt-3" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isFloating) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 40, y: 30 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={scrollViewport}
        transition={{ duration: 0.8, ease: easing.smooth, delay: 0.4 }}
        className="absolute right-0 top-[260px] z-10 w-[280px]"
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={scrollViewport}
      transition={{ duration: 0.7, ease: easing.smooth, delay: 0.3 }}
    >
      {content}
    </motion.div>
  );
}
