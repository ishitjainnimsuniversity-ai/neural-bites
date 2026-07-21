import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GraduationCap, PlayCircle, ShieldCheck, Lock, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { COURSES, Course, enroll, loadProgress, saveProgress, moduleComplete, courseComplete, issueCertificate, recordExamAttempt, Certificate } from "@/lib/academy";
import { Link } from "react-router-dom";

const TrackColumn = ({ track, title, blurb, onOpen }: { track: "crash"|"bachelor"|"master"; title: string; blurb: string; onOpen: (c: Course) => void }) => {
  const list = COURSES.filter((c) => c.track === track);
  return (
    <div className="glass-strong rounded-3xl p-5 border-glow">
      <div className="flex items-center gap-2 mb-1"><GraduationCap className="h-4 w-4 text-neon" /><div className="font-mono text-xs uppercase tracking-widest text-neon">// {title}</div></div>
      <div className="text-xs text-muted-foreground mb-4">{blurb}</div>
      <div className="space-y-3">
        {list.map((c) => {
          const p = loadProgress(c.id);
          const done = p ? c.modules.filter((m) => moduleComplete(p, m)).length : 0;
          return (
            <div key={c.id} className="rounded-2xl p-3 border border-primary/20">
              <div className="text-sm font-semibold">{c.title}</div>
              <div className="text-[11px] text-muted-foreground">{c.org} · {c.hours}h · <span className="text-neon">Free</span></div>
              <div className="text-[11px] text-muted-foreground mt-1">{done}/{c.modules.length} modules complete</div>
              <Button size="sm" className="w-full mt-2 bg-gradient-neural" onClick={() => onOpen(c)}>
                <PlayCircle className="h-4 w-4 mr-2" />{p ? "Continue" : "Enroll free"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CourseDialog = ({ course, onClose }: { course: Course; onClose: () => void }) => {
  const [name, setName] = useState(() => localStorage.getItem("nb.studentName") || "");
  const [tick, setTick] = useState(0);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const p = loadProgress(course.id) ?? enroll(course.id);
  const [examOpen, setExamOpen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const markWatched = (modId: string, sec: number, autoAdvance = false) => {
    const cur = loadProgress(course.id)!;
    cur.watched[modId] = Math.max(cur.watched[modId] ?? 0, sec);
    saveProgress(cur); refresh();
    if (autoAdvance) {
      const idx = course.modules.findIndex((m) => m.id === modId);
      const next = course.modules[idx + 1];
      if (next) {
        setActiveModuleIdx(idx + 1);
        setTimeout(() => {
          document.getElementById(`mod-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 80);
        toast.success(`Next up: ${next.title}`);
      } else {
        toast.success("All modules complete — take the exam to unlock your certificate.");
      }
    }
  };

  const submitExam = (examId: string) => {
    const exam = course.exams.find((e) => e.id === examId)!;
    let raw = 0;
    exam.questions.forEach((q, i) => {
      if (answers[i] === undefined) return;
      if (answers[i] === q.correct) raw += 1; else raw -= exam.negative;
    });
    const pct = Math.max(0, (raw / exam.questions.length) * 100);
    const passed = pct >= exam.passPct;
    const cur = loadProgress(course.id)!;
    cur.examScores[examId] = { score: +pct.toFixed(1), passed, at: new Date().toISOString() };
    saveProgress(cur);
    recordExamAttempt(course.id, examId, +pct.toFixed(1), passed);
    setExamOpen(null); setAnswers({});
    toast[passed ? "success" : "error"](`${exam.title}: ${pct.toFixed(1)}% — ${passed ? "Passed" : "Failed"}`);
    refresh();
  };

  const tryCertify = () => {
    if (!name.trim()) { toast.error("Enter your full name first"); return; }
    if (!courseComplete(course, loadProgress(course.id)!)) { toast.error("Finish all modules and exams first"); return; }
    localStorage.setItem("nb.studentName", name.trim());
    const cert = issueCertificate(course, name.trim());
    onClose();
    window.location.href = `/certificate/${cert.serial}`;
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course.title}</DialogTitle>
          <DialogDescription>{course.description}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-2 mb-3">
          <Input placeholder="Your full name (for certificate)" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="text-[11px] text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-neon" />Enrolled · skipping ahead is blocked · 30-day inactivity resets progress</div>
        </div>
        <div className="space-y-3" key={tick}>
          {course.modules.map((m, idx) => {
            const cur = loadProgress(course.id)!;
            const prev = idx === 0 ? true : moduleComplete(cur, course.modules[idx - 1]);
            const watched = cur.watched[m.id] ?? 0;
            const complete = moduleComplete(cur, m);
            const isActive = idx === activeModuleIdx;
            return (
              <div id={`mod-${m.id}`} key={m.id} className={`rounded-2xl p-3 border ${complete ? "border-neon/60 bg-neon/5" : isActive ? "border-cyan/60" : "border-primary/20"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {complete ? <CheckCircle2 className="h-4 w-4 text-neon" /> : prev ? <PlayCircle className="h-4 w-4 text-cyan" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    Module {idx + 1}. {m.title}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">{Math.min(100, Math.round((watched / m.durationSec) * 100))}%</div>
                </div>
                {prev ? (
                  <div>
                    <div className="aspect-video rounded-lg overflow-hidden bg-background">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${m.videoId}?modestbranding=1&rel=0${isActive ? "&autoplay=1" : ""}`}
                        title={m.title}
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => markWatched(m.id, Math.floor(m.durationSec * 0.5))}>I've watched 50%</Button>
                      <Button size="sm" onClick={() => markWatched(m.id, m.durationSec, true)} className="bg-gradient-neural">
                        {idx === course.modules.length - 1 ? "Mark complete" : "Mark complete & next"} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic">Complete the previous module to unlock.</div>
                )}
              </div>
            );
          })}
          {course.exams.map((e) => {
            const score = loadProgress(course.id)!.examScores[e.id];
            return (
              <div key={e.id} className="rounded-2xl p-3 border border-primary/30 bg-background/40">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{e.title} <span className="text-[11px] font-mono text-muted-foreground">· {e.cadence} · neg {e.negative} · pass {e.passPct}%</span></div>
                  {score ? <span className={`text-xs font-mono ${score.passed ? "text-neon" : "text-destructive"}`}>{score.score}% {score.passed ? "PASS" : "FAIL"}</span> : null}
                </div>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => { setExamOpen(e.id); setAnswers({}); }}>
                  {score ? "Retake" : "Take exam"}
                </Button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground">Issued by Ishit Jain (CEO, NeuralBites)</div>
          <Button onClick={tryCertify} className="bg-gradient-neural"><Award className="h-4 w-4 mr-2" />Claim certificate</Button>
        </div>

        {examOpen && (() => {
          const e = course.exams.find((x) => x.id === examOpen)!;
          return (
            <Dialog open onOpenChange={(v) => !v && setExamOpen(null)}>
              <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{e.title}</DialogTitle><DialogDescription>Negative marking: -{e.negative} per wrong answer.</DialogDescription></DialogHeader>
                <div className="space-y-4">
                  {e.questions.map((q, i) => (
                    <div key={i}>
                      <div className="text-sm font-semibold mb-2">{i + 1}. {q.q}</div>
                      <div className="space-y-1">
                        {q.options.map((opt, j) => (
                          <label key={j} className={`flex items-center gap-2 text-sm p-2 rounded border cursor-pointer ${answers[i] === j ? "border-neon bg-neon/10" : "border-primary/20"}`}>
                            <input type="radio" name={`q${i}`} checked={answers[i] === j} onChange={() => setAnswers((a) => ({ ...a, [i]: j }))} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => submitExam(e.id)} className="bg-gradient-neural mt-3">Submit</Button>
              </DialogContent>
            </Dialog>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
};

export const Academy = () => {
  const [open, setOpen] = useState<Course | null>(null);
  return (
    <section id="academy" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// NeuralBites Academy</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">Free courses in <span className="text-gradient">fitness, yoga, health & medicine.</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Three tracks — Crash, Bachelor (BSc), Master (MSc). Real video lectures, weekly + yearly exams with negative marking, no shortcuts, and a verifiable NeuralBites certificate signed by both CEOs.</p>
          <div className="mt-3"><Link to="/verify" className="text-xs text-cyan underline">Verify a certificate →</Link></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <TrackColumn track="crash"    title="Crash Course (2h)"     blurb="Ten 10-15 minute modules. Exam-ready summary." onOpen={setOpen} />
          <TrackColumn track="bachelor" title="Bachelor (BSc)"        blurb="Long-form video curriculum. Anti-skip + weekly quizzes." onOpen={setOpen} />
          <TrackColumn track="master"   title="Master (MSc)"          blurb="Advanced specialisation. Periodic & yearly exams." onOpen={setOpen} />
        </div>
        {open && <CourseDialog course={open} onClose={() => setOpen(null)} />}
      </div>
    </section>
  );
};
