import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Dashboard } from "@/components/Dashboard";
import { Flow } from "@/components/Flow";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen text-foreground">
    <Navbar />
    <main>
      <Hero />
      <Features />
      <Dashboard />
      <Flow />
      <CTA />
    </main>
    <Footer />
  </div>
);

export default Index;
