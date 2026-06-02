import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { invokeFn } from "@/lib/api";
import { Loader2, Salad, Utensils } from "lucide-react";

interface Meal { name: string; slot: string; calories: number; protein_g: number; ingredients: string[]; }
interface Day { day: string; meals: Meal[]; }
interface Plan { daily_calories: number; daily_protein_g: number; rationale: string; days: Day[]; }

export const DietPlanner = () => {
  const [age, setAge] = useState("28");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [goal, setGoal] = useState("maintain");
  const [diet, setDiet] = useState("balanced");
  const [allergies, setAllergies] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await invokeFn<Plan>("diet-planner", {
        age: +age, gender, weightKg: +weight, heightCm: +height,
        goal, dietStyle: diet, allergies,
      });
      setPlan(r);
      toast.success("Meal plan ready");
    } catch (e: any) { toast.error(e.message || "Failed to generate"); }
    finally { setLoading(false); }
  };

  return (
    <section id="diet" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Planning</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Personalized <span className="text-gradient">diet planner</span>.</h2>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <div className="glass rounded-3xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Age</Label><Input value={age} onChange={(e) => setAge(e.target.value)} className="mt-1.5 bg-input/50" /></div>
              <div>
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mt-1.5 bg-input/50"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Weight (kg)</Label><Input value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1.5 bg-input/50" /></div>
              <div><Label>Height (cm)</Label><Input value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1.5 bg-input/50" /></div>
            </div>
            <div>
              <Label>Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="mt-1.5 bg-input/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Lose fat</SelectItem>
                  <SelectItem value="maintain">Maintain</SelectItem>
                  <SelectItem value="gain">Build muscle</SelectItem>
                  <SelectItem value="performance">Athletic performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Diet style</Label>
              <Select value={diet} onValueChange={setDiet}>
                <SelectTrigger className="mt-1.5 bg-input/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="high-protein">High protein</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Allergies / dislikes</Label><Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. peanuts, shellfish" className="mt-1.5 bg-input/50" /></div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-neural text-primary-foreground font-semibold">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : <><Salad className="h-4 w-4 mr-2" />Generate plan</>}
            </Button>
          </div>

          <div className="glass-strong rounded-3xl p-6 md:p-8 border-glow min-h-[400px]">
            {!plan && !loading && <p className="text-muted-foreground text-center mt-20">Your custom 3-day plan will appear here.</p>}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />)}
              </div>
            )}
            {plan && (
              <div className="animate-fade-in space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4"><div className="text-[10px] font-mono uppercase text-muted-foreground">Daily kcal</div><div className="font-display text-3xl font-bold text-gradient">{plan.daily_calories}</div></div>
                  <div className="glass rounded-xl p-4"><div className="text-[10px] font-mono uppercase text-muted-foreground">Protein</div><div className="font-display text-3xl font-bold text-gradient">{plan.daily_protein_g}g</div></div>
                </div>
                <p className="text-sm text-muted-foreground italic">{plan.rationale}</p>
                <div className="space-y-5">
                  {plan.days.map((d, di) => (
                    <div key={di}>
                      <h4 className="font-display font-semibold mb-2 flex items-center gap-2"><Utensils className="h-4 w-4 text-neon" />{d.day}</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {d.meals.map((m, mi) => (
                          <div key={mi} className="glass rounded-xl p-4">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <div className="text-[10px] font-mono uppercase text-cyan">{m.slot}</div>
                                <div className="font-semibold">{m.name}</div>
                              </div>
                              <div className="font-mono text-xs text-neon">{m.calories} kcal · {m.protein_g}g P</div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">{m.ingredients.join(" · ")}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};