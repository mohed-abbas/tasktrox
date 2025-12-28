import {
  Header,
  Hero,
  LogoBar,
  Features,
  ProductShowcase,
  Pricing,
  Testimonials,
  CTA,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LogoBar />
        <Features />
        <ProductShowcase />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
