import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2, Play, Square, Volume2, VolumeX, Flame, AlertCircle, RefreshCcw, User, Activity, Heart, UserCog, Pause, Trash2, FileDown, ShieldCheck, Eye } from "lucide-react";
import { toast } from "sonner";
import { invokeFn } from "@/lib/api";
import coachNova from "@/assets/coach-nova.jpg";
import { ProfileGate } from "@/components/ProfileGate";
import { Profile, loadProfile, ageGroup, dietChart, weeklyPlan } from "@/lib/profile";
import { cloudLoadProfile } from "@/lib/cloudSync";
import { useSession } from "@/hooks/useSession";
import { saveSession, loadSessions, dailyKcalSeries, sessionTotals, clearSessions } from "@/lib/sessionHistory";
import { downloadDietPdf } from "@/lib/dietPdf";

type Exercise = {
  id: string;
  name: string;
  kcalPerMin: number;
  cue: string;
  tempoSec: number;
  category: "fat-loss" | "muscle" | "endurance" | "flexibility" | "rehab";
  minAge?: number;
  maxAge?: number;
};

const EXERCISES: Exercise[] = [
  { id: "jumping-jacks", name: "Jumping Jacks", kcalPerMin: 10, tempoSec: 1, cue: "Light feet. Land soft, arms reach overhead.", category: "fat-loss" },
  { id: "high-knees",    name: "High Knees",    kcalPerMin: 12, tempoSec: 1, cue: "Drive knees to hip height. Stay tall.", category: "fat-loss", maxAge: 59 },
  { id: "burpees",       name: "Burpees",       kcalPerMin: 14, tempoSec: 3, cue: "Chest to floor, explosive jump up.", category: "fat-loss", maxAge: 49 },
  { id: "mountain",      name: "Mountain Climbers", kcalPerMin: 11, tempoSec: 1, cue: "Hips low, fast alternating knees.", category: "fat-loss" },
  { id: "shadow-box",    name: "Shadow Boxing", kcalPerMin: 10, tempoSec: 1, cue: "Chin tucked, rotate hips, snap punches back.", category: "fat-loss" },
  { id: "squats",   name: "Air Squats",    kcalPerMin: 8, tempoSec: 2, cue: "Hips back, chest proud, knees tracking toes.", category: "muscle" },
  { id: "lunges",   name: "Reverse Lunges", kcalPerMin: 8, tempoSec: 2, cue: "Step back, both knees to 90°.", category: "muscle" },
  { id: "pushups",  name: "Push-Ups",      kcalPerMin: 9, tempoSec: 2, cue: "Tight core, elbows 45°, full range.", category: "muscle" },
  { id: "plank",    name: "Plank Hold",    kcalPerMin: 5, tempoSec: 4, cue: "Glutes squeezed, ribs down, neutral neck.", category: "muscle" },
  { id: "march",    name: "On-Spot Marching", kcalPerMin: 6, tempoSec: 1, cue: "Steady rhythm, arms swing naturally.", category: "endurance" },
  { id: "step-up",  name: "Step-Ups",      kcalPerMin: 9, tempoSec: 2, cue: "Drive through whole foot, soft landing.", category: "endurance" },
  { id: "surya",    name: "Surya Namaskar", kcalPerMin: 6, tempoSec: 6, cue: "Inhale up, exhale down. One breath per move.", category: "flexibility" },
  { id: "cat-cow",  name: "Cat-Cow Flow",   kcalPerMin: 3, tempoSec: 4, cue: "Inhale arch, exhale round. Move with breath.", category: "flexibility" },
  { id: "anulom",   name: "Anulom-Vilom",   kcalPerMin: 2, tempoSec: 6, cue: "Alternate nostril breathing. Slow and even.", category: "flexibility" },
  { id: "chair-sq", name: "Chair Squats",   kcalPerMin: 5, tempoSec: 3, cue: "Hands on hips, sit back, stand tall.", category: "rehab" },
  { id: "wall-pu",  name: "Wall Push-Ups",  kcalPerMin: 4, tempoSec: 2, cue: "Body straight, slow control.", category: "rehab" },
  { id: "ankle",    name: "Ankle Circles",  kcalPerMin: 2, tempoSec: 3, cue: "Seated. 10 each direction.", category: "rehab" },
];

type PermState = "unknown" | "prompt" | "granted" | "denied";

export const AIMirror = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const coachTimer = useRef<number | null>(null);
  const tickTimer = useRef<number | null>(null);
  const motionTimer = useRef<number | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const repCooldown = useRef<number>(0);

  const [perm, setPerm] = useState<PermState>("unknown");
  const [permError, setPermError] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(loadProfile());
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useSession();
  useEffect(() => {
    if (!user) return;
    if (profile) return;
    cloudLoadProfile().then((p) => {
      if (p) {
        localStorage.setItem("nb.profile.v1", JSON.stringify(p));
        setProfile(p);
      }
    }).catch(() => { /* ignore */ });
  }, [user?.id]); // eslint-disable-line
  const [category, setCategory] = useState<Exercise["category"]>("fat-loss");
  const [exercise, setExercise] = useState<Exercise>(EXERCISES[0]);
  const [training, setTraining] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [reps, setReps] = useState(0);
  const [coachMsg, setCoachMsg] = useState<string>("Save your profile, pick a drill, and I'll watch your form live.");
  const [thinking, setThinking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activity, setActivity] = useState({ upper: 0, core: 0, lower: 0, total: 0 });
  const [heartZone, setHeartZone] = useState(1);
  const [paused, setPaused] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [calibrated, setCalibrated] = useState<boolean>(() => localStorage.getItem("nb.calibrated.v1") === "1");
  const [calibStatus, setCalibStatus] = useState<{ light: number; ok: boolean; note: string } | null>(null);
  const [zonePeak, setZonePeakState] = useState(1);
  const [historyTick, setHistoryTick] = useState(0);
  const refreshHistory = () => setHistoryTick((t) => t + 1);

  const filtered = EXERCISES.filter((ex) => {
    if (ex.category !== category) return false;
    if (!profile) return true;
    if (ex.minAge != null && profile.age < ex.minAge) return false;
    if (ex.maxAge != null && profile.age > ex.maxAge) return false;
    return true;
  });
  useEffect(() => { if (filtered.length && !filtered.find((x) => x.id === exercise.id)) setExercise(filtered[0]); }, [category, profile]); // eslint-disable-line

  const isSecure = typeof window !== "undefined" && (window.isSecureContext || location.hostname === "localhost");
  const hasCam = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const refreshPerm = async () => {
    try {
      // @ts-ignore
      const status = await navigator.permissions?.query?.({ name: "camera" as PermissionName });
      if (status) {
        setPerm(status.state as PermState);
        status.onchange = () => setPerm(status.state as PermState);
      }
    } catch {}
  };
  useEffect(() => { refreshPerm(); }, []);
  useEffect(() => () => { stopAll(); }, []); // eslint-disable-line

  const stopAll = () => {
    if (coachTimer.current) { clearInterval(coachTimer.current); coachTimer.current = null; }
    if (tickTimer.current)  { clearInterval(tickTimer.current);  tickTimer.current = null; }
    if (motionTimer.current){ clearInterval(motionTimer.current);motionTimer.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    try { window.speechSynthesis?.cancel(); } catch {}
    prevFrameRef.current = null;
  };

  const speak = (text: string) => {
    if (muted) return;
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const fem = voices.find((v) => /female|samantha|victoria|zira|google uk english female|karen/i.test(v.name));
    if (fem) u.voice = fem;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const startCamera = async () => {
    setPermError("");
    if (!isSecure) { const m = "Camera requires HTTPS or localhost."; setPermError(m); toast.error(m); return false; }
    if (!hasCam)   { const m = "Your browser doesn't support webcam access."; setPermError(m); toast.error(m); return false; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamOn(true);
      setPerm("granted");
      return true;
    } catch (err: any) {
      const name = err?.name || "";
      const m = name === "NotAllowedError" || name === "SecurityError"
        ? "Camera permission denied. Allow camera access in your browser site settings and click Retry."
        : name === "NotFoundError" ? "No camera found. Plug one in and retry."
        : name === "NotReadableError" ? "Camera is in use by another app. Close it and retry."
        : "Couldn't access the camera. Check browser permissions.";
      setPerm("denied"); setPermError(m); toast.error(m);
      return false;
    }
  };

  const stopCamera = () => { stopAll(); setCamOn(false); setTraining(false); };

  const captureFrame = (): string | null => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c || !v.videoWidth) return null;
    c.width = 384; c.height = Math.round(384 * (v.videoHeight / v.videoWidth));
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7);
  };

  const sampleMotion = () => {
    const v = videoRef.current, c = motionRef.current;
    if (!v || !c || !v.videoWidth) return;
    const W = 96, H = Math.round(96 * (v.videoHeight / v.videoWidth));
    c.width = W; c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, W, H);
    const cur = ctx.getImageData(0, 0, W, H);
    const prev = prevFrameRef.current;
    prevFrameRef.current = cur;
    if (!prev) return;
    let upper = 0, core = 0, lower = 0;
    const third = Math.floor(H / 3);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const d = Math.abs(cur.data[i] - prev.data[i]) + Math.abs(cur.data[i+1] - prev.data[i+1]) + Math.abs(cur.data[i+2] - prev.data[i+2]);
        if (d > 38) {
          if (y < third) upper++;
          else if (y < third * 2) core++;
          else lower++;
        }
      }
    }
    const norm = (n: number) => Math.min(100, Math.round((n / (W * third)) * 450));
    const u = norm(upper), c1 = norm(core), l = norm(lower);
    const total = Math.round((u + c1 + l) / 3);
    // Smoothing
    setActivity((prev) => ({
      upper: Math.round(prev.upper * 0.6 + u * 0.4),
      core:  Math.round(prev.core  * 0.6 + c1 * 0.4),
      lower: Math.round(prev.lower * 0.6 + l * 0.4),
      total: Math.round(prev.total * 0.6 + total * 0.4),
    }));
    const z = total > 75 ? 5 : total > 55 ? 4 : total > 35 ? 3 : total > 15 ? 2 : 1;
    setHeartZone(z);
    setZonePeakState((p) => Math.max(p, z));
    const now = Date.now();
    if (total > 40 && now - repCooldown.current > exercise.tempoSec * 1000 * 0.7) {
      repCooldown.current = now;
      setReps((r) => r + 1);
    }
  };

  const askCoach = async (phase: string) => {
    if (paused) return;
    setThinking(true);
    try {
      const image = captureFrame();
      if (image) setLastSnapshot(image);
      const r = await invokeFn<{ answer: string }>("ai-coach", {
        exercise: exercise.name, image, phase,
        profile: profile ? { name: profile.name, age: profile.age, goal: profile.goal, intensity: profile.intensity } : undefined,
      });
      const who = profile?.name?.split(" ")[0];
      const personalised = who && !r.answer.toLowerCase().includes(who.toLowerCase()) && phase === "intro"
        ? `${who}, ${r.answer}` : r.answer;
      setCoachMsg(personalised); speak(personalised);
    } catch {
      setCoachMsg(exercise.cue); speak(exercise.cue);
    } finally { setThinking(false); }
  };

  /** One-time calibration: brightness average from a single frame. */
  const runCalibration = async () => {
    if (!camOn) { const ok = await startCamera(); if (!ok) return; }
    setTimeout(() => {
      const v = videoRef.current, c = motionRef.current;
      if (!v || !c || !v.videoWidth) return;
      const W = 96, H = Math.round(96 * (v.videoHeight / v.videoWidth));
      c.width = W; c.height = H;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, W, H);
      const img = ctx.getImageData(0, 0, W, H);
      let lum = 0;
      for (let i = 0; i < img.data.length; i += 4) {
        lum += 0.299 * img.data[i] + 0.587 * img.data[i+1] + 0.114 * img.data[i+2];
      }
      const avg = lum / (img.data.length / 4);
      const ok = avg > 55 && avg < 220;
      const note = avg < 55 ? "Too dark — add a light in front of you." :
                   avg > 220 ? "Too bright — reduce backlight (move away from window)." :
                   "Lighting & framing look good. Step back so your hips and knees are in frame.";
      setCalibStatus({ light: Math.round(avg), ok, note });
      if (ok) {
        localStorage.setItem("nb.calibrated.v1", "1");
        setCalibrated(true);
        toast.success("Calibration passed");
      } else {
        toast.error("Calibration needs adjustment");
      }
    }, 600);
  };

  const startTraining = async () => {
    if (!profile) { setShowProfile(true); toast.message("Save your profile first."); return; }
    if (!camOn) { const ok = await startCamera(); if (!ok) return; }
    if (!calibrated) { toast.message("Run a quick camera calibration first."); await runCalibration(); return; }
    setSeconds(0); setReps(0); setZonePeakState(1); setTraining(true); prevFrameRef.current = null;
    askCoach("intro");
    tickTimer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    motionTimer.current = window.setInterval(sampleMotion, 250);
    coachTimer.current = window.setInterval(() => askCoach("active"), 8000);
  };

  const stopTraining = () => {
    if (coachTimer.current) { clearInterval(coachTimer.current); coachTimer.current = null; }
    if (tickTimer.current)  { clearInterval(tickTimer.current);  tickTimer.current = null; }
    if (motionTimer.current){ clearInterval(motionTimer.current);motionTimer.current = null; }
    setTraining(false);
    const who = profile?.name?.split(" ")[0] ?? "champ";
    const summary = `Great work ${who} — ${Math.round(reps)} reps of ${exercise.name} in ${seconds}s. About ${kcal.toFixed(1)} kcal burned. Hydrate and breathe.`;
    setCoachMsg(summary); speak(summary);
    saveSession({
      at: new Date().toISOString(),
      exercise: exercise.name,
      reps: Math.round(reps), kcal: +kcal.toFixed(1),
      seconds, zonePeak,
    });
    window.dispatchEvent(new CustomEvent("nb:session"));
    refreshHistory();
  };

  const kcal = (exercise.kcalPerMin * seconds) / 60;
  const grp = profile ? ageGroup(profile.age) : null;
  const plan = profile ? weeklyPlan(profile) : null;
  const diet = profile ? dietChart(profile) : null;

  return (
    <section id="mirror" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// AI Mirror</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">Train with a <span className="text-gradient">live AI coach.</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Coach Nova sees you through your webcam, tracks your real movement, and prescribes workouts + diet from your profile.</p>
        </div>

        <ProfileGate open={showProfile} onClose={(p) => { setShowProfile(false); if (p) setProfile(p); }} />

        {/* Calibration banner */}
        {camOn && (
          <div className={`glass rounded-2xl p-3 mb-4 flex items-center gap-3 border ${calibrated ? "border-neon/30" : "border-cyan/40"}`}>
            <ShieldCheck className={`h-5 w-5 ${calibrated ? "text-neon" : "text-cyan"} shrink-0`} />
            <div className="flex-1 text-xs">
              <div className="font-semibold">{calibrated ? "Camera calibrated" : "Quick calibration recommended"}</div>
              <div className="text-muted-foreground">{calibStatus?.note ?? "One-time check for lighting & framing accuracy."}</div>
            </div>
            <Button size="sm" variant="outline" onClick={runCalibration}>Run check</Button>
          </div>
        )}

        {(perm === "denied" || permError) && (
          <div className="glass rounded-2xl border border-destructive/50 p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <div className="font-semibold text-destructive">Camera access blocked</div>
              <div className="text-muted-foreground">{permError || "Allow camera access in your browser site settings, then click Retry."}</div>
            </div>
            <Button size="sm" variant="outline" onClick={startCamera}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Retry permission
            </Button>
          </div>
        )}

        <div className="glass rounded-2xl p-3 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border border-primary/30 flex items-center justify-center">
            {profile?.photoDataUrl ? <img src={profile.photoDataUrl} alt={profile.name} className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            {profile ? (
              <>
                <div className="font-semibold text-sm truncate">{profile.name} · {profile.age} · {profile.sex}</div>
                <div className="text-xs text-muted-foreground truncate">{profile.weightKg}kg · {profile.heightCm}cm · goal: {profile.goal} · {profile.intensity} · group: {grp}</div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No profile yet — save one to unlock your prescription, HUD and diet chart.</div>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowProfile(true)}>
            <UserCog className="h-4 w-4 mr-2" /> {profile ? "Edit" : "Create"} profile
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass-strong rounded-3xl p-4 border-glow lg:col-span-2">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="font-mono text-xs uppercase tracking-widest text-cyan">// Live body stream</div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setMuted((m) => !m)} aria-label="Toggle voice">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-neon" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setPaused((p) => !p); toast.message(paused ? "AI snapshots resumed" : "AI snapshots paused"); }} aria-label="Pause AI">
                  {paused ? <Play className="h-4 w-4 text-cyan" /> : <Pause className="h-4 w-4" />}
                </Button>
                {camOn
                  ? <Button size="sm" variant="outline" onClick={stopCamera}><CameraOff className="h-4 w-4 mr-2" />Stop cam</Button>
                  : <Button size="sm" onClick={startCamera} className="bg-gradient-neural"><Camera className="h-4 w-4 mr-2" />Enable camera</Button>}
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-background/60 border border-primary/20">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              {!camOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Camera className="h-10 w-10 opacity-60" />
                  <div className="text-sm">Camera preview will appear here</div>
                </div>
              )}
              {profile && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/70 backdrop-blur rounded-xl px-2 py-1.5 border border-primary/30">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                    {profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="" className="w-full h-full object-cover" /> : <User className="h-4 w-4 m-2 text-muted-foreground" />}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[11px] font-semibold">{profile.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">age {profile.age} · {profile.weightKg}kg</div>
                  </div>
                </div>
              )}
              {training && (
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="px-2 py-1 rounded-md bg-destructive/80 text-[10px] font-mono uppercase tracking-widest animate-pulse">● LIVE</span>
                  <span className="px-2 py-1 rounded-md bg-background/70 text-[10px] font-mono">{seconds}s</span>
                  <span className="px-2 py-1 rounded-md bg-background/70 text-[10px] font-mono">{Math.round(reps)} reps</span>
                  <span className="px-2 py-1 rounded-md bg-background/70 text-[10px] font-mono flex items-center gap-1"><Flame className="h-3 w-3 text-plasma" />{kcal.toFixed(1)} kcal</span>
                </div>
              )}
              {camOn && (
                <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
                  {(["upper","core","lower"] as const).map((k) => (
                    <div key={k} className="bg-background/60 backdrop-blur rounded-md px-2 py-1 border border-primary/20">
                      <div className="text-[9px] font-mono uppercase text-muted-foreground">{k}</div>
                      <div className="h-1.5 rounded bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-neural transition-all" style={{ width: `${activity[k]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {training && (
                <div className="absolute bottom-14 right-3 px-2 py-1 rounded-md bg-background/70 backdrop-blur text-[10px] font-mono flex items-center gap-1 border border-primary/20">
                  <Heart className="h-3 w-3 text-destructive" /> Zone {heartZone}/5 <span className="opacity-60">(est.)</span>
                </div>
              )}
              {training && (() => {
                // Form overlay: detect imbalance vs expected exercise zones.
                let hint = "";
                const { upper, core, lower } = activity;
                if (exercise.category === "muscle" && /squat|lunge|step/i.test(exercise.name) && lower < 25) hint = "Drive deeper through your legs — drop the hips.";
                else if (/push|plank/i.test(exercise.name) && core < 20) hint = "Brace core — ribs down, glutes squeezed.";
                else if (exercise.category === "fat-loss" && upper < 15 && lower < 15) hint = "Need more movement — pick up the pace.";
                else if (upper > 70 && lower < 10 && exercise.category !== "flexibility") hint = "Engage your legs — don't rely on arms only.";
                if (!hint) return null;
                return (
                  <div className="absolute inset-x-3 bottom-24 pointer-events-none">
                    <div className="mx-auto max-w-md glass border border-destructive/40 rounded-xl px-3 py-2 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      <span><span className="font-mono text-destructive uppercase mr-1">Form</span>{hint}</span>
                    </div>
                    <svg viewBox="0 0 200 120" className="mx-auto mt-2 w-40 h-20 opacity-70">
                      <circle cx="100" cy="22" r="10" fill="hsl(var(--neon))" />
                      <line x1="100" y1="32" x2="100" y2="72" stroke="hsl(var(--neon))" strokeWidth="3" />
                      <line x1="100" y1="42" x2="70" y2="62" stroke="hsl(var(--cyan))" strokeWidth="3" />
                      <line x1="100" y1="42" x2="130" y2="62" stroke="hsl(var(--cyan))" strokeWidth="3" />
                      <line x1="100" y1="72" x2="78" y2="105" stroke="hsl(var(--destructive))" strokeWidth="3" />
                      <line x1="100" y1="72" x2="122" y2="105" stroke="hsl(var(--destructive))" strokeWidth="3" />
                    </svg>
                  </div>
                );
              })()}
              <canvas ref={canvasRef} className="hidden" />
              <canvas ref={motionRef} className="hidden" />
            </div>

            <div className="glass rounded-2xl p-4 mt-4 flex items-start gap-3">
              <div className={`relative w-14 h-14 rounded-2xl overflow-hidden border ${speaking ? "border-neon shadow-[0_0_24px_hsl(var(--neon)/0.45)]" : "border-primary/30"}`}>
                <img src={coachNova} alt="Coach Nova, AI fitness teacher" className="w-full h-full object-cover" loading="lazy" />
                {speaking && <div className="absolute inset-x-0 bottom-0 h-1.5 bg-neon animate-pulse" />}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase text-neon flex items-center gap-1">Coach Nova · AI teacher {thinking && <Loader2 className="h-3 w-3 animate-spin" />}</div>
                <div className="text-sm mt-1">{coachMsg}</div>
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-5 border-glow">
            <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Program</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(["fat-loss","muscle","endurance","flexibility","rehab"] as const).map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`text-[11px] px-2.5 py-1 rounded-full border ${category === c ? "bg-neon/15 border-neon text-foreground" : "border-primary/20 text-muted-foreground hover:border-primary/50"}`}>{c}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {filtered.map((ex) => (
                <button key={ex.id} onClick={() => setExercise(ex)}
                  className={`text-left rounded-xl p-3 border text-sm transition-all ${exercise.id === ex.id ? "border-neon bg-neon/10" : "border-primary/20 hover:border-primary/50"}`}>
                  <div className="font-semibold">{ex.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3 text-plasma" />{ex.kcalPerMin} kcal/min</div>
                </button>
              ))}
              {filtered.length === 0 && <div className="text-xs text-muted-foreground col-span-2">No drills match your age band — pick another category.</div>}
            </div>
            <div className="text-xs text-muted-foreground mb-4">{exercise.cue}</div>
            {training ? (
              <Button onClick={stopTraining} variant="destructive" className="w-full"><Square className="h-4 w-4 mr-2" />End session</Button>
            ) : (
              <Button onClick={startTraining} className="w-full bg-gradient-neural"><Play className="h-4 w-4 mr-2" />Start training</Button>
            )}
            <p className="text-[11px] text-muted-foreground mt-3 text-center">Video stays on-device. Frames sent only as private snapshots for AI coaching.</p>
          </div>
        </div>

        {profile && plan && diet && (
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div className="glass-strong rounded-3xl p-5 border-glow">
              <div className="flex items-center gap-2 mb-3"><Activity className="h-4 w-4 text-neon" /><div className="font-mono text-xs uppercase tracking-widest text-neon">// Weekly prescription</div></div>
              <ul className="text-sm divide-y divide-primary/10">
                {plan.map((d) => (
                  <li key={d.day} className="flex justify-between py-2"><span className="font-mono text-muted-foreground w-12">{d.day}</span><span>{d.focus}</span></li>
                ))}
              </ul>
              <div className="text-[11px] text-muted-foreground mt-3">Tailored for {profile.goal} · {profile.intensity} pace · {grp} age group{profile.targetFatLossKg ? ` · target ${profile.targetFatLossKg}kg fat loss` : ""}.</div>
            </div>
            <div className="glass-strong rounded-3xl p-5 border-glow">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-xs uppercase tracking-widest text-neon">// 7-day diet chart</div>
                <div className="text-[11px] font-mono text-muted-foreground">{diet.kcal} kcal · P{diet.proteinG} C{diet.carbG} F{diet.fatG} · fast {diet.fastWindow}h</div>
              </div>
              <div className="space-y-1.5 text-xs max-h-72 overflow-y-auto pr-1">
                {diet.days.map((d) => (
                  <div key={d.day} className="rounded-lg p-2 border border-primary/15">
                    <div className="font-semibold font-mono text-[11px] text-cyan mb-1">{d.day}</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      <div><span className="text-muted-foreground">B:</span> {d.meal1}</div>
                      <div><span className="text-muted-foreground">L:</span> {d.meal2}</div>
                      <div><span className="text-muted-foreground">D:</span> {d.meal3}</div>
                      <div><span className="text-muted-foreground">S:</span> {d.snack}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {profile && (
          <div className="grid lg:grid-cols-3 gap-6 mt-8" key={historyTick}>
            {/* Trends */}
            {(() => {
              const totals = sessionTotals();
              const series = dailyKcalSeries(7);
              const max = Math.max(1, ...series.map((s) => s.kcal));
              return (
                <div className="glass-strong rounded-3xl p-5 border-glow">
                  <div className="flex items-center gap-2 mb-3"><Activity className="h-4 w-4 text-neon" /><div className="font-mono text-xs uppercase tracking-widest text-neon">// Session history</div></div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="glass rounded-xl p-2"><div className="text-[10px] font-mono uppercase text-muted-foreground">Today</div><div className="text-lg font-bold text-gradient">{Math.round(totals.today.kcal)}</div><div className="text-[10px] text-muted-foreground">kcal · {totals.today.count} sess.</div></div>
                    <div className="glass rounded-xl p-2"><div className="text-[10px] font-mono uppercase text-muted-foreground">7-day</div><div className="text-lg font-bold text-gradient">{Math.round(totals.week.kcal)}</div><div className="text-[10px] text-muted-foreground">kcal · {totals.week.count} sess.</div></div>
                    <div className="glass rounded-xl p-2"><div className="text-[10px] font-mono uppercase text-muted-foreground">All-time</div><div className="text-lg font-bold text-gradient">{totals.all.reps}</div><div className="text-[10px] text-muted-foreground">total reps</div></div>
                  </div>
                  <div className="flex items-end gap-1.5 h-24">
                    {series.map((s, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t bg-gradient-neural" style={{ height: `${(s.kcal / max) * 100}%` }} title={`${s.kcal} kcal`} />
                        <div className="text-[9px] font-mono text-muted-foreground">{s.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Privacy */}
            <div className="glass-strong rounded-3xl p-5 border-glow">
              <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-neon" /><div className="font-mono text-xs uppercase tracking-widest text-neon">// Privacy controls</div></div>
              <ul className="text-xs text-muted-foreground space-y-2 mb-3">
                <li>• Video stays on-device. Only blurred snapshots (≤384px JPEG) leave the browser when AI is active.</li>
                <li>• Snapshots are sent to the coach in-flight only — they are not stored on our servers.</li>
                <li>• You can pause AI snapshots at any time, review the last frame we captured, or wipe local history.</li>
              </ul>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => setPaused((p) => !p)}>
                  {paused ? <><Play className="h-4 w-4 mr-1" />Resume AI</> : <><Pause className="h-4 w-4 mr-1" />Pause AI</>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowSnapshot(true)} disabled={!lastSnapshot}>
                  <Eye className="h-4 w-4 mr-1" />Review last frame
                </Button>
                <Button size="sm" variant="outline" className="col-span-2" onClick={() => { clearSessions(); setLastSnapshot(null); refreshHistory(); toast.success("Local training history cleared"); }}>
                  <Trash2 className="h-4 w-4 mr-1" />Delete training history
                </Button>
              </div>
            </div>

            {/* PDF report */}
            <div className="glass-strong rounded-3xl p-5 border-glow flex flex-col">
              <div className="flex items-center gap-2 mb-3"><FileDown className="h-4 w-4 text-neon" /><div className="font-mono text-xs uppercase tracking-widest text-neon">// Personal report</div></div>
              <p className="text-xs text-muted-foreground mb-4">A printable PDF with your profile, daily kcal/macros, weekly training prescription and 7-day diet chart — issued by NeuralBites for {profile.name}.</p>
              <div className="mt-auto">
                <Button onClick={() => { try { downloadDietPdf(profile); toast.success("Report downloaded"); } catch (e:any) { toast.error(e.message || "Could not generate PDF"); } }} className="w-full bg-gradient-neural">
                  <FileDown className="h-4 w-4 mr-2" />Download diet & training PDF
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Last snapshot review modal */}
        {showSnapshot && lastSnapshot && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowSnapshot(false)}>
            <div className="glass-strong rounded-2xl p-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-xs uppercase tracking-widest text-neon">Last frame sent to coach</div>
                <Button size="sm" variant="ghost" onClick={() => setShowSnapshot(false)}>Close</Button>
              </div>
              <img src={lastSnapshot} alt="Last AI snapshot" className="w-full rounded-xl border border-primary/30" />
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setLastSnapshot(null); setShowSnapshot(false); toast.success("Snapshot discarded"); }}>
                  <Trash2 className="h-4 w-4 mr-1" />Discard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
