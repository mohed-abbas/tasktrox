// ============================================
// SHARED TYPES
// ============================================

export interface NavLink {
  label: string;
  href: string;
}

export interface TeamMemberPreview {
  name: string;
  role: string;
  avatar?: string;
}

export interface TaskCardPreview {
  title: string;
  date: string;
  description: string;
  tags: string[];
  fileCount: string;
}

export interface ProgressPreview {
  title: string;
  percentage: number;
  comparison: string;
}

export interface MemberDialogPreview {
  header: string;
  label: string;
  members: TeamMemberPreview[];
  buttonText: string;
  searchPlaceholder: string;
}

// ============================================
// HERO SECTION
// ============================================

export interface HeroContent {
  badge: {
    label: string;
    text: string;
  };
  headline: {
    line1: string;
    line2: string;
  };
  subheadline: string;
  cta: {
    primary: { text: string; href: string };
    secondary: { text: string; href: string };
  };
  floatingElements: {
    taskCard: TaskCardPreview;
    memberDialog: MemberDialogPreview;
  };
}

// ============================================
// FEATURES SECTION
// ============================================

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSection {
  header: string;
  description: string;
  features: Feature[];
  preview: {
    tags: string[];
    members: TeamMemberPreview[];
    progress: ProgressPreview;
  };
}

// ============================================
// TESTIMONIALS SECTION
// ============================================

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar?: string;
  isVideo?: boolean;
  videoThumbnail?: string;
}

export interface TestimonialsSection {
  header: string;
  description: string;
  testimonials: Testimonial[];
}

// ============================================
// PRICING SECTION
// ============================================

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

export interface PricingSection {
  header: string;
  description: string;
  featurePrefix: string;
  plans: PricingPlan[];
}

// ============================================
// COMPANIES / LOGO BAR
// ============================================

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

// ============================================
// PRODUCT SHOWCASE
// ============================================

export interface ProductShowcaseContent {
  header: {
    line1: string;
    line2: string;
  };
  description: string;
}

// ============================================
// CTA SECTION
// ============================================

export interface CTAContent {
  heading: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

// ============================================
// NAVIGATION
// ============================================

export interface HeaderCTA {
  text: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface FooterContent {
  tagline: string;
  columns: FooterColumn[];
  social: SocialLink[];
  copyright: string;
  bottomLinks: NavLink[];
}

// ============================================
// SEO
// ============================================

export interface SEOMetadata {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  author: string;
  ogImage?: string;
  twitterHandle?: string;
}
