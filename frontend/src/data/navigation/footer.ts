import type { FooterContent } from "../types";

export const footerContent: FooterContent = {
  tagline:
    "Get Organized, Simplify Your Workflow, And Move Faster As a Team.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Integrations", href: "/integrations" },
        { label: "Changelog", href: "/changelog" },
        { label: "Roadmap", href: "/roadmap" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Help Center", href: "/help" },
        { label: "API Reference", href: "/api" },
        { label: "Community", href: "/community" },
        { label: "Templates", href: "/templates" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Security", href: "/security" },
      ],
    },
  ],
  social: [
    {
      platform: "Twitter",
      href: "https://twitter.com/tasktrox",
      icon: "Twitter",
    },
    {
      platform: "LinkedIn",
      href: "https://linkedin.com/company/tasktrox",
      icon: "Linkedin",
    },
    {
      platform: "GitHub",
      href: "https://github.com/tasktrox",
      icon: "Github",
    },
  ],
  copyright: "© {year} Tasktrox. All rights reserved.",
  bottomLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};
