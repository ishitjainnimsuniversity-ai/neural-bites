import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { tdee } from "@/lib/api";
import { Dumbbell, Flame, Radio } from "lucide-react";
import { loadProfile } from "@/lib/profile";
import { loadSessions, dailyKcalSeries, sessionTotals } from "@/lib/sessionHistory";

export const Fitness = () => {
  const seed = loadProfile();
  const [age, setAge] = useState(String(seed?.age ?? 28));
  const [gender, setGender] = useState<"male" | "female">(seed?.sex ?? "male");
  const [weight, setWeight] = useState(String(seed?.weightKg ?? 70));
  const [height, setHeight] = useState(String(seed?.heightCm ?? 175));
  const [activity, setActivity] = useState("1.55");
  const [tick, setTick] = useState(0);

  // Live-sync to body-streaming writes: profile changes + session writes + per-minute tick.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "nb.profile.v1") {
        const p = loadProfile();
        if (p) {
          setAge(String(p.age));
          setGender(p.sex);
          setWeight(String(p.weightKg));
          setHeight(String(p.heightCm));
        }
      }
      if (e.key.startsWith("nb.sessions") || e.key.startsWith("nb.live.")) setTick((t) => t + 1);
    };
    window.addEventListener("storage", onStorage);
    const onLocal = () => setTick((t) => t + 1);
    window.addEventListener("nb:session", onLocal);
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("nb:session", onLocal);
      clearInterval(id);
    };
  }, []);

  const target = useMemo(
    () => tdee(+age || 0, gender, +weight || 0, +height || 0, +activity),
    [age, gender, weight, height, activity],
  );

  // Live weekly calories from real session history; overlay TDEE target line.
  const weeklyProgress = useMemo(() => {
    const sessions = loadSessions();
    const series = dailyKcalSeries(7, sessions);
    return series.map((s) => ({ d: s.day, kcal: s.kcal, target }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, tick]);

  // Live workouts: aggregate kcal + minutes per exercise from the last 14 days.
  const workouts = useMemo(() => {
    const since = Date.now() - 14 * 86400000;
    const map = new Map<string, { name: string; kcal: number; min: number }>();
    for (const r of loadSessions()) {
      if (new Date(r.at).getTime() < since) continue;
      const cur = map.get(r.exercise) ?? { name: r.exercise, kcal: 0, min: 0 };
      cur.kcal += r.kcal;
      cur.min += Math.round((r.seconds || 0) / 60);
      map.set(r.exercise, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.kcal - a.kcal)
      .slice(0, 6)
      .map((w) => ({ ...w, kcal: Math.round(w.kcal) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const totals = useMemo(() => sessionTotals(loadSessions()), [tick]);
  const hasLive = workouts.length > 0;

  return (
    <section id="fitness" className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Fitness</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Train. Track. <span className="text-gradient">Transform.</span></h2>
            <p className="text-sm text-muted-foreground mt-2">Live from your body-streaming sessions — kcal burned, minutes trained and TDEE update in real time.</p>
          </div>
          <div className="glass rounded-full px-4 py-2 text-xs font-mono text-muted-foreground flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-neon animate-pulse-glow" />
            {hasLive ? (
              <>Live · today {totals.today.kcal} kcal · {totals.today.reps} reps · {Math.round(totals.today.seconds / 60)} min</>
            ) : (
              <>Waiting for first AI-Mirror session…</>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="glass-strong rounded-3xl p-6 border-glow">
            <div className="flex items-center gap-2 mb-3"><Flame className="h-5 w-5 text-neon" /><h3 className="font-display font-semibold">Daily target</h3></div>
            <div className="font-display text-5xl font-bold text-gradient">{target}</div>
            <div className="text-xs font-mono uppercase text-muted-foreground mb-5">kcal · TDEE</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Age</Label><Input value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 bg-input/50 h-9" /></div>
                <div>
                  <Label className="text-xs">Gender</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as any)}>
                    <SelectTrigger className="mt-1 bg-input/50 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Weight kg</Label><Input value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 bg-input/50 h-9" /></div>
                <div><Label className="text-xs">Height cm</Label><Input value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 bg-input/50 h-9" /></div>
              </div>
              <div>
                <Label className="text-xs">Activity</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger className="mt-1 bg-input/50 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.2">Sedentary</SelectItem>
                    <SelectItem value="1.375">Light</SelectItem>
                    <SelectItem value="1.55">Moderate</SelectItem>
                    <SelectItem value="1.725">Heavy</SelectItem>
                    <SelectItem value="1.9">Athlete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 lg:col-span-2">
            <h3 className="font-display font-semibold mb-4">Weekly calories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgress}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="kcal" stroke="hsl(var(--neon))" strokeWidth={3} dot={{ fill: "hsl(var(--neon))", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-neon" /><h3 className="font-display font-semibold">Your workouts · last 14 days</h3></div>
              <span className="text-xs font-mono text-muted-foreground">{totals.week.kcal} kcal · {Math.round(totals.week.seconds / 60)} min this week</span>
            </div>
            {hasLive ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workouts}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Bar dataKey="kcal" fill="hsl(var(--neon))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-center text-sm text-muted-foreground">
                Run a drill in <span className="text-neon mx-1">AI Mirror</span> — your real workouts will stream here.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};