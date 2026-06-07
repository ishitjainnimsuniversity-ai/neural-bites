import { Flame, Droplets, Wheat, Beef, Apple, Activity, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { loadProfile, saveProfile, macros as macrosOf, dietChart, type Profile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SEED_PROFILE: Profile = {
  name: "", age: 25, sex: "male", weightKg: 70, heightCm: 170,
  goal: "general", intensity: "moderate", fastWindowHrs: 12,
};

const HYDRATION_TARGET_L = (p: Profile) => Math.max(2, Math.round((p.weightKg * 0.033) * 10) / 10);

/** Live consumption is read from localStorage so AI Mirror / Food Recognition can write into it. */
const liveKey = (k: string) => `nb.live.${k}.${new Date().toISOString().slice(0,10)}`;
const readLive = (k: string, fallback: number) => {
  try { const v = localStorage.getItem(liveKey(k)); return v == null ? fallback : Number(v); } catch { return fallback; }
};

export const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Profile>(profile ?? SEED_PROFILE);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onStorage = () => { setProfile(loadProfile()); setTick((t) => t + 1); };
    window.addEventListener("storage", onStorage);
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(id); };
  }, []);

  const p = profile;
  const m = useMemo(() => p ? macrosOf(p) : null, [p, tick]);
  const diet = useMemo(() => p ? dietChart(p) : null, [p, tick]);

  const kcalIn = readLive("kcal", 0);
  const proteinIn = readLive("protein", 0);
  const carbsIn = readLive("carbs", 0);
  const hydrationIn = readLive("hydration", 0);

  const macros = m && p ? [
    { label: "Calories", value: kcalIn, target: m.kcal, unit: "kcal", icon: Flame, color: "from-neon to-cyan" },
    { label: "Protein",  value: proteinIn, target: m.proteinG, unit: "g", icon: Beef, color: "from-cyan to-plasma" },
    { label: "Carbs",    value: carbsIn, target: m.carbG, unit: "g", icon: Wheat, color: "from-plasma to-neon" },
    { label: "Hydration",value: hydrationIn, target: HYDRATION_TARGET_L(p), unit: "L", icon: Droplets, color: "from-neon to-plasma" },
  ] : [];

  const save = () => {
    saveProfile(draft);
    setProfile(draft);
    setOpen(false);
  };

  return (
  <section id="dashboard" className="py-24 relative">
    <div className="container mx-auto px-4">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div className="max-w-xl">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Live dashboard</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            {p?.name ? <>{p.name.split(" ")[0]}&rsquo;s body, </> : <>Your body, </>}
            <span className="text-gradient">streaming.</span>
          </h2>
          {p ? (
            <p className="text-xs font-mono text-muted-foreground mt-2">
              {p.age} yrs · {p.sex} · {p.weightKg}kg · {p.heightCm}cm · goal: {p.goal} · fasting {p.fastWindowHrs ?? 12}h
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">Add your details to stream a real plan. No dummy numbers.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-full px-4 py-2 text-xs font-mono text-muted-foreground">
            <span className="inline-block w-2 h-2 bg-neon rounded-full mr-2 animate-pulse-glow" />
            Live · {new Date().toLocaleTimeString()}
          </div>
          <Button size="sm" variant="outline" onClick={() => { setDraft(profile ?? SEED_PROFILE); setOpen(true); }}>
            <UserCog className="h-4 w-4 mr-1" /> {profile ? "Edit profile" : "Set profile"}
          </Button>
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 md:p-10 border-glow">
        {!p ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground mb-4">Enter your name, age, weight and goal to see your live targets — calories, macros, hydration and a personalised 7-day diet.</p>
            <Button onClick={() => { setDraft(SEED_PROFILE); setOpen(true); }} className="bg-gradient-neural">Start tracking</Button>
          </div>
        ) : (
        <>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {macros.map((mc) => {
            const pct = Math.min(100, (mc.value / mc.target) * 100);
            return (
              <div key={mc.label} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <mc.icon className="h-5 w-5 text-neon" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{mc.label}</span>
                </div>
                <div className="font-display text-3xl font-bold">
                  {mc.value}<span className="text-base text-muted-foreground font-normal ml-1">/ {mc.target} {mc.unit}</span>
                </div>
                <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${mc.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-neon" /> Your weekly training</h3>
              <span className="text-xs font-mono text-muted-foreground">personalised</span>
            </div>
            <div className="space-y-4">
              {(diet ? [
                { name: "Daily calories", pct: m ? Math.min(100, Math.round((kcalIn / m.kcal) * 100)) : 0, label: m ? `${kcalIn} / ${m.kcal} kcal` : "" },
                { name: "Protein",        pct: m ? Math.min(100, Math.round((proteinIn / m.proteinG) * 100)) : 0, label: m ? `${proteinIn} / ${m.proteinG} g` : "" },
                { name: "Carbs",          pct: m ? Math.min(100, Math.round((carbsIn / m.carbG) * 100)) : 0, label: m ? `${carbsIn} / ${m.carbG} g` : "" },
                { name: "Hydration",      pct: p ? Math.min(100, Math.round((hydrationIn / HYDRATION_TARGET_L(p)) * 100)) : 0, label: p ? `${hydrationIn} / ${HYDRATION_TARGET_L(p)} L` : "" },
                { name: "Fasting window", pct: 100, label: `${diet.fastWindow} h` },
              ] : []).map((row) => (
                <div key={row.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{row.name}</span>
                    <span className="font-mono text-neon">{row.label}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-neural rounded-full relative"
                      style={{ width: `${row.pct}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,hsl(var(--neon-glow)/0.6),transparent)] bg-[length:200%_100%] animate-shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold flex items-center gap-2 mb-6"><Apple className="h-4 w-4 text-neon" /> Today&rsquo;s plate</h3>
            <ul className="space-y-3">
              {diet && (() => {
                const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
                const d = diet.days[todayIdx];
                const meals = [
                  { name: d.meal1, tag: "Breakfast" },
                  { name: d.meal2, tag: "Lunch" },
                  { name: d.meal3, tag: "Dinner" },
                  { name: d.snack, tag: "Snack" },
                ];
                return meals.map((b) => (
                  <li key={b.tag} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0">
                    <div>
                      <div className="text-sm font-medium">{b.name}</div>
                      <div className="text-[10px] font-mono uppercase text-cyan mt-0.5">{b.tag}</div>
                    </div>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your health profile</DialogTitle>
          <DialogDescription>Used to compute live calories, macros, hydration and your 7-day diet.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Aanya" /></div>
          <div><Label>Age</Label><Input type="number" value={draft.age} onChange={(e) => setDraft({ ...draft, age: +e.target.value || 0 })} /></div>
          <div><Label>Sex</Label>
            <Select value={draft.sex} onValueChange={(v) => setDraft({ ...draft, sex: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Weight (kg)</Label><Input type="number" value={draft.weightKg} onChange={(e) => setDraft({ ...draft, weightKg: +e.target.value || 0 })} /></div>
          <div><Label>Height (cm)</Label><Input type="number" value={draft.heightCm} onChange={(e) => setDraft({ ...draft, heightCm: +e.target.value || 0 })} /></div>
          <div><Label>Goal</Label>
            <Select value={draft.goal} onValueChange={(v) => setDraft({ ...draft, goal: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fat-loss">Fat loss</SelectItem>
                <SelectItem value="muscle">Muscle</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="rehab">Rehab</SelectItem>
                <SelectItem value="general">General health</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Intensity</Label>
            <Select value={draft.intensity} onValueChange={(v) => setDraft({ ...draft, intensity: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="slow">Slow</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="rapid">Rapid</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Fasting window (h)</Label><Input type="number" value={draft.fastWindowHrs ?? 12} onChange={(e) => setDraft({ ...draft, fastWindowHrs: +e.target.value || 12 })} /></div>
        </div>
        <Button className="bg-gradient-neural mt-3" onClick={save} disabled={!draft.name.trim() || !draft.age || !draft.weightKg || !draft.heightCm}>Save profile</Button>
      </DialogContent>
    </Dialog>
  </section>
  );
};