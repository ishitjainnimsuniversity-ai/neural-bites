import { ScanLine, Activity, Salad, Cpu, Database, HeartPulse } from "lucide-react";

const features = [
  { icon: ScanLine, title: "AI Ingredient Recognition", desc: "Point your camera, and a convolutional neural net identifies ingredients in milliseconds — from saffron threads to seed varieties.", id: "recognition" },
  { icon: Activity, title: "Smart Nutrition Analyzer", desc: "Per-gram macro and micronutrient breakdown, glycemic load, and bioavailability — visualized in real time.", id: "analyzer" },
  { icon: Salad, title: "Meal Recommendation Engine", desc: "Personalized meal plans tuned to allergies, training cycles, and health goals using neural preference modeling." },
  { icon: Cpu, title: "Food-Tech Innovation Lab", desc: "Curated showcase of breakthroughs in precision fermentation, cellular agriculture and edible electronics.", id: "innovations" },
  { icon: Database, title: "Open Ingredient Database", desc: "12,000+ ingredients with sourcing data, environmental impact, and clinical references — fully searchable.", id: "database" },
  { icon: HeartPulse, title: "Health Concern Radar", desc: "Maps your intake against cardiovascular, metabolic and inflammatory risk markers in a single living dashboard." },
];

export const Features = () => (
  <section className="py-24 relative">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mb-14">
        <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Capabilities</div>
        <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          A six-layer neural stack for <span className="text-gradient">everything you eat</span>.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            id={f.id}
            className="group glass rounded-2xl p-7 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)]"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-neural flex items-center justify-center mb-5 glow-cyan group-hover:scale-110 transition-transform">
              <f.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);