import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2, Play, Square, Volume2, VolumeX, Flame, AlertCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { invokeFn } from "@/lib/api";

type Exercise = {
  id: string;
  name: string;
  kcalPerMin: number;
  cue: string;
  tempoSec: number;
};

const EXERCISES: Exercise[] = [
  { id: "jumping-jacks", name: "Jumping Jacks",      kcalPerMin: 10, tempoSec: 1, cue: "Light feet. Land soft, arms reach overhead." },
  { id: "high-knees",    name: "High Knees",         kcalPerMin: 12, tempoSec: 1, cue: "Drive knees to hip height. Stay tall." },
  { id: "burpees",       name: "Burpees",            kcalPerMin: 14, tempoSec: 3, cue: "Chest to floor, explosive jump up." },
  { id: "mountain",      name: "Mountain Climbers",  kcalPerMin: 11, tempoSec: 1, cue: "Hips low, fast alternating knees." },
  { id: "squats",        name: "Air Squats",         kcalPerMin: 8,  tempoSec: 2, cue: "Hips back, chest proud, knees tracking toes." },
  { id: "lunges",        name: "Reverse Lunges",     kcalPerMin: 8,  tempoSec: 2, cue: "Step back, both knees to 90°." },
  { id: "shadow-box",    name: "Shadow Boxing",      kcalPerMin: 10, tempoSec: 1, cue: "Chin tucked, rotate hips, snap punches back." },
  { id: "plank",         name: "Plank Hold",         kcalPerMin: 5,  tempoSec: 4, cue: "Glutes squeezed, ribs down, neutral neck." },
];

type PermState = "unknown" | "prompt" | "granted" | "denied";

export const AIMirror = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const coachTimer = useRef<number | null>(null);
  const tickTimer = useRef<number | null>(null);

  const [perm, setPerm] = useState<PermState>("unknown");
  const [permError, setPermError] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [exercise, setExercise] = useState<Exercise>(EXERCISES[0]);
  const [training, setTraining] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [reps, setReps] = useState(0);
  const [coachMsg, setCoachMsg] = useState<string>("Pick a fat-loss drill and hit Start. I'll watch your form in real time.");
  const [thinking, setThinking] = useState(false);
  const [muted, setMuted] = useState(false);

  const isSecure = typeof window !== "undefined" && (window.isSecureContext || location.hostname === "localhost");
  const hasCam = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  // Query permission state where supported.
  const refreshPerm = async () => {
    try {
      // @ts-ignore — camera is a valid permission name in Chromium browsers.
      const status = await navigator.permissions?.query?.({ name: "camera" as PermissionName });
      if (status) {
        setPerm(status.state as PermState);
        status.onchange = () => setPerm(status.state as PermState);
      }
    } catch { /* not supported — leave unknown */ }
  };
  useEffect(() => { refreshPerm(); }, []);

  useEffect(() => () => { stopAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAll = () => {
    if (coachTimer.current) { clearInterval(coachTimer.current); coachTimer.current = null; }
    if (tickTimer.current)  { clearInterval(tickTimer.current);  tickTimer.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    try { window.speechSynthesis?.cancel(); } catch {}
  };

  const speak = (text: string) => {
    if (muted) return;
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; u.pitch = 1.0;
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
      const m =
        name === "NotAllowedError" || name === "SecurityError"
          ? "Camera permission denied. Allow camera access in your browser site settings and click Retry."
          : name === "NotFoundError"
          ? "No camera found. Plug one in and retry."
          : name === "NotReadableError"
          ? "Camera is in use by another app. Close it and retry."
          : "Couldn't access the camera. Check browser permissions.";
      setPerm("denied");
      setPermError(m);
      toast.error(m);
      return false;
    }
  };

  const stopCamera = () => {
    stopAll();
    setCamOn(false);
    setTraining(false);
  };

  const captureFrame = (): string | null => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c || !v.videoWidth) return null;
    c.width = 384; c.height = Math.round(384 * (v.videoHeight / v.videoWidth));
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7);
  };

  const askCoach = async (phase: string) => {
    setThinking(true);
    try {
      const image = captureFrame();
      const r = await invokeFn<{ answer: string }>("ai-coach", { exercise: exercise.name, image, phase });
      setCoachMsg(r.answer);
      speak(r.answer);
    } catch (e: any) {
      // Soft fail — keep the trainer talking with the local cue.
      setCoachMsg(exercise.cue);
      speak(exercise.cue);
    } finally { setThinking(false); }
  };

  const startTraining = async () => {
    if (!camOn) { const ok = await startCamera(); if (!ok) return; }
    setSeconds(0); setReps(0); setTraining(true);
    askCoach("intro");
    tickTimer.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
      setReps((r) => r + (1 / exercise.tempoSec));
    }, 1000);
    coachTimer.current = window.setInterval(() => askCoach("active"), 8000);
  };

  const stopTraining = () => {
    if (coachTimer.current) { clearInterval(coachTimer.current); coachTimer.current = null; }
    if (tickTimer.current)  { clearInterval(tickTimer.current);  tickTimer.current = null; }
    setTraining(false);
    const summary = `Great work — ${Math.round(reps)} reps of ${exercise.name} in ${seconds}s. About ${kcal.toFixed(1)} kcal burned. Hydrate and breathe.`;
    setCoachMsg(summary);
    speak(summary);
  };

  const kcal = (exercise.kcalPerMin * seconds) / 60;

  return (
    <section id="mirror" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// AI Mirror</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">Train with a <span className="text-gradient">live AI coach.</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Coach Nova sees you through your webcam, corrects your form in real time and burns fat with you — like a real human PT, on demand.</p>
        </div>

        {/* Permission banner */}
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
        {perm === "prompt" && !camOn && (
          <div className="glass rounded-2xl border border-primary/40 p-4 mb-6 flex items-start gap-3">
            <Camera className="h-5 w-5 text-neon shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <div className="font-semibold">Camera access needed</div>
              <div className="text-muted-foreground">Allow your camera so Coach Nova can see your form and guide you live.</div>
            </div>
            <Button size="sm" onClick={startCamera} className="bg-gradient-neural"> <Camera className="h-4 w-4 mr-2" /> Enable</Button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* You — webcam */}
          <div className="glass-strong rounded-3xl p-4 border-glow lg:col-span-2">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="font-mono text-xs uppercase tracking-widest text-cyan">// You</div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setMuted((m) => !m)} aria-label="Toggle voice">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-neon" />}
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
              {training && (
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-1 rounded-md bg-destructive/80 text-[10px] font-mono uppercase tracking-widest animate-pulse">● LIVE</span>
                  <span className="px-2 py-1 rounded-md bg-background/70 text-[10px] font-mono">{seconds}s</span>
                  <span className="px-2 py-1 rounded-md bg-background/70 text-[10px] font-mono">{Math.round(reps)} reps</span>
                  <span className="px-2 py-1 rounded-md bg-background/70 text-[10px] font-mono flex items-center gap-1"><Flame className="h-3 w-3 text-plasma" />{kcal.toFixed(1)} kcal</span>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Coach speech bubble */}
            <div className="glass rounded-2xl p-4 mt-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-neural flex items-center justify-center font-display font-bold">N</div>
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase text-neon flex items-center gap-1">Coach Nova {thinking && <Loader2 className="h-3 w-3 animate-spin" />}</div>
                <div className="text-sm mt-1">{coachMsg}</div>
              </div>
            </div>
          </div>

          {/* Coach panel + exercises */}
          <div className="glass-strong rounded-3xl p-5 border-glow">
            <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Drills · Fat loss</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {EXERCISES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setExercise(ex)}
                  className={`text-left rounded-xl p-3 border text-sm transition-all ${exercise.id === ex.id ? "border-neon bg-neon/10" : "border-primary/20 hover:border-primary/50"}`}
                >
                  <div className="font-semibold">{ex.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3 text-plasma" />{ex.kcalPerMin} kcal/min</div>
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mb-4">{exercise.cue}</div>
            {training ? (
              <Button onClick={stopTraining} variant="destructive" className="w-full"><Square className="h-4 w-4 mr-2" />End session</Button>
            ) : (
              <Button onClick={startTraining} className="w-full bg-gradient-neural">
                <Play className="h-4 w-4 mr-2" />Start training
              </Button>
            )}
            <p className="text-[11px] text-muted-foreground mt-3 text-center">Your video stays on-device. Frames are sent only as private snapshots for coaching feedback.</p>
          </div>
        </div>
      </div>
    </section>
  );
};