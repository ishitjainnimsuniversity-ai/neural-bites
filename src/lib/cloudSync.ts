import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile";
import type { Course, Progress, Certificate as Cert } from "@/lib/academy";

const currentUserId = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
};

/* -------- profiles -------- */
export async function cloudLoadProfile(): Promise<Profile | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (!data || !data.name) return null;
  return {
    name: data.name ?? "",
    age: data.age ?? 25,
    sex: (data.sex as any) ?? "male",
    weightKg: Number(data.weight_kg ?? 70),
    heightCm: Number(data.height_cm ?? 170),
    goal: (data.goal as any) ?? "fat-loss",
    intensity: (data.intensity as any) ?? "moderate",
    targetFatLossKg: data.target_fat_kg != null ? Number(data.target_fat_kg) : undefined,
    fastWindowHrs: data.fasting_hours ?? 12,
    photoDataUrl: data.photo_url ?? undefined,
  };
}

export async function cloudSaveProfile(p: Profile) {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from("profiles").upsert({
    id: uid,
    name: p.name,
    age: p.age,
    sex: p.sex,
    weight_kg: p.weightKg,
    height_cm: p.heightCm,
    goal: p.goal,
    intensity: p.intensity,
    target_fat_kg: p.targetFatLossKg ?? null,
    fasting_hours: p.fastWindowHrs ?? 12,
    photo_url: p.photoDataUrl ?? null,
  });
}

/* -------- course progress -------- */
export async function cloudLoadProgress(courseId: string): Promise<Progress | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data: row } = await supabase.from("course_progress").select("*").eq("user_id", uid).eq("course_id", courseId).maybeSingle();
  if (!row) return null;
  const { data: exams } = await supabase.from("exam_attempts").select("*").eq("user_id", uid).eq("course_id", courseId).order("attempted_at", { ascending: false });
  const examScores: Progress["examScores"] = {};
  for (const e of exams ?? []) {
    if (!examScores[e.exam_id]) examScores[e.exam_id] = { score: Number(e.score), passed: e.passed, at: e.attempted_at };
  }
  return {
    courseId,
    enrolledAt: row.enrolled_at,
    lastActiveAt: row.last_active_at,
    watched: (row.watched as Record<string, number>) ?? {},
    examScores,
  };
}

export async function cloudSaveProgress(p: Progress) {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from("course_progress").upsert({
    user_id: uid,
    course_id: p.courseId,
    watched: p.watched as any,
    enrolled_at: p.enrolledAt,
    last_active_at: new Date().toISOString(),
  }, { onConflict: "user_id,course_id" });
}

export async function cloudRecordExam(courseId: string, examId: string, score: number, passed: boolean) {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from("exam_attempts").insert({ user_id: uid, course_id: courseId, exam_id: examId, score, passed });
}

/* -------- certificates -------- */
export async function cloudIssueCertificate(c: Cert) {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from("certificates").insert({
    serial: c.serial,
    user_id: uid,
    course_id: c.courseId,
    course_title: c.courseTitle,
    user_name: c.userName,
    issued_at: c.issuedAt,
  });
}

export async function cloudGetCertificate(serial: string): Promise<Cert | null> {
  const { data } = await supabase.from("certificates").select("*").eq("serial", serial).maybeSingle();
  if (!data) return null;
  return {
    serial: data.serial,
    courseId: data.course_id,
    courseTitle: data.course_title,
    userName: data.user_name,
    issuedAt: data.issued_at,
  };
}

/* -------- one-shot migrate local -> cloud after login -------- */
export async function migrateLocalToCloud() {
  const uid = await currentUserId();
  if (!uid) return;

  // Profile
  try {
    const raw = localStorage.getItem("nb.profile.v1");
    if (raw) {
      const p = JSON.parse(raw) as Profile;
      const existing = await cloudLoadProfile();
      if (!existing) await cloudSaveProfile(p);
    }
  } catch { /* ignore */ }

  // Course progress
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("nb.course.")) continue;
      const p = JSON.parse(localStorage.getItem(k) || "null") as Progress | null;
      if (p) await cloudSaveProgress(p);
    }
  } catch { /* ignore */ }

  // Certificates
  try {
    const certs = JSON.parse(localStorage.getItem("nb.certs.v1") || "[]") as Cert[];
    for (const c of certs) {
      try { await cloudIssueCertificate(c); } catch { /* unique-violation = already there */ }
    }
  } catch { /* ignore */ }
}