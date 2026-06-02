import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { invokeFn } from "@/lib/api";

type SR = any;

export const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const recRef = useRef<SR | null>(null);

  const SRClass = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const supported = !!SRClass;

  useEffect(() => () => { recRef.current?.stop?.(); }, []);

  const ask = async (q: string) => {
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

  const toggle = () => {
    if (!supported) { toast.error("Speech recognition not supported in this browser. Try Chrome."); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const r: SR = new SRClass();
    r.lang = "en-US"; r.continuous = false; r.interimResults = true;
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((res: any) => res[0].transcript).join("");
      setTranscript(t);
      if (e.results[0].isFinal) { setListening(false); ask(t); }
    };
    r.onerror = () => { setListening(false); toast.error("Mic error"); };
    r.onend = () => setListening(false);
    recRef.current = r;
    setTranscript(""); setAnswer("");
    r.start();
    setListening(true);
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
            <button
              onClick={toggle}
              className={`relative mx-auto w-32 h-32 rounded-full bg-gradient-neural flex items-center justify-center transition-transform hover:scale-105 ${listening ? "animate-pulse-glow" : ""}`}
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              <div className="absolute inset-0 rounded-full bg-neon/30 blur-2xl" />
              {listening ? <MicOff className="h-12 w-12 text-primary-foreground relative" /> : <Mic className="h-12 w-12 text-primary-foreground relative" />}
            </button>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-6">
              {listening ? "Listening…" : loading ? "Thinking…" : "Tap to speak"}
            </div>
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
              <p className="text-xs text-muted-foreground mt-4">Voice input requires Chrome, Edge, or Safari.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};