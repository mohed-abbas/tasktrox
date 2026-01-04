import type { HeroContent } from "../types";

export const heroContent: HeroContent = {
  badge: {
    label: "Newly",
    text: "Built for Smart Teams",
  },
  headline: {
    line1: "Your Daily Tasks",
    line2: "Organized Effortlessly",
  },
  subheadline:
    "Tasktrox helps you manage daily tasks, assign teammates, and track progress — all in a simple, fast, and visual workspace.",
  cta: {
    primary: { text: "Get Started", href: "/signup" },
    secondary: { text: "View Demo", href: "/demo" },
  },
  floatingElements: {
    taskCard: {
      title: "Redesign Dashboard",
      date: "July 6, 2025",
      description:
        "Refine header with minimal layout, icon buttons, and improved spacing.",
      tags: ["UI/UX", "Design", "High", "Wireframe", "Prototype"],
      fileCount: "5 Files",
    },
    memberDialog: {
      header: "Add New Member",
      label: "Team Member",
      members: [
        { name: "Robert Stark", role: "Designer" },
        { name: "Henry Williams", role: "Senior Designer" },
      ],
      buttonText: "Invite",
      searchPlaceholder: "Search",
    },
  },
};
