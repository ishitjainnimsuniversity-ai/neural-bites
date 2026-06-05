import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2, Send, AlertCircle, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { invokeFn } from "@/lib/api";

type SR = any;

export const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState("");
  const [micError, setMicError] = useState<string>("");
  const [permState, setPermState] = useState<"unknown" | "prompt" | "granted" | "denied">("unknown");
  const [level, setLevel] = useState(0);
  const recRef = useRef<SR | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const SRClass = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const supported = !!SRClass;
  const isSecure = typeof window !== "undefined" && (window.isSecureContext || location.hostname === "localhost");

  const stopMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    streamRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  };

  const startMeter = (stream: MediaStream) => {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      audioCtxRef.current = ctx;
      analyserRef.current = an;
      const data = new Uint8Array(an.frequencyBinCount);
      const loop = () => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 3));
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch { /* ignore meter failures */ }
  };

  useEffect(() => () => { try { recRef.current?.stop?.(); } catch {} stopMeter(); }, []);

  const refreshPerm = async () => {
    try {
      // @ts-ignore
      const status = await navigator.permissions?.query?.({ name: "microphone" as PermissionName });
      if (status) {
        setPermState(status.state as any);
        status.onchange = () => setPermState(status.state as any);
      }
    } catch { /* ignore */ }
  };
  useEffect(() => { refreshPerm(); }, []);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const r = await invokeFn<{ answer: string }>("voice-qa", { question: q });
      setAnswer(r.answer);
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(r.answer);
        u.rate = 1.05;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch (e: any) { toast.error(e.message || "Voice answer failed"); }
    finally { setLoading(false); }
  };

  const toggle = async () => {
    setMicError("");
    if (!isSecure) {
      const m = "Mic requires HTTPS or localhost.";
      setMicError(m); toast.error(m); return;
    }
    if (!supported) {
      const m = "Speech recognition isn't supported here. Use Chrome/Edge, or type your question below.";
      setMicError(m); toast.error(m); return;
    }
    if (listening) { try { recRef.current?.stop(); } catch {} stopMeter(); setListening(false); return; }

    // Explicitly request mic permission first — surfaces the prompt and clear errors.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        streamRef.current = stream;
        startMeter(stream);
        setPermState("granted");
      }
    } catch (err: any) {
      const name = err?.name || "";
      const m =
        name === "NotAllowedError" || name === "SecurityError"
          ? "Microphone permission denied. Allow mic access in your browser site settings and try again."
          : name === "NotFoundError"
          ? "No microphone found. Plug one in and retry."
          : "Couldn't access the microphone. Check browser permissions.";
      setMicError(m); setPermState("denied"); toast.error(m); return;
    }

    try {
      const r: SR = new SRClass();
      r.lang = "en-US"; r.continuous = false; r.interimResults = true; r.maxAlternatives = 1;
      r.onresult = (e: any) => {
        const t = Array.from(e.results).map((res: any) => res[0].transcript).join("");
        setTranscript(t);
        if (e.results[e.results.length - 1].isFinal) { setListening(false); try { r.stop(); } catch {}; stopMeter(); ask(t); }
      };
      r.onerror = (e: any) => {
        setListening(false); stopMeter();
        const code = e?.error || "";
        if (code === "not-allowed" || code === "service-not-allowed") setPermState("denied");
        const m =
          code === "not-allowed" || code === "service-not-allowed"
            ? "Mic blocked. Allow microphone access in browser site settings."
            : code === "no-speech"
            ? "Didn't catch that — try again and speak after the tone."
            : code === "audio-capture"
            ? "No microphone detected."
            : code === "network"
            ? "Speech service unreachable. Check your connection."
            : `Mic error: ${code || "unknown"}`;
        setMicError(m); toast.error(m);
      };
      r.onend = () => { setListening(false); stopMeter(); };
      recRef.current = r;
      setTranscript(""); setAnswer("");
      r.start();
      setListening(true);
    } catch (err: any) {
      setListening(false); stopMeter();
      const m = err?.message || "Could not start microphone.";
      setMicError(m); toast.error(m);
    }
  };

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    const q = typed.trim();
    if (!q) return;
    setTranscript(q); setTyped(""); ask(q);
  };

  return (
    <section id="voice" className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Voice</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Ask anything about <span className="text-gradient">food.</span></h2>
            <p className="text-muted-foreground mb-6">Tap the orb and speak. Neural+Bites listens, thinks and answers out loud.</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• "How much protein in 100g of salmon?"</div>
              <div>• "Is intermittent fasting safe?"</div>
              <div>• "What are the best foods for iron?"</div>
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-10 border-glow text-center">
            {(permState === "denied") && (
              <div className="glass rounded-2xl border border-destructive/50 p-3 mb-5 flex items-start gap-3 text-left">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-1" />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-destructive">Microphone access blocked</div>
                  <div className="text-muted-foreground">Allow mic in your browser site settings, then retry.</div>
                </div>
                <Button size="sm" variant="outline" onClick={toggle}>
                  <RefreshCcw className="h-3 w-3 mr-1" /> Retry
                </Button>
              </div>
            )}
            {permState === "prompt" && (
              <div className="glass rounded-2xl border border-primary/40 p-3 mb-5 flex items-start gap-3 text-left">
                <Mic className="h-4 w-4 text-neon shrink-0 mt-1" />
                <div className="flex-1 text-xs">
                  <div className="font-semibold">Mic permission needed</div>
                  <div className="text-muted-foreground">Tap the orb and allow microphone access when prompted.</div>
                </div>
              </div>
            )}
            <button
              onClick={toggle}
              disabled={loading}
              className={`relative mx-auto w-32 h-32 rounded-full bg-gradient-neural flex items-center justify-center transition-transform hover:scale-105 ${listening ? "animate-pulse-glow" : ""}`}
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              <div className="absolute inset-0 rounded-full bg-neon/30 blur-2xl" />
              {listening ? <MicOff className="h-12 w-12 text-primary-foreground relative" /> : <Mic className="h-12 w-12 text-primary-foreground relative" />}
            </button>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-6">
              {listening ? "Listening…" : loading ? "Thinking…" : "Tap to speak"}
            </div>
            {listening && (
              <div className="mt-3 mx-auto h-1.5 w-40 rounded-full bg-muted overflow-hidden" aria-hidden>
                <div className="h-full bg-gradient-neural transition-[width] duration-75" style={{ width: `${Math.round(level * 100)}%` }} />
              </div>
            )}
            {micError && (
              <div className="text-xs text-destructive mt-3">{micError}</div>
            )}
            <form onSubmit={submitTyped} className="flex gap-2 mt-5">
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Or type your question…"
                disabled={loading}
                className="bg-input/60 border-primary/30"
              />
              <Button type="submit" disabled={loading || !typed.trim()} size="icon" className="bg-gradient-neural">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            {transcript && (
              <div className="glass rounded-xl p-4 mt-6 text-left">
                <div className="text-[10px] font-mono uppercase text-cyan mb-1">You</div>
                <div className="text-sm">{transcript}</div>
              </div>
            )}
            {loading && <Loader2 className="h-5 w-5 mx-auto mt-4 animate-spin text-neon" />}
            {answer && (
              <div className="glass rounded-xl p-4 mt-3 text-left animate-fade-in">
                <div className="text-[10px] font-mono uppercase text-neon mb-1 flex items-center gap-1"><Volume2 className="h-3 w-3" /> Neural+Bites</div>
                <div className="text-sm">{answer}</div>
              </div>
            )}
            {!supported && (
              <p className="text-xs text-muted-foreground mt-4">Voice input requires Chrome, Edge, or Safari. You can still type your question above.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};