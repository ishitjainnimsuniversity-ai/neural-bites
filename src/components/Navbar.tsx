import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Recognition", href: "#recognition" },
  { label: "Analyzer", href: "#analyzer" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Innovations", href: "#innovations" },
  { label: "Database", href: "#database" },
];

export const Navbar = () => (
  <header className="fixed top-0 inset-x-0 z-50">
    <div className="container mx-auto mt-4 px-4">
      <nav className="glass rounded-2xl flex items-center justify-between px-5 py-3">
        <a href="#" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="relative">
            <Brain className="h-7 w-7 text-neon" />
            <span className="absolute inset-0 blur-md bg-neon/40 rounded-full" />
          </span>
          <span className="text-gradient">Neural+Bites</span>
        </a>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <Button size="sm" className="bg-gradient-neural text-primary-foreground font-semibold hover:opacity-90 glow-cyan">
          Launch App
        </Button>
      </nav>
    </div>
  </header>
);