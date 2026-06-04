import { tdee } from "@/lib/api";

export type Goal = "fat-loss" | "muscle" | "endurance" | "flexibility" | "rehab" | "general";
export type Intensity = "rapid" | "moderate" | "slow";
export type Sex = "male" | "female";

export type Profile = {
  name: string;
  age: number;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  photoDataUrl?: string;
  goal: Goal;
  intensity: Intensity;
  targetFatLossKg?: number;
  fastWindowHrs?: number; // intermittent fasting window
};

const KEY = "nb.profile.v1";

export const loadProfile = (): Profile | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch { return null; }
};

export const saveProfile = (p: Profile) => localStorage.setItem(KEY, JSON.stringify(p));
export const clearProfile = () => localStorage.removeItem(KEY);

export const ageGroup = (age: number): "youth" | "adult" | "midlife" | "senior" =>
  age < 18 ? "youth" : age < 40 ? "adult" : age < 60 ? "midlife" : "senior";

/** Daily kcal target based on goal + intensity */
export function dailyKcalTarget(p: Profile) {
  const maint = tdee(p.age, p.sex, p.weightKg, p.heightCm, 1.4);
  const deficitMap: Record<Intensity, number> = { rapid: 700, moderate: 450, slow: 250 };
  const surplusMap: Record<Intensity, number> = { rapid: 500, moderate: 300, slow: 150 };
  if (p.goal === "fat-loss") return Math.max(1200, maint - deficitMap[p.intensity]);
  if (p.goal === "muscle") return maint + surplusMap[p.intensity];
  return maint;
}

/** Macros split */
export function macros(p: Profile) {
  const kcal = dailyKcalTarget(p);
  const proteinG = Math.round(p.weightKg * (p.goal === "muscle" ? 2 : 1.6));
  const fatG = Math.round((kcal * 0.25) / 9);
  const carbG = Math.max(50, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
  return { kcal, proteinG, fatG, carbG };
}

/** 7-day diet chart, kept simple but grounded in profile */
export function dietChart(p: Profile) {
  const { kcal, proteinG, carbG, fatG } = macros(p);
  const fastWindow = p.fastWindowHrs ?? 12;
  const meals = (label: string, meal1: string, meal2: string, meal3: string, snack: string) => ({
    day: label, meal1, meal2, meal3, snack,
  });
  return {
    kcal, proteinG, carbG, fatG, fastWindow,
    days: [
      meals("Mon", "Oats + whey + berries", "Grilled chicken, quinoa, greens", "Paneer/tofu stir-fry, brown rice", "Greek yogurt + nuts"),
      meals("Tue", "Egg-white omelette + toast", "Tuna salad, sweet potato", "Lentil dal, roti, sabzi", "Apple + peanut butter"),
      meals("Wed", "Smoothie: banana, oats, whey", "Chicken wrap, slaw", "Salmon, veg, basmati", "Cottage cheese + cucumber"),
      meals("Thu", "Poha + sprouts", "Rajma, rice, salad", "Tofu curry, jowar roti", "Roasted chana"),
      meals("Fri", "Greek yogurt + granola", "Egg bhurji + 2 rotis", "Grilled fish + quinoa", "Mixed nuts"),
      meals("Sat", "Vegetable upma + chutney", "Chicken biryani (light)", "Paneer tikka + dal", "Fruit bowl"),
      meals("Sun", "Avocado toast + eggs", "Chole + rice + raita", "Veg soup + grilled tofu", "Dark chocolate + almonds"),
    ],
  };
}

/** Suggested weekly workout split */
export function weeklyPlan(p: Profile): { day: string; focus: string }[] {
  const grp = ageGroup(p.age);
  const easy = grp === "senior" || p.goal === "rehab";
  if (p.goal === "fat-loss") return [
    { day: "Mon", focus: easy ? "Brisk walk 30m" : "HIIT 20m + core" },
    { day: "Tue", focus: "Full-body strength" },
    { day: "Wed", focus: easy ? "Yoga / mobility" : "Steady cardio 40m" },
    { day: "Thu", focus: "Upper-body strength" },
    { day: "Fri", focus: easy ? "Walk + stretch" : "HIIT 20m" },
    { day: "Sat", focus: "Lower-body + core" },
    { day: "Sun", focus: "Active recovery / yoga" },
  ];
  if (p.goal === "muscle") return [
    { day: "Mon", focus: "Push (chest/shoulders/tri)" },
    { day: "Tue", focus: "Pull (back/bi)" },
    { day: "Wed", focus: "Legs" },
    { day: "Thu", focus: "Rest / mobility" },
    { day: "Fri", focus: "Upper hypertrophy" },
    { day: "Sat", focus: "Lower hypertrophy" },
    { day: "Sun", focus: "Light cardio / yoga" },
  ];
  if (p.goal === "flexibility") return Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
    focus: ["Surya Namaskar A", "Hip openers", "Anulom-Vilom + meditation", "Spinal mobility", "Yin yoga", "Balance flow", "Restorative yoga"][i],
  }));
  return [
    { day: "Mon", focus: "Strength A" }, { day: "Tue", focus: "Cardio 30m" },
    { day: "Wed", focus: "Mobility + core" }, { day: "Thu", focus: "Strength B" },
    { day: "Fri", focus: "Cardio 30m" }, { day: "Sat", focus: "Sport / fun" },
    { day: "Sun", focus: "Rest" },
  ];
}