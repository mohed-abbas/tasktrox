'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const features = [
  {
    title: 'Plan With Precision',
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
      'Stay in control with a real-time view of progress across all task stages.',
    preview: 'progress-card',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 lg:py-[120px]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px]">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8 mb-12 lg:mb-[60px]">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl lg:text-[48px] font-medium text-black leading-[1.2] lg:w-[458px] capitalize"
          >
            Why Teams Love Using Tasktrox
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base lg:text-xl text-[rgba(68,69,78,0.7)] leading-[1.5] lg:w-[494px]"
          >
            Discover how Tasktrox simplifies team collaboration, boosts
            productivity, and helps you stay on top of every task — every day.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap gap-6 lg:gap-[43px] justify-center lg:justify-start">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="w-full md:w-[calc(50%-12px)] lg:w-[385px] lg:flex-shrink-0"
            >
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                {/* Preview Area */}
                <div className="h-[260px] bg-[#ECEEF7] relative flex items-center justify-center">
                  {feature.preview === 'task-card' && <TaskCardPreview />}
                  {feature.preview === 'invite-card' && <InviteCardPreview />}
                  {feature.preview === 'progress-card' && <ProjectProgressPreview />}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-[9px]">
                  <h3 className="text-2xl font-medium text-black leading-[1.2] capitalize">
                    {feature.title}
                  </h3>
                  <p className="text-base text-[rgba(68,69,78,0.7)] leading-[1.5]">
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
  const tags = [
    { label: 'UI/UX', bgColor: 'bg-[#ECFDF5]', textColor: 'text-[#10B981]' },
    { label: 'Design', bgColor: 'bg-[#FFFBEB]', textColor: 'text-[#F59E0B]' },
    { label: 'High', bgColor: 'bg-[#EFF6FF]', textColor: 'text-[#3B82F6]' },
    { label: 'Wireframe', bgColor: 'bg-[#F5F3FF]', textColor: 'text-[#8B5CF6]' },
    { label: 'Prototype', bgColor: 'bg-[#FDF2F8]', textColor: 'text-[#EC4899]' },
  ];

  const avatars = [
    '/images/hero/avatar-1.png',
    '/images/hero/avatar-2.png',
    '/images/hero/avatar-3.png',
    '/images/hero/avatar-4.png',
  ];

  return (
    <div className="bg-white rounded-[10.774px] border border-gray-200 p-[10.774px] w-[290px] shadow-sm">
      <div className="flex flex-col gap-[10.774px]">
        {/* Header */}
        <div className="flex flex-col gap-[8.978px]">
          {/* Date */}
          <div className="flex items-center gap-[4.489px]">
            <Image
              src="/images/hero/icon-calendar.svg"
              alt=""
              width={16}
              height={16}
              className="w-[16.161px] h-[16.161px]"
            />
            <span className="text-[10.774px] text-gray-500 leading-[1.5]">
              July 6, 2025
            </span>
          </div>

          {/* Title & Description */}
          <div className="flex flex-col gap-[5.387px]">
            <h4 className="text-[14.365px] font-semibold text-black leading-[17.957px]">
              Redesign Dashboard
            </h4>
            <p className="text-[10.774px] text-gray-500 leading-[1.5]">
              Refine header with minimal layout, icon buttons, and improved spacing.
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-[6.285px]">
            {tags.map((tag) => (
              <span
                key={tag.label}
                className={`${tag.bgColor} ${tag.textColor} text-[8.978px] px-[7.183px] py-[3.591px] rounded-[7.183px] leading-[1.5]`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Files */}
          <div className="flex items-center gap-[4.489px]">
            <Image
              src="/images/hero/icon-files.svg"
              alt=""
              width={14}
              height={14}
              className="w-[14.365px] h-[14.365px]"
            />
            <span className="text-[8.978px] text-gray-500 leading-[1.5]">
              5 Files
            </span>
          </div>

          {/* Avatar Stack */}
          <div className="flex items-center pr-[12.57px]">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className="w-[25.139px] h-[25.139px] rounded-full border-[0.898px] border-white overflow-hidden -mr-[12.57px] last:mr-0"
                style={{ zIndex: avatars.length - index }}
              >
                <Image
                  src={avatar}
                  alt=""
                  width={25}
                  height={25}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Invite Card Preview Component
function InviteCardPreview() {
  const members = [
    {
      name: 'Dimitri Ivanov',
      role: 'Designer',
      avatar: '/images/hero/avatar-robert.png',
    },
    {
      name: 'Hamail Harrison',
      role: 'Senior Designer',
      avatar: '/images/hero/avatar-henry.png',
    },
  ];

  return (
    <div className="bg-white rounded-[10.967px] border border-gray-200 w-[290px] absolute left-[48px] top-[46px]">
      <div className="p-[17.846px] flex flex-col gap-[17.846px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-[14.872px] font-semibold text-black leading-[14.872px]">
            Add New Member
          </h4>
          <Image
            src="/images/hero/icon-close.svg"
            alt=""
            width={15}
            height={15}
            className="w-[14.872px] h-[14.872px] opacity-60"
          />
        </div>

        {/* Members List */}
        <div className="flex flex-col gap-[12.641px]">
          <p className="text-[8.923px] text-gray-500 leading-[11.897px]">
            Team Member
          </p>
          <div className="flex flex-col gap-[7.436px]">
            {members.map((member, index) => (
              <div key={member.name}>
                <div className="flex items-center justify-between">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-[6.692px]">
                    <div className="w-[29.744px] h-[29.744px] rounded-full overflow-hidden">
                      <Image
                        src={member.avatar}
                        alt=""
                        width={30}
                        height={30}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col leading-[1.4]">
                      <span className="text-[10.41px] text-gray-800">
                        {member.name}
                      </span>
                      <span className="text-[8.923px] text-gray-500 font-light">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Invite Button */}
                  <button className="px-[11.897px] py-[4.462px] rounded-[5.205px] text-[10.41px] text-white capitalize leading-[16.359px] bg-gradient-to-b from-[#262730] from-[80.186%] to-[rgba(56,57,66,0.7)] border-[0.744px] border-white overflow-hidden relative">
                    <span className="relative z-10">Invite</span>
                    <div className="absolute inset-0 shadow-[inset_0px_2.231px_0px_0px_rgba(255,255,255,0.2)]" />
                  </button>
                </div>
                {/* Separator - only between items */}
                {index < members.length - 1 && (
                  <div className="w-full h-px bg-gray-100 mt-[7.436px]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Progress Preview Component (Gauge Chart)
function ProjectProgressPreview() {
  return (
    <div className="bg-white rounded-md px-5 py-3 w-[284px] flex flex-col gap-[14px] items-center overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-center w-[256px]">
        <h4 className="text-base font-medium text-[#262730] leading-normal">
          Project Progress
        </h4>
      </div>

      {/* Gauge Chart */}
      <div className="h-[107px] w-full overflow-hidden relative">
        {/* Gauge container - centered */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[13.5px] w-[145px] h-[145px]">
          {/* Outer arc (background) - semi-circle */}
          <div className="absolute inset-0 w-[145px] h-[72.5px] overflow-hidden">
            <Image
              src="/images/features/gauge-outer.svg"
              alt=""
              width={145}
              height={72.5}
              className="w-full h-full"
            />
          </div>

          {/* Middle arc (thin white-to-gray gradient) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[11px] w-[123px] h-[60.5px] overflow-hidden">
            <Image
              src="/images/features/gauge-middle.svg"
              alt=""
              width={123}
              height={60.5}
              className="w-full h-full"
            />
          </div>

          {/* Progress arc (dark arc showing 86% progress) */}
          <div className="absolute inset-0 w-[145px] h-[72.5px] rotate-180 scale-y-[-1]">
            <Image
              src="/images/features/gauge-progress.svg"
              alt=""
              width={145}
              height={72.5}
              className="w-full h-full"
            />
          </div>

          {/* Compass/crosshair icon at top center */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[28px] w-3 h-3">
            <Image
              src="/images/features/gauge-check-icon.svg"
              alt=""
              width={12}
              height={12}
              className="w-full h-full opacity-50"
            />
          </div>

          {/* Percentage text */}
          <p className="absolute left-1/2 -translate-x-1/2 top-[47px] text-lg font-bold text-[#262730] tracking-[0.9px] uppercase whitespace-nowrap">
            86%
          </p>

          {/* Needle/tick indicator on the right */}
          <div className="absolute top-[67px] right-[-7px] w-[21px] h-[1px] origin-left rotate-[177deg]">
            <Image
              src="/images/features/gauge-needle.svg"
              alt=""
              width={21}
              height={1}
              className="w-full h-full"
            />
          </div>

          {/* +12% vs Last Week indicator */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[82px] flex items-center gap-1 whitespace-nowrap">
            <Image
              src="/images/features/arrow-up.svg"
              alt=""
              width={6}
              height={7}
              className="w-[6px] h-[6px]"
            />
            <span className="text-[10px] font-medium text-gray-600 leading-normal">
              +12% vs Last Week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
