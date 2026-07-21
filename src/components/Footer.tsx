import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border/50 py-10">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-neon" />
        <span className="font-display font-semibold text-foreground">Neural+Bites</span>
        <span className="font-mono text-xs">v3.1 · 2026</span>
      </div>
      <div className="flex gap-6 font-mono text-xs uppercase tracking-wider">
        <Link to="/blog" className="hover:text-foreground">Blog</Link>
        <a href="#" className="hover:text-foreground">Privacy</a>
        <a href="#" className="hover:text-foreground">Research</a>
        <a href="#" className="hover:text-foreground">Careers</a>
        <a href="#" className="hover:text-foreground">Contact</a>
      </div>
    </div>
  </footer>
);