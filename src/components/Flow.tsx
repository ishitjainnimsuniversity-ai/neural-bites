import { Camera, Brain, BarChart3, Heart } from "lucide-react";

const steps = [
  { icon: Camera, title: "Capture", desc: "Snap an ingredient, scan a label, or pick from the database." },
  { icon: Brain, title: "Recognize", desc: "Neural vision identifies and decomposes every component instantly." },
  { icon: BarChart3, title: "Analyze", desc: "Get a full nutrient breakdown with bioavailability and risk indexing." },
  { icon: Heart, title: "Personalize", desc: "Receive health-focused insights tuned to your goals and biomarkers." },
];

export const Flow = () => (
  <section className="py-24 relative">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Workflow</div>
        <h2 className="font-display text-4xl md:text-5xl font-bold">From bite to <span className="text-gradient">biology</span> in seconds.</h2>
      </div>
      <div className="grid md:grid-cols-4 gap-5 relative">
        <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
        {steps.map((s, i) => (
          <div key={s.title} className="glass rounded-2xl p-6 relative text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-background border border-primary/40 flex items-center justify-center mb-4 glow-cyan">
              <s.icon className="h-6 w-6 text-neon" />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Step 0{i + 1}</div>
            <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);