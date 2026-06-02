import { Flame, Droplets, Wheat, Beef, Apple, Activity } from "lucide-react";

const macros = [
  { label: "Calories", value: 1840, target: 2200, unit: "kcal", icon: Flame, color: "from-neon to-cyan" },
  { label: "Protein", value: 112, target: 140, unit: "g", icon: Beef, color: "from-cyan to-plasma" },
  { label: "Carbs", value: 198, target: 250, unit: "g", icon: Wheat, color: "from-plasma to-neon" },
  { label: "Hydration", value: 2.1, target: 3, unit: "L", icon: Droplets, color: "from-neon to-plasma" },
];

const micros = [
  { name: "Vitamin D", pct: 78 },
  { name: "Iron", pct: 62 },
  { name: "Magnesium", pct: 91 },
  { name: "Omega-3", pct: 54 },
  { name: "Zinc", pct: 73 },
  { name: "B12", pct: 88 },
];

export const Dashboard = () => (
  <section id="dashboard" className="py-24 relative">
    <div className="container mx-auto px-4">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div className="max-w-xl">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Live dashboard</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Your body, <span className="text-gradient">streaming.</span></h2>
        </div>
        <div className="glass rounded-full px-4 py-2 text-xs font-mono text-muted-foreground">
          <span className="inline-block w-2 h-2 bg-neon rounded-full mr-2 animate-pulse-glow" />
          Sync · 02:14:09
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 md:p-10 border-glow">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {macros.map((m) => {
            const pct = Math.min(100, (m.value / m.target) * 100);
            return (
              <div key={m.label} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <m.icon className="h-5 w-5 text-neon" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</span>
                </div>
                <div className="font-display text-3xl font-bold">
                  {m.value}<span className="text-base text-muted-foreground font-normal ml-1">/ {m.target} {m.unit}</span>
                </div>
                <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${m.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-neon" /> Micronutrient Coverage</h3>
              <span className="text-xs font-mono text-muted-foreground">7-day rolling</span>
            </div>
            <div className="space-y-4">
              {micros.map((m) => (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{m.name}</span>
                    <span className="font-mono text-neon">{m.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-neural rounded-full relative"
                      style={{ width: `${m.pct}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,hsl(var(--neon-glow)/0.6),transparent)] bg-[length:200%_100%] animate-shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold flex items-center gap-2 mb-6"><Apple className="h-4 w-4 text-neon" /> Today's Bites</h3>
            <ul className="space-y-3">
              {[
                { name: "Greek Yogurt Bowl", kcal: 320, tag: "Hi-protein" },
                { name: "Quinoa & Salmon", kcal: 540, tag: "Omega-3" },
                { name: "Matcha Almond Latte", kcal: 180, tag: "Antiox" },
                { name: "Kale Walnut Salad", kcal: 280, tag: "Iron+" },
              ].map((b) => (
                <li key={b.name} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{b.name}</div>
                    <div className="text-[10px] font-mono uppercase text-cyan mt-0.5">{b.tag}</div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{b.kcal} kcal</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
);