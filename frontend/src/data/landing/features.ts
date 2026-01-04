import type { FeaturesSection } from "../types";

export const featuresSection: FeaturesSection = {
  header: "Why Teams Love Using Tasktrox",
  description:
    "Discover how Tasktrox simplifies team collaboration, boosts productivity, and helps you stay on top of every task — every day.",
  features: [
    {
      id: "precision",
      icon: "Target",
      title: "Plan With Precision",
      description:
        "Turn ideas into actionable tasks with clear deadlines, priorities, and team ownership.",
    },
    {
      id: "collaborate",
      icon: "Users",
      title: "Collaborate Without Chaos",
      description:
        "Easily invite teammates, assign tasks, and stay aligned — whether remote or in-office.",
    },
    {
      id: "track",
      icon: "BarChart3",
      title: "Track What Matters",
      description:
        "Stay in control with a real-time view of progress across all task stages.",
    },
  ],
  preview: {
    tags: ["UI/UX", "Design", "High", "Wireframe", "Prototype"],
    members: [
      { name: "Dimitri Ivanov", role: "Designer" },
      { name: "Hamail Harrison", role: "Senior Designer" },
    ],
    progress: {
      title: "Project Progress",
      percentage: 86,
      comparison: "+12% vs Last Week",
    },
  },
};
