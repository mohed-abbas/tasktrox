import type { NavLink, HeaderCTA } from "../types";

export const headerNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#product-showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#product-showcase" },
];

export const headerCTA: HeaderCTA = {
  text: "Get Started",
  href: "/login",
};
