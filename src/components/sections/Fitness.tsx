import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { tdee } from "@/lib/api";
import { Dumbbell, Flame } from "lucide-react";

const weeklyProgress = [
  { d: "Mon", kcal: 1880, target: 2200 },
  { d: "Tue", kcal: 2140, target: 2200 },
  { d: "Wed", kcal: 1920, target: 2200 },
  { d: "Thu", kcal: 2310, target: 2200 },
  { d: "Fri", kcal: 2050, target: 2200 },
  { d: "Sat", kcal: 2480, target: 2200 },
  { d: "Sun", kcal: 1990, target: 2200 },
];

const workouts = [
  { name: "HIIT Cardio", kcal: 420, min: 25 },
  { name: "Strength Upper", kcal: 310, min: 45 },
  { name: "Yoga Flow", kcal: 180, min: 40 },
  { name: "Zone-2 Run", kcal: 520, min: 50 },
];

export const Fitness = () => {
  const [age, setAge] = useState("28");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [activity, setActivity] = useState("1.55");

  const target = useMemo(() => tdee(+age, gender, +weight, +height, +activity), [age, gender, weight, height, activity]);

  return (
    <section id="fitness" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Fitness</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Train. Track. <span className="text-gradient">Transform.</span></h2>
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
            <div className="flex items-center gap-2 mb-4"><Dumbbell className="h-5 w-5 text-neon" /><h3 className="font-display font-semibold">Recommended workouts</h3></div>
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
          </div>
        </div>
      </div>
    </section>
  );
};