import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Dashboard } from "@/components/Dashboard";
import { Flow } from "@/components/Flow";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { FoodRecognition } from "@/components/sections/FoodRecognition";
import { BMICalculator } from "@/components/sections/BMICalculator";
import { DietPlanner } from "@/components/sections/DietPlanner";
import { Fitness } from "@/components/sections/Fitness";
import { VoiceAssistant } from "@/components/sections/VoiceAssistant";
import { Recipes } from "@/components/sections/Recipes";
import { Restaurants } from "@/components/sections/Restaurants";
import { AIMirror } from "@/components/sections/AIMirror";
import { Academy } from "@/components/sections/Academy";

const Index = () => (
  <div className="min-h-screen text-foreground">
    <Navbar />
    <main>
      <Hero />
      <Features />
      <FoodRecognition />
      <BMICalculator />
      <Dashboard />
      <DietPlanner />
      <Fitness />
      <VoiceAssistant />
      <Recipes />
      <Restaurants />
      <AIMirror />
      <Academy />
      <Flow />
      <CTA />
    </main>
    <Footer />
  </div>
);

export default Index;
