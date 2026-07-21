import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Calendar, Award, Brain, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  readTime: string;
  tag: string;
  image: string;
}

const blogPosts: Post[] = [
  {
    id: "future-of-diet-tracking",
    title: "The Future of Diet Tracking: How AI Vision is Replacing Manual Calorie Counting",
    excerpt: "Logging food has historically been boring and tedious. Discover how computer vision and deep learning are making manual logging obsolete by analyzing meal photos in real-time.",
    date: "July 20, 2026",
    readTime: "4 min read",
    tag: "AI Tech",
    image: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/43ea3699-6120-4941-ad99-73566489003f",
    content: [
      "For years, keeping track of what you eat meant opening an app, typing in keywords, guessing portion sizes in grams, and searching through incomplete databases. It was a tedious chore that caused most people to give up within their first week.",
      "NeuralBites is changing that. By integrating real-time computer vision trained on thousands of food categories, our platform lets you snap a single photo of your plate and instantly receive a parsed list of food items, complete with estimated calorie and macronutrient weights.",
      "By utilizing advanced deep learning models optimized for mobile and web execution, we analyze color distributions, shapes, and textures to differentiate between complex dishes. The tool doesn't just recognize a simple apple; it can distinguish between different meal types and estimate portion volumes.",
      "This marks a significant step forward in making healthy lifestyle tracking invisible, interactive, and automatic. By removing the friction of manual data entry, AI vision enables long-term consistency, helping users make better, faster nutritional choices daily."
    ]
  },
  {
    id: "building-personalized-diet-plans",
    title: "How to Build a Personalized Nutrition Plan with NeuralBites AI",
    excerpt: "Every body is unique. Learn how to combine our BMI metrics, target calculators, and automated recipe engine to build a custom diet optimized for your goals.",
    date: "July 15, 2026",
    readTime: "5 min read",
    tag: "Nutrition",
    image: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/43ea3699-6120-4941-ad99-73566489003f",
    content: [
      "There is no one-size-fits-all diet. Your optimal caloric intake depends on an array of variables: weight, height, age, biological sex, and active daily expenditure. Tracking these calculations manually can feel like a college algebra class.",
      "NeuralBites simplifies custom meal planning. Using our integrated BMI Calculator and Diet Planner, you input your physical stats and select your target destination: weight loss, muscle gain, or body maintenance.",
      "Our system instantly computes your Basal Metabolic Rate (BMR) and Active Energy TDEE. It then feeds this data into our AI Recipe Engine to draft a custom daily menu, combining carbohydrates, proteins, and fats in the exact ratios required by your metabolism.",
      "Whether you are looking for high-protein meals for weight training or low-glycemic foods for sustained energy, NeuralBites creates structured proposals that fit your budget, dietary restrictions, and daily schedule."
    ]
  },
  {
    id: "get-certified-free-academy",
    title: "Learn Nutrition Science & Get Certified Free with NeuralBites Academy",
    excerpt: "Health education should be accessible to everyone. Read about our free mini-curriculum on metabolism, macros, and hydration, and how you can claim a shareable certificate signed by our CEO.",
    date: "July 10, 2026",
    readTime: "3 min read",
    tag: "Academy",
    image: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/43ea3699-6120-4941-ad99-73566489003f",
    content: [
      "In an era filled with internet fitness myths and fad diets, having a solid foundation in genuine nutrition science is vital. Unfortunately, professional certification courses are often expensive and locked behind paywalls.",
      "We believe that basic nutrition education should be a universal right. That is why we built the NeuralBites Academy—a completely free, interactive curriculum covering the essentials of macro-nutrients, hydration science, and metabolic pathways.",
      "Our bite-sized courses break down complex physiological processes into simple, engaging lessons. Once you study the materials, you can test your knowledge by taking the Academy exams. Passing these assessments unlocks an official Certificate of Completion.",
      "Each certificate features a unique secure serial number that can be publicly verified right on our website. Best of all, it's completely free. It is our way of helping people gain credible credentials and make informed decisions about their body."
    ]
  }
];

export default function Blog() {
  const [activePost, setActivePost] = useState<Post | null>(null);

  return (
    <div className="min-h-screen text-foreground relative">
      <Navbar />
      
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        {activePost ? (
          // Individual Post View
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setActivePost(null)}
              className="flex items-center gap-2 text-sm text-cyan hover:text-cyan/80 mb-8 transition-colors font-mono uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </button>

            <article className="glass-strong border-glow rounded-3xl p-6 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-neural opacity-5 pointer-events-none" />
              
              <div className="relative">
                <span className="bg-primary/20 text-neon border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                  {activePost.tag}
                </span>

                <h1 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
                  {activePost.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono mb-8 border-b border-primary/20 pb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-neon" /> {activePost.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-neon" /> {activePost.readTime}
                  </span>
                  <span>•</span>
                  <span className="text-foreground">By Ishit Jain (CEO, NeuralBites)</span>
                </div>

                <div className="space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg">
                  {activePost.content.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Brain className="h-10 w-10 text-neon" />
                    <div>
                      <div className="font-semibold text-foreground text-sm">NeuralBites Platform</div>
                      <div className="text-xs text-muted-foreground">AI-Powered Nutrition Intelligence</div>
                    </div>
                  </div>
                  <Button asChild className="bg-gradient-neural hover:opacity-90">
                    <Link to="/">Launch AI Scanner</Link>
                  </Button>
                </div>
              </div>
            </article>
          </div>
        ) : (
          // Blog List View
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-widest text-neon">Research & Insights</span>
              <h1 className="font-display text-4xl md:text-6xl font-bold mt-2 mb-4 text-gradient">
                NeuralBites Blog
              </h1>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                Explore deep dives on computer vision for diet tracking, metabolism math, and how we are building accessible health education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass border-glow rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative group cursor-pointer"
                  onClick={() => setActivePost(post)}
                >
                  <div className="absolute inset-0 bg-gradient-neural opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-primary/20 text-neon border border-primary/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                        {post.tag}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{post.readTime}</span>
                    </div>

                    <h3 className="font-display font-bold text-lg md:text-xl mb-3 group-hover:text-cyan transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-primary/10 pt-4 mt-auto">
                    <span className="text-[10px] text-muted-foreground font-mono">{post.date}</span>
                    <span className="text-xs text-cyan group-hover:underline flex items-center gap-1 font-mono uppercase tracking-wider">
                      Read Post →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Academy Certification Banner */}
            <div className="mt-20 glass-strong border-glow rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute inset-0 bg-gradient-neural opacity-10 pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <Award className="h-10 w-10 text-neon mb-4" />
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                  Earn Your Nutrition Certificate
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Study macros, hydration, and BMR inside our Academy. Complete all exams to claim your official certificate, checkable via public serial verification.
                </p>
              </div>
              <Button asChild size="lg" className="bg-gradient-neural hover:opacity-90 z-10 whitespace-nowrap">
                <Link to="/#academy">Go to Academy</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
