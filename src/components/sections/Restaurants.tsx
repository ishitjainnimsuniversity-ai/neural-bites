import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { invokeFn } from "@/lib/api";
import { Loader2, MapPin, Utensils } from "lucide-react";

interface Restaurant { name: string; cuisine: string; signature_dish: string; why_healthy: string; calories_est?: number; price_range?: string; health_score: number; }

export const Restaurants = () => {
  const [city, setCity] = useState("New York");
  const [pref, setPref] = useState("high protein, low sugar");
  const [max, setMax] = useState("700");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Restaurant[]>([]);

  const search = async () => {
    setLoading(true);
    try {
      const r = await invokeFn<{ restaurants: Restaurant[] }>("restaurants", { city, preference: pref, maxCalories: +max });
      setList(r.restaurants);
    } catch (e: any) { toast.error(e.message || "Search failed"); }
    finally { setLoading(false); }
  };

  return (
    <section id="restaurants" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Dining</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Eat out, <span className="text-gradient">stay on track.</span></h2>
        </div>

        <div className="glass-strong rounded-3xl p-6 border-glow grid md:grid-cols-[1fr_1fr_120px_auto] gap-3 items-end mb-6">
          <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5 bg-input/50" /></div>
          <div><Label>Preferences</Label><Input value={pref} onChange={(e) => setPref(e.target.value)} className="mt-1.5 bg-input/50" /></div>
          <div><Label>Max kcal</Label><Input value={max} onChange={(e) => setMax(e.target.value)} className="mt-1.5 bg-input/50" /></div>
          <Button onClick={search} disabled={loading} className="bg-gradient-neural text-primary-foreground font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((r, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-display font-semibold">{r.name}</h3>
                  <div className="text-[10px] font-mono uppercase text-cyan flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.cuisine}{r.price_range ? ` · ${r.price_range}` : ""}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-muted-foreground">Score</div>
                  <div className="font-display text-xl font-bold text-gradient">{r.health_score}</div>
                </div>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 mb-1"><Utensils className="h-3.5 w-3.5 text-neon" /> {r.signature_dish}</div>
              <p className="text-xs text-muted-foreground">{r.why_healthy}</p>
              {r.calories_est && <div className="mt-2 font-mono text-[10px] text-neon">~{r.calories_est} kcal</div>}
            </div>
          ))}
          {!loading && list.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">Search to discover healthy spots.</p>
          )}
        </div>
      </div>
    </section>
  );
};