import { useParams, Link } from "react-router-dom";
import { getCertificate } from "@/lib/academy";
import { Award, ShieldCheck } from "lucide-react";

export default function Certificate() {
  const { serial = "" } = useParams();
  const cert = getCertificate(serial);
  if (!cert) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
      <div className="text-2xl font-display font-bold">Certificate not found</div>
      <div className="text-sm text-muted-foreground">Serial <span className="font-mono">{serial}</span> isn't in this device's records.</div>
      <Link to="/" className="text-cyan underline text-sm">← Back home</Link>
    </div>
  );
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full glass-strong border-glow rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-neural opacity-10" />
        <div className="relative">
          <Award className="h-12 w-12 text-neon mx-auto mb-3" />
          <div className="font-mono text-xs uppercase tracking-widest text-neon">NeuralBites Academy</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">Certificate of Completion</h1>
          <p className="text-sm text-muted-foreground mt-4">This certifies that</p>
          <div className="font-display text-3xl md:text-4xl my-3 text-gradient">{cert.userName}</div>
          <p className="text-sm text-muted-foreground">has successfully completed all modules and exams of</p>
          <div className="font-semibold text-lg mt-2">{cert.courseTitle}</div>
          <div className="text-xs text-muted-foreground mt-1">Issued {new Date(cert.issuedAt).toLocaleDateString()}</div>
          <div className="grid grid-cols-2 gap-6 mt-10 text-left">
            <div>
              <div className="font-display italic text-xl border-b border-primary/40 pb-1">Ishit Jain</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-1">Co-CEO, NeuralBites</div>
            </div>
            <div>
              <div className="font-display italic text-xl border-b border-primary/40 pb-1">Shreya Thakur</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-1">Co-CEO, NeuralBites</div>
            </div>
          </div>
          <div className="mt-8 text-[11px] font-mono text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck className="h-3 w-3 text-neon" /> Serial: {cert.serial} · verify at /verify/{cert.serial}
          </div>
          <div className="mt-4"><Link to="/" className="text-cyan underline text-sm">← Back home</Link></div>
        </div>
      </div>
    </div>
  );
}
