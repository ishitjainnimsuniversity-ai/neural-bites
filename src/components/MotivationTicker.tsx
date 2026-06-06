import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { HEALTH_QUOTES } from "@/lib/quotes";

/** Rotates a health quote every 2s with a soft crossfade. */
export const MotivationTicker = ({ intervalMs = 2000 }: { intervalMs?: number }) => {
  const [i, setI] = useState(() => Math.floor(Math.random() * HEALTH_QUOTES.length));
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const t = window.setInterval(() => {
      setFade(false);
      window.setTimeout(() => {
        setI((x) => (x + 1) % HEALTH_QUOTES.length);
        setFade(true);
      }, 220);
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3 min-h-[68px]">
      <Sparkles className="h-4 w-4 text-neon shrink-0" />
      <div className="flex-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-neon">// Daily motivation</div>
        <div className={`text-sm transition-opacity duration-200 ${fade ? "opacity-100" : "opacity-0"}`}>
          {HEALTH_QUOTES[i]}
        </div>
      </div>
    </div>
  );
};