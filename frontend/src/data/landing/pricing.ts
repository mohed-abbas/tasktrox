import type { PricingSection } from "../types";

export const pricingSection: PricingSection = {
  header: "Find the Right Plan for Your Team",
  description:
    "Choose from flexible plans designed to help teams of all sizes plan, collaborate, and complete work efficiently.",
  featurePrefix: "Includes everything, plus",
  plans: [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      period: "Forever",
      description: "Kickstart your productivity journey",
      features: [
        "Up to 5 team members",
        "Access to all core features",
        "Kanban, List & Grid views",
        "Task labels, due dates, and priorities",
        "Email support",
      ],
      cta: "Choose Plan",
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      period: "Per Month",
      description: "Built for fast-growing teams",
      features: [
        "Up to 25 team members",
        "Recurring tasks & reminders",
        "Shared team boards",
        "Commenting & file attachments",
        "Priority support",
      ],
      cta: "Choose Plan",
      highlighted: true,
      badge: "Recommended",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99",
      period: "Per Month",
      description: "Customized for large teams & organizations",
      features: [
        "Unlimited members & projects",
        "Advanced admin controls & roles",
        "Dedicated account manager",
        "Custom integrations",
        "SAML/SSO and team analytics",
      ],
      cta: "Choose Plan",
    },
  ],
};
