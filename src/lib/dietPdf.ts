import { jsPDF } from "jspdf";
import type { Profile } from "@/lib/profile";
import { dietChart, weeklyPlan, macros, ageGroup } from "@/lib/profile";

/** Generate a personalized diet + training PDF and trigger a download. */
export const downloadDietPdf = (profile: Profile) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 56;

  const m = macros(profile);
  const diet = dietChart(profile);
  const plan = weeklyPlan(profile);
  const grp = ageGroup(profile.age);

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.text("NeuralBites · Personal Health Report", 40, 36);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(`Issued ${new Date().toLocaleDateString()} · for ${profile.name}`, 40, 56);

  y = 110;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("Profile", 40, y); y += 18;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(
    `Name: ${profile.name}   Age: ${profile.age} (${grp})   Sex: ${profile.sex}\n` +
    `Weight: ${profile.weightKg} kg   Height: ${profile.heightCm} cm\n` +
    `Goal: ${profile.goal}   Intensity: ${profile.intensity}` +
    (profile.targetFatLossKg ? `   Target fat-loss: ${profile.targetFatLossKg} kg` : ""),
    40, y
  );
  y += 56;

  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("Daily targets", 40, y); y += 18;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(`Calories: ${m.kcal} kcal   Protein: ${m.proteinG} g   Carbs: ${m.carbG} g   Fat: ${m.fatG} g   Fasting: ${diet.fastWindow} h`, 40, y);
  y += 28;

  // Weekly training
  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("Weekly training prescription", 40, y); y += 18;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  plan.forEach((d) => { doc.text(`${d.day}: ${d.focus}`, 50, y); y += 14; });
  y += 10;

  // Diet chart
  if (y > 680) { doc.addPage(); y = 56; }
  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("7-day diet chart", 40, y); y += 16;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  diet.days.forEach((d) => {
    if (y > 760) { doc.addPage(); y = 56; }
    doc.setFont("helvetica", "bold"); doc.text(d.day, 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Breakfast: ${d.meal1}`, 90, y); y += 12;
    doc.text(`Lunch:     ${d.meal2}`, 90, y); y += 12;
    doc.text(`Dinner:    ${d.meal3}`, 90, y); y += 12;
    doc.text(`Snack:     ${d.snack}`, 90, y); y += 16;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text(
      `NeuralBites Personal Health Report · page ${i}/${pageCount} · This plan is informational; consult a clinician for medical guidance.`,
      40, 820
    );
  }

  doc.save(`NeuralBites-Plan-${profile.name.replace(/\s+/g, "_")}.pdf`);
};