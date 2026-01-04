import type { NavLink, HeaderCTA } from "../types";

export const headerNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
];

export const headerCTA: HeaderCTA = {
  text: "Get Started",
  href: "/signup",
};
