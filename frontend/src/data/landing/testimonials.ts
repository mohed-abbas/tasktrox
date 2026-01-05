import type { TestimonialsSection } from "../types";

export const testimonialsSection: TestimonialsSection = {
  header: "What Our Users Say About Tasktrox",
  description:
    "Teams love how Tasktrox helps them stay organized, collaborate seamlessly, and complete work faster — without the chaos.",
  testimonials: [
    {
      id: "octavia",
      name: "Octavia Khan",
      role: "People Ops",
      company: "Craftwise",
      quote:
        "Tasktrox has completely changed how we operate. I used to manage my team's tasks across multiple tools, but with Tasktrox, everything is centralized and effortless. From assigning tasks to tracking progress — it just works.",
    },
    {
      id: "ravi",
      name: "Ravi Malhotra",
      role: "Engineering Manager",
      company: "Hexware",
      quote:
        "We run a fast-paced dev team and needed something lightweight yet powerful. Tasktrox delivered. Tagging, priorities, due dates — it's all customizable and built for how real teams work.",
    },
    {
      id: "daniel",
      name: "Daniel H.",
      role: "Product Manager",
      company: "NovaTech",
      quote:
        "The clarity Tasktrox provides is unmatched. I can glance at our dashboard and instantly understand what's in progress, what's stuck, and who needs help. We've saved hours every week just by switching.",
    },
    {
      id: "zainab",
      name: "Zainab Shaikh",
      role: "Head of Projects",
      company: "Lumenly",
      quote: "",
      isVideo: true,
      videoThumbnail: "/images/testimonials/video-bg.png",
    },
    {
      id: "layla",
      name: "Layla Mendez",
      role: "UX Lead",
      company: "Loop Studio",
      quote:
        "We've used other task platforms before, but none felt this clean and fast. The UI is intuitive, onboarding is painless, and the ability to toggle views (Kanban to list) has made managing projects far easier.",
    },
    {
      id: "areeba",
      name: "Areeba Qureshi",
      role: "Senior Designer",
      company: "BrightGrid",
      quote:
        "Honestly, we didn't expect a task tool to impact our creative workflow this much. Tasktrox keeps everyone in sync — even across departments. The collaboration tools are smooth and effective.",
    },
  ],
};
