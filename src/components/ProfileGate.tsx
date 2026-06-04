import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Profile, saveProfile, loadProfile } from "@/lib/profile";
import { toast } from "sonner";
import { Upload } from "lucide-react";

type Props = { open: boolean; onClose: (p: Profile | null) => void };

export const ProfileGate = ({ open, onClose }: Props) => {
  const existing = loadProfile();
  const [p, setP] = useState<Profile>(existing ?? {
    name: "", age: 25, sex: "male", weightKg: 70, heightCm: 170,
    goal: "fat-loss", intensity: "moderate", targetFatLossKg: 5, fastWindowHrs: 12,
  });

  const upd = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((s) => ({ ...s, [k]: v }));

  const onPhoto = (f?: File) => {
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) { toast.error("Photo must be under 3 MB"); return; }
    const r = new FileReader();
    r.onload = () => upd("photoDataUrl", r.result as string);
    r.readAsDataURL(f);
  };

  const submit = () => {
    if (!p.name.trim()) return toast.error("Enter your name");
    if (!(p.age > 0 && p.age < 120)) return toast.error("Valid age required");
    if (!(p.weightKg > 20 && p.weightKg < 400)) return toast.error("Valid weight required");
    if (!(p.heightCm > 80 && p.heightCm < 260)) return toast.error("Valid height required");
    saveProfile(p);
    toast.success(`Profile saved. Welcome, ${p.name.split(" ")[0]}!`);
    onClose(p);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your fitness prescription</DialogTitle>
          <DialogDescription>Coach Nova uses this to build your live workout, diet chart, and on-screen HUD.</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="md:col-span-2 flex items-center gap-4">
            <label className="w-20 h-20 rounded-full bg-muted border border-primary/30 flex items-center justify-center overflow-hidden cursor-pointer">
              {p.photoDataUrl
                ? <img src={p.photoDataUrl} alt="" className="w-full h-full object-cover" />
                : <Upload className="h-6 w-6 text-muted-foreground" />}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
            <div className="text-xs text-muted-foreground">Tap the circle to upload a real photo (stays on this device).</div>
          </div>
          <div>
            <Label>Name</Label>
            <Input value={p.name} onChange={(e) => upd("name", e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" value={p.age} onChange={(e) => upd("age", +e.target.value)} />
          </div>
          <div>
            <Label>Sex</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={p.sex} onChange={(e) => upd("sex", e.target.value as any)}>
              <option value="male">Male</option><option value="female">Female</option>
            </select>
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={p.weightKg} onChange={(e) => upd("weightKg", +e.target.value)} />
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Input type="number" value={p.heightCm} onChange={(e) => upd("heightCm", +e.target.value)} />
          </div>
          <div>
            <Label>Goal</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={p.goal} onChange={(e) => upd("goal", e.target.value as any)}>
              <option value="fat-loss">Lose fat</option>
              <option value="muscle">Build muscle</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility / Yoga</option>
              <option value="rehab">Rehab / Mobility</option>
              <option value="general">General fitness</option>
            </select>
          </div>
          <div>
            <Label>How fast?</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={p.intensity} onChange={(e) => upd("intensity", e.target.value as any)}>
              <option value="rapid">Rapid (aggressive)</option>
              <option value="moderate">Moderate (sustainable)</option>
              <option value="slow">Slow (gentle)</option>
            </select>
          </div>
          {p.goal === "fat-loss" && (
            <div>
              <Label>Target fat to lose (kg)</Label>
              <Input type="number" value={p.targetFatLossKg ?? 0} onChange={(e) => upd("targetFatLossKg", +e.target.value)} />
            </div>
          )}
          <div>
            <Label>Daily fasting window (hrs)</Label>
            <Input type="number" value={p.fastWindowHrs ?? 12} onChange={(e) => upd("fastWindowHrs", +e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onClose(null)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-neural">Save & continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};