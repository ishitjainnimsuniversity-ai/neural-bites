import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Recognition", target: "recognition" },
  { label: "Analyzer", target: "dashboard" },
  { label: "Diet", target: "diet" },
  { label: "Recipes", target: "recipes" },
  { label: "Fitness", target: "fitness" },
  { label: "Voice", target: "voice" },
  { label: "AI Mirror", target: "mirror" },
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const go = (id: string) => { setOpen(false); scrollTo(id); };
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="container mx-auto mt-4 px-4">
        <nav className="glass rounded-2xl flex items-center justify-between px-5 py-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="relative">
              <Brain className="h-7 w-7 text-neon" />
              <span className="absolute inset-0 blur-md bg-neon/40 rounded-full" />
            </span>
            <span className="text-gradient">Neural+Bites</span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {links.map((l) => (
              <button
                key={l.target}
                onClick={() => go(l.target)}
                className="hover:text-foreground transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => go("recognition")}
              size="sm"
              className="bg-gradient-neural text-primary-foreground font-semibold hover:opacity-90 glow-cyan"
            >
              Launch App
            </Button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-primary/10"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {open && (
          <div className="md:hidden glass rounded-2xl mt-2 p-3 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.target}
                onClick={() => go(l.target)}
                className="text-left px-3 py-2 rounded-lg hover:bg-primary/10 text-sm"
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};