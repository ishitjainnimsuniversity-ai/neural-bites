import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCertificate } from "@/lib/academy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldX } from "lucide-react";

export default function Verify() {
  const { serial } = useParams();
  const [q, setQ] = useState(serial ?? "");
  const cert = q ? getCertificate(q.trim()) : null;
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full glass-strong rounded-3xl border-glow p-8">
        <h1 className="font-display text-2xl font-bold mb-2">Verify a NeuralBites certificate</h1>
        <p className="text-sm text-muted-foreground mb-4">Enter the serial printed on the certificate.</p>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="NB-CRASH-XXXX..." />
          <Button onClick={() => setQ(q.trim())} className="bg-gradient-neural">Verify</Button>
        </div>
        {q && (
          cert ? (
            <div className="mt-5 p-4 rounded-2xl border border-neon/50 bg-neon/5">
              <div className="flex items-center gap-2 text-neon font-semibold"><ShieldCheck className="h-4 w-4" /> Valid certificate</div>
              <div className="text-sm mt-2">{cert.userName} — {cert.courseTitle}</div>
              <div className="text-[11px] font-mono text-muted-foreground">Issued {new Date(cert.issuedAt).toLocaleDateString()} · serial {cert.serial}</div>
              <Link to={`/certificate/${cert.serial}`} className="text-cyan underline text-sm">View certificate →</Link>
            </div>
          ) : (
            <div className="mt-5 p-4 rounded-2xl border border-destructive/50 bg-destructive/5 flex items-center gap-2 text-destructive">
              <ShieldX className="h-4 w-4" /> No certificate found for this serial on this device.
            </div>
          )
        )}
        <div className="mt-6"><Link to="/" className="text-cyan underline text-sm">← Back home</Link></div>
      </div>
    </div>
  );
}
