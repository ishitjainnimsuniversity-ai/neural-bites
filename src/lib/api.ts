import { supabase } from "@/integrations/supabase/client";

export async function invokeFn<T = any>(name: string, body: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

/** BMI calc — kg, cm */
export function calcBMI(weightKg: number, heightCm: number) {
  const m = heightCm / 100;
  const bmi = weightKg / (m * m);
  let category = "Healthy";
  let advice = "Maintain your current habits with varied nutrition and regular movement.";
  let color = "neon";
  if (bmi < 18.5) { category = "Underweight"; advice = "Increase calorie-dense nutritious foods: nuts, oats, lean proteins."; color = "cyan"; }
  else if (bmi < 25) { category = "Healthy"; advice = "Maintain balanced macros, hydration and strength training 3x/week."; color = "neon"; }
  else if (bmi < 30) { category = "Overweight"; advice = "Aim for a 300-500 kcal daily deficit and prioritize fiber + protein."; color = "plasma"; }
  else { category = "Obese"; advice = "Speak with a clinician; focus on sustainable habits and movement."; color = "destructive"; }
  return { bmi: +bmi.toFixed(1), category, advice, color };
}

/** Mifflin-St Jeor BMR + TDEE estimate */
export function tdee(age: number, gender: "male" | "female", weightKg: number, heightCm: number, activity = 1.4) {
  const bmr = gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * activity);
}