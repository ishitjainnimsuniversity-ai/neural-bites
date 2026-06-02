import { useRef, useState } from "react";
import { Upload, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fileToDataUrl, invokeFn } from "@/lib/api";

interface Item { name: string; confidence: number; serving_g?: number; calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g?: number; vitamins?: string[]; health_notes?: string; }
interface Result { items: Item[]; summary: string; health_score: number; }

export const FoodRecognition = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const onFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be under 8MB"); return; }
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    setResult(null);
    setLoading(true);
    try {
      const r = await invokeFn<Result>("food-recognition", { imageBase64: dataUrl });
      setResult(r);
      toast.success(`Identified ${r.items.length} food item${r.items.length === 1 ? "" : "s"}`);
    } catch (e: any) {
      toast.error(e.message || "Recognition failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="recognition" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Vision</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Snap. Recognize. <span className="text-gradient">Decode.</span></h2>
          <p className="text-muted-foreground mt-3">Upload any meal photo. Our neural model identifies ingredients and estimates nutrition in seconds.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div
            className="glass-strong rounded-3xl p-6 border-glow min-h-[360px] flex flex-col items-center justify-center relative overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
          >
            {preview ? (
              <div className="relative w-full">
                <img src={preview} alt="Uploaded meal" className="rounded-2xl w-full max-h-[360px] object-cover" />
                <button
                  onClick={() => { setPreview(null); setResult(null); }}
                  className="absolute top-3 right-3 glass rounded-full p-2 hover:bg-destructive/20"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-2xl">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-neon" />
                      <div className="font-mono text-xs text-neon mt-3 uppercase tracking-widest">Analyzing pixels…</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto text-neon mb-4" />
                <p className="font-display font-semibold">Drop a meal photo</p>
                <p className="text-sm text-muted-foreground mb-5">JPG/PNG up to 8MB</p>
                <Button onClick={() => fileRef.current?.click()} className="bg-gradient-neural text-primary-foreground font-semibold">
                  Choose image
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
                />
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-6 min-h-[360px]">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 text-neon mb-3" />
                <p>Results appear here.</p>
              </div>
            )}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
            {result && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Health score</div>
                    <div className="font-display text-4xl font-bold text-gradient">{result.health_score}<span className="text-base text-muted-foreground">/100</span></div>
                  </div>
                  <div className="text-right max-w-xs text-sm text-muted-foreground">{result.summary}</div>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                  {result.items.map((it, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <div className="font-display font-semibold">{it.name}</div>
                          <div className="text-[10px] font-mono uppercase text-cyan">conf {(it.confidence * 100).toFixed(0)}%{it.serving_g ? ` · ${it.serving_g}g` : ""}</div>
                        </div>
                        <div className="font-mono text-sm text-neon">{Math.round(it.calories)} kcal</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>P <span className="text-foreground">{it.protein_g}g</span></div>
                        <div>C <span className="text-foreground">{it.carbs_g}g</span></div>
                        <div>F <span className="text-foreground">{it.fat_g}g</span></div>
                      </div>
                      {it.vitamins && it.vitamins.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {it.vitamins.map((v) => (
                            <span key={v} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-neon border border-primary/30">{v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};