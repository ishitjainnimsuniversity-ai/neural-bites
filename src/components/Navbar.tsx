import { Brain, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSession, signOut } from "@/hooks/useSession";
import { migrateLocalToCloud } from "@/lib/cloudSync";
import { toast } from "sonner";

const links = [
  { label: "Recognition", target: "recognition" },
  { label: "Analyzer", target: "dashboard" },
  { label: "Diet", target: "diet" },
  { label: "Recipes", target: "recipes" },
  { label: "Fitness", target: "fitness" },
  { label: "Voice", target: "voice" },
  { label: "AI Mirror", target: "mirror" },
  { label: "Academy", target: "academy" },
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const nav = useNavigate();
  useEffect(() => {
    if (user) { void migrateLocalToCloud(); }
  }, [user?.id]);
  const handleSignOut = async () => { await signOut(); toast.success("Signed out"); nav("/"); };
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
            {user ? (
              <>
                <span className="hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground"><User className="h-3 w-3" />{user.email}</span>
                <Button onClick={handleSignOut} size="sm" variant="outline"><LogOut className="h-3 w-3 mr-1" />Sign out</Button>
              </>
            ) : (
              <Button asChild size="sm" variant="outline"><Link to="/auth"><LogIn className="h-3 w-3 mr-1" />Sign in</Link></Button>
            )}
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