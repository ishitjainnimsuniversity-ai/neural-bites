import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calcBMI } from "@/lib/api";
import { Calculator } from "lucide-react";

export const BMICalculator = () => {
  const [h, setH] = useState("175");
  const [w, setW] = useState("70");
  const [result, setResult] = useState<ReturnType<typeof calcBMI> | null>(null);

  const compute = () => {
    const hn = parseFloat(h), wn = parseFloat(w);
    if (!hn || !wn || hn < 50 || hn > 260 || wn < 20 || wn > 400) {
      setResult(null); return;
    }
    setResult(calcBMI(wn, hn));
  };

  return (
    <section id="bmi" className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Body metrics</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Instant <span className="text-gradient">BMI</span> &amp; guidance.</h2>
            <p className="text-muted-foreground mb-8 max-w-md">Enter your height and weight to see your category and a science-backed recommendation.</p>
            <div className="glass rounded-2xl p-6 space-y-4 max-w-md">
              <div>
                <Label htmlFor="h">Height (cm)</Label>
                <Input id="h" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} className="mt-1.5 bg-input/50" />
              </div>
              <div>
                <Label htmlFor="w">Weight (kg)</Label>
                <Input id="w" inputMode="numeric" value={w} onChange={(e) => setW(e.target.value)} className="mt-1.5 bg-input/50" />
              </div>
              <Button onClick={compute} className="w-full bg-gradient-neural text-primary-foreground font-semibold">
                <Calculator className="h-4 w-4 mr-2" /> Calculate BMI
              </Button>
            </div>
          </div>
          <div className="glass-strong rounded-3xl p-8 border-glow min-h-[300px] flex flex-col justify-center">
            {!result ? (
              <p className="text-center text-muted-foreground">Enter values and tap Calculate.</p>
            ) : (
              <div className="text-center animate-fade-in">
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">BMI</div>
                <div className="font-display text-7xl font-bold text-gradient my-3">{result.bmi}</div>
                <div className="font-display text-xl font-semibold mb-3">{result.category}</div>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">{result.advice}</p>
                <div className="mt-6 h-2 rounded-full bg-muted overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan via-neon to-destructive opacity-30" />
                  <div className="absolute top-0 h-full w-1 bg-foreground shadow-lg" style={{ left: `${Math.min(100, Math.max(0, ((result.bmi - 15) / 25) * 100))}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1.5">
                  <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};