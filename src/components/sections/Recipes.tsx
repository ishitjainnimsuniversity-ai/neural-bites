import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { invokeFn } from "@/lib/api";
import { ChefHat, Loader2, Plus, X } from "lucide-react";

interface Recipe { title: string; time_min: number; difficulty?: string; ingredients: string[]; steps: string[]; calories: number; protein_g: number; carbs_g?: number; fat_g?: number; health_tags?: string[]; }

export const Recipes = () => {
  const [ingredients, setIngredients] = useState<string[]>(["chicken breast", "spinach", "quinoa"]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const add = () => {
    const v = draft.trim().toLowerCase();
    if (v && !ingredients.includes(v)) setIngredients([...ingredients, v]);
    setDraft("");
  };

  const generate = async () => {
    if (ingredients.length === 0) { toast.error("Add at least one ingredient"); return; }
    setLoading(true);
    try {
      const r = await invokeFn<{ recipes: Recipe[] }>("recipe-engine", { ingredients, dietStyle: "balanced", maxTime: 45 });
      setRecipes(r.recipes);
      toast.success(`Generated ${r.recipes.length} recipes`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <section id="recipes" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Recipes</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">From fridge to <span className="text-gradient">feast.</span></h2>
        </div>

        <div className="glass-strong rounded-3xl p-6 md:p-8 border-glow mb-6">
          <Label>Ingredients</Label>
          <div className="flex gap-2 mt-2">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder="e.g. avocado" className="bg-input/50" />
            <Button onClick={add} variant="outline" className="border-primary/40"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {ingredients.map((i) => (
              <span key={i} className="glass rounded-full px-3 py-1.5 text-sm flex items-center gap-2">
                {i}
                <button onClick={() => setIngredients(ingredients.filter((x) => x !== i))} className="hover:text-destructive" aria-label={`Remove ${i}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Button onClick={generate} disabled={loading} className="mt-5 bg-gradient-neural text-primary-foreground font-semibold">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cooking up ideas…</> : <><ChefHat className="h-4 w-4 mr-2" />Generate recipes</>}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {recipes.map((r, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-cyan">{r.time_min} min · {r.difficulty || "easy"}</span>
                <span className="font-mono text-xs text-neon">{r.calories} kcal</span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{r.title}</h3>
              <div className="text-xs text-muted-foreground mb-3">{r.ingredients.slice(0, 6).join(", ")}{r.ingredients.length > 6 ? "…" : ""}</div>
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                {r.steps.slice(0, 4).map((s, si) => <li key={si} className="line-clamp-2">{s}</li>)}
              </ol>
              <div className="mt-4 flex gap-3 text-xs font-mono text-muted-foreground border-t border-border/40 pt-3">
                <span>P <span className="text-foreground">{r.protein_g}g</span></span>
                {r.carbs_g != null && <span>C <span className="text-foreground">{r.carbs_g}g</span></span>}
                {r.fat_g != null && <span>F <span className="text-foreground">{r.fat_g}g</span></span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};