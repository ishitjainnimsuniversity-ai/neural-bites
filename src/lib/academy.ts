export type Track = "crash" | "bachelor" | "master";
import { cloudSaveProgress, cloudIssueCertificate, cloudRecordExam } from "@/lib/cloudSync";

export type Module = {
  id: string;
  title: string;
  /** YouTube video ID (public lectures) */
  videoId: string;
  /** Minimum seconds required to mark complete (ratio handled at runtime) */
  durationSec: number;
};

export type Exam = {
  id: string;
  title: string;
  cadence: "weekly" | "monthly" | "yearly";
  questions: { q: string; options: string[]; correct: number }[];
  /** Negative marking per wrong answer (e.g. 0.25) */
  negative: number;
  passPct: number;
};

export type Course = {
  id: string;
  track: Track;
  title: string;
  org: string;
  description: string;
  hours: number;
  free: true;
  modules: Module[];
  exams: Exam[];
};

const q = (q: string, options: string[], correct: number) => ({ q, options, correct });

/* -------- Crash course (your 10-module syllabus) -------- */
const CRASH: Course = {
  id: "crash-2h",
  track: "crash",
  title: "Fitness + Health + Medicine + Yoga · 2-Hour Crash Course",
  org: "NeuralBites Academy",
  description: "Ten tight modules covering anatomy, exercise science, yoga, nutrition, psychology, basic medicine, lifestyle, coaching, yoga therapy and career.",
  hours: 2, free: true,
  modules: [
    { id: "m1",  title: "Human Anatomy for Fitness & Yoga",     videoId: "VVL-8zr2hk4", durationSec: 900 },
    { id: "m2",  title: "Exercise Science (FITT, PO, training)", videoId: "2tM1LFFxeKg", durationSec: 900 },
    { id: "m3",  title: "Yoga Foundations (4 pillars, pranayama)", videoId: "_8kV4FHSdNA", durationSec: 900 },
    { id: "m4",  title: "Nutrition & Dietetics",                 videoId: "fqhYBTg73fw", durationSec: 900 },
    { id: "m5",  title: "Psychology of Fitness & Habits",        videoId: "-moW9jvvMr4", durationSec: 600 },
    { id: "m6",  title: "Basic Medicine for Trainers",           videoId: "3_PYnWVoUzM", durationSec: 900 },
    { id: "m7",  title: "Lifestyle Medicine (6 pillars)",        videoId: "xyQY8a-ng6g", durationSec: 600 },
    { id: "m8",  title: "Coaching & Communication (SMART)",      videoId: "1-SvuFIQjK8", durationSec: 600 },
    { id: "m9",  title: "Yoga Therapy Basics",                   videoId: "g_tea8ZNk5A", durationSec: 600 },
    { id: "m10", title: "Career Roadmap & Certifications",       videoId: "X7j8F16eSqs", durationSec: 600 },
  ],
  exams: [
    { id: "final", title: "Crash Course Final", cadence: "yearly", negative: 0.25, passPct: 60, questions: [
      q("FITT stands for…", ["Form, Intensity, Time, Type", "Frequency, Intensity, Time, Type", "Frequency, Impact, Tempo, Type", "Force, Intensity, Tempo, Training"], 1),
      q("RICE protocol means…", ["Rest, Ice, Compression, Elevation", "Run, Ice, Calm, Eat", "Rest, Intensity, Calm, Energy", "Recover, Ice, Cool, Eat"], 0),
      q("Mifflin-St Jeor estimates…", ["VO2 max", "BMR", "1-rep max", "Body fat %"], 1),
      q("Anulom-Vilom is best for…", ["Cardio", "Calming the nervous system", "Building biceps", "Fat burn"], 1),
      q("Recommended protein for a 70kg lifter (g/day)…", ["20-40", "60-80", "84-140", ">250"], 2),
    ]},
  ],
};

/* -------- BSc tracks -------- */
const BSC_YOGA: Course = {
  id: "bsc-yoga-ayurveda", track: "bachelor",
  title: "BSc · Yoga & Ayurveda Wellness",
  org: "MIU-inspired (NeuralBites Academy)",
  description: "1000-hour-style program: asana, pranayama, meditation, Ayurveda foundations, anatomy and teaching practicum.",
  hours: 1000, free: true,
  modules: [
    { id: "y1", title: "Foundations of Yoga & Philosophy", videoId: "_8kV4FHSdNA", durationSec: 1800 },
    { id: "y2", title: "Asana Lab I",                      videoId: "v7AYKMP6rOE", durationSec: 1800 },
    { id: "y3", title: "Pranayama & Breathwork",           videoId: "8VwufJrUhic", durationSec: 1500 },
    { id: "y4", title: "Meditation & Mindfulness",         videoId: "inpok4MKVLM", durationSec: 1500 },
    { id: "y5", title: "Ayurveda Fundamentals",            videoId: "axD_jMprNLY", durationSec: 1800 },
    { id: "y6", title: "Anatomy for Yoga",                 videoId: "VVL-8zr2hk4", durationSec: 1800 },
    { id: "y7", title: "Teaching Methodology Practicum",   videoId: "GLy2rYHwUqY", durationSec: 1800 },
  ],
  exams: [
    { id: "wk", title: "Weekly Quiz", cadence: "weekly", negative: 0.25, passPct: 60, questions: [
      q("Number of pillars in classical yoga (per crash module)", ["2","3","4","8"], 2),
      q("Kapalbhati is primarily a…", ["Meditation", "Cleansing breath", "Posture", "Mantra"], 1),
      q("Vata, Pitta, Kapha are…", ["Asanas", "Doshas", "Pranayamas", "Mantras"], 1),
    ]},
    { id: "final", title: "BSc Final", cadence: "yearly", negative: 0.25, passPct: 65, questions: [
      q("Sun Salutation in Sanskrit is…", ["Bhujangasana","Surya Namaskar","Anulom Vilom","Sheetali"], 1),
      q("Best pose for back pain (per syllabus)", ["Bhujangasana","Bakasana","Sirsasana","Mayurasana"], 0),
      q("Yoga Alliance entry credential is…", ["RYT-200","CSCS","NASM-CPT","ACE-HC"], 0),
    ]},
  ],
};

const BSC_FIT: Course = {
  id: "bsc-fitness-science", track: "bachelor",
  title: "BSc · Health Sciences (Healthy Lifestyles & Fitness Science)",
  org: "ASU-inspired (NeuralBites Academy)",
  description: "120-credit-hour-style program: exercise science, nutrition, stress management, behavior change and health coaching.",
  hours: 1200, free: true,
  modules: [
    { id: "f1", title: "Foundations of Exercise Science",   videoId: "2tM1LFFxeKg", durationSec: 1800 },
    { id: "f2", title: "Nutrition for Health & Performance",videoId: "fqhYBTg73fw", durationSec: 1800 },
    { id: "f3", title: "Behavior Change & Health Coaching", videoId: "-moW9jvvMr4", durationSec: 1500 },
    { id: "f4", title: "Programming for Fat Loss",          videoId: "ml6cT4AZdqI", durationSec: 1500 },
    { id: "f5", title: "Strength & Hypertrophy",            videoId: "2tM1LFFxeKg", durationSec: 1800 },
    { id: "f6", title: "Cardiometabolic Health",            videoId: "3_PYnWVoUzM", durationSec: 1500 },
    { id: "f7", title: "Stress, Sleep & Recovery",          videoId: "aXItOY0sLRY", durationSec: 1500 },
  ],
  exams: [
    { id: "wk", title: "Weekly Quiz", cadence: "weekly", negative: 0.25, passPct: 60, questions: [
      q("Progressive Overload is…", ["Same load weekly", "Decreasing load", "Gradually increasing load/volume", "Random load"], 2),
      q("Carbs supply primarily…", ["Hormones", "Energy", "Cell membranes", "Bone density"], 1),
    ]},
  ],
};

/* -------- MSc tracks -------- */
const MSC_YOGA: Course = {
  id: "msc-yoga", track: "master",
  title: "MSc · Yoga (Therapy / Research / Philosophy)",
  org: "VaYU-inspired (NeuralBites Academy)",
  description: "Four-semester-style MSc: yoga therapy, research methods, philosophy of yoga, with hands-on practicum.",
  hours: 1500, free: true,
  modules: [
    { id: "yy1", title: "Yoga Therapy Foundations",   videoId: "g_tea8ZNk5A", durationSec: 1800 },
    { id: "yy2", title: "Research Methods in Yoga",   videoId: "Y8Tko2YC5hA", durationSec: 1800 },
    { id: "yy3", title: "Philosophy of Yoga Sutras",  videoId: "_8kV4FHSdNA", durationSec: 1800 },
    { id: "yy4", title: "Therapeutic Practicum",      videoId: "GLy2rYHwUqY", durationSec: 1800 },
  ],
  exams: [
    { id: "mo", title: "Periodic (Monthly) Exam", cadence: "monthly", negative: 0.25, passPct: 65, questions: [
      q("Patanjali's Yoga Sutras have…", ["196 sutras","108 sutras","4 sutras","1008 sutras"], 0),
    ]},
  ],
};

const MSC_HEALTH: Course = {
  id: "msc-integrative-health", track: "master",
  title: "MSc · Integrative Health & Wellness",
  org: "Creighton-inspired (NeuralBites Academy)",
  description: "36-credit-style MSc: health coaching, lifestyle medicine, behavior change, healthy aging.",
  hours: 800, free: true,
  modules: [
    { id: "ih1", title: "Whole-Person Wellness",       videoId: "xyQY8a-ng6g", durationSec: 1800 },
    { id: "ih2", title: "Lifestyle Medicine",          videoId: "-moW9jvvMr4", durationSec: 1500 },
    { id: "ih3", title: "Coaching Skills (NBHWC)",     videoId: "1-SvuFIQjK8", durationSec: 1500 },
    { id: "ih4", title: "Healthy Aging",               videoId: "aXItOY0sLRY", durationSec: 1500 },
  ],
  exams: [
    { id: "mo", title: "Periodic Exam", cadence: "monthly", negative: 0.25, passPct: 65, questions: [
      q("Six pillars of lifestyle medicine include…", ["Sleep","TikTok","Crypto","Day trading"], 0),
    ]},
  ],
};

const MSC_EX: Course = {
  id: "msc-exercise-science", track: "master",
  title: "MSc · Exercise Science & Integrated Wellness",
  org: "Bastyr-inspired (NeuralBites Academy)",
  description: "18-month-style MSc: exercise science, metabolic health, mind-body wellness; preps NASM/ACSM-style credentials.",
  hours: 900, free: true,
  modules: [
    { id: "es1", title: "Advanced Exercise Physiology", videoId: "2tM1LFFxeKg", durationSec: 1800 },
    { id: "es2", title: "Metabolic Health",             videoId: "xyQY8a-ng6g", durationSec: 1500 },
    { id: "es3", title: "Mind-Body Wellness",           videoId: "inpok4MKVLM", durationSec: 1500 },
    { id: "es4", title: "Program Design Capstone",      videoId: "ml6cT4AZdqI", durationSec: 1800 },
  ],
  exams: [],
};

export const COURSES: Course[] = [CRASH, BSC_YOGA, BSC_FIT, MSC_YOGA, MSC_HEALTH, MSC_EX];
export const getCourse = (id: string) => COURSES.find((c) => c.id === id);

/* ---------------- progress (localStorage) ---------------- */
export type Progress = {
  courseId: string;
  enrolledAt: string;
  lastActiveAt: string;
  watched: Record<string, number>; // moduleId -> seconds
  examScores: Record<string, { score: number; passed: boolean; at: string }>;
};

const KEY = (id: string) => `nb.course.${id}`;
const RESET_DAYS = 30;

export const loadProgress = (id: string): Progress | null => {
  try {
    const raw = localStorage.getItem(KEY(id));
    if (!raw) return null;
    const p = JSON.parse(raw) as Progress;
    // Reset rule: if inactive > RESET_DAYS days, wipe credits
    const ago = (Date.now() - new Date(p.lastActiveAt).getTime()) / 86400000;
    if (ago > RESET_DAYS) {
      p.watched = {}; p.examScores = {}; p.lastActiveAt = new Date().toISOString();
      localStorage.setItem(KEY(id), JSON.stringify(p));
    }
    return p;
  } catch { return null; }
};

export const enroll = (id: string): Progress => {
  const existing = loadProgress(id);
  if (existing) return existing;
  const p: Progress = { courseId: id, enrolledAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), watched: {}, examScores: {} };
  localStorage.setItem(KEY(id), JSON.stringify(p));
  return p;
};

export const saveProgress = (p: Progress) => {
  p.lastActiveAt = new Date().toISOString();
  localStorage.setItem(KEY(id_of(p)), JSON.stringify(p));
  void cloudSaveProgress(p).catch(() => { /* offline / not authed */ });
};

/** Record an exam attempt to local + cloud. */
export const recordExamAttempt = (courseId: string, examId: string, score: number, passed: boolean) => {
  void cloudRecordExam(courseId, examId, score, passed).catch(() => { /* offline */ });
};
const id_of = (p: Progress) => p.courseId;

export const moduleComplete = (p: Progress, m: Module) => (p.watched[m.id] ?? 0) >= m.durationSec * 0.95;
export const courseComplete = (c: Course, p: Progress) => c.modules.every((m) => moduleComplete(p, m)) && c.exams.every((e) => p.examScores[e.id]?.passed);

/* ---------------- certificates ---------------- */
export type Certificate = {
  serial: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  issuedAt: string;
};

const CERT_KEY = "nb.certs.v1";

export const issueCertificate = (course: Course, userName: string): Certificate => {
  const all = listCertificates();
  const existing = all.find((c) => c.courseId === course.id && c.userName === userName);
  if (existing) return existing;
  const serial = `NB-${course.id.toUpperCase().slice(0,6)}-${Math.random().toString(36).slice(2,8).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const cert: Certificate = { serial, courseId: course.id, courseTitle: course.title, userName, issuedAt: new Date().toISOString() };
  all.push(cert);
  localStorage.setItem(CERT_KEY, JSON.stringify(all));
  void cloudIssueCertificate(cert).catch(() => { /* offline / not authed */ });
  return cert;
};

export const listCertificates = (): Certificate[] => {
  try { return JSON.parse(localStorage.getItem(CERT_KEY) || "[]"); } catch { return []; }
};

export const getCertificate = (serial: string) => listCertificates().find((c) => c.serial === serial);
