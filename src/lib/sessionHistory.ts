export type SessionRecord = {
  at: string;          // ISO date
  exercise: string;
  reps: number;
  kcal: number;
  seconds: number;
  zonePeak: number;
};

const KEY = "nb.sessions.v1";
const MAX = 200;

export const loadSessions = (): SessionRecord[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const saveSession = (r: SessionRecord) => {
  const all = loadSessions();
  all.unshift(r);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, MAX)));
};

export const clearSessions = () => localStorage.removeItem(KEY);

export const sessionTotals = (records: SessionRecord[] = loadSessions()) => {
  const today = new Date().toDateString();
  const week = Date.now() - 7 * 86400000;
  const todayList = records.filter((r) => new Date(r.at).toDateString() === today);
  const weekList = records.filter((r) => new Date(r.at).getTime() >= week);
  const sum = (arr: SessionRecord[], k: keyof SessionRecord) =>
    arr.reduce((s, r) => s + (typeof r[k] === "number" ? (r[k] as number) : 0), 0);
  return {
    today: { count: todayList.length, kcal: sum(todayList, "kcal"), reps: sum(todayList, "reps"), seconds: sum(todayList, "seconds") },
    week:  { count: weekList.length,  kcal: sum(weekList,  "kcal"), reps: sum(weekList,  "reps"), seconds: sum(weekList,  "seconds") },
    all:   { count: records.length,   kcal: sum(records,   "kcal"), reps: sum(records,   "reps"), seconds: sum(records,   "seconds") },
  };
};

/** Daily kcal totals for the last `days` days, oldest → newest. */
export const dailyKcalSeries = (days = 7, records: SessionRecord[] = loadSessions()) => {
  const out: { day: string; kcal: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    const kcal = records
      .filter((r) => new Date(r.at).toDateString() === ds)
      .reduce((s, r) => s + r.kcal, 0);
    out.push({ day: d.toLocaleDateString(undefined, { weekday: "short" }), kcal: Math.round(kcal) });
  }
  return out;
};