// lib/assessment.ts – Assessment scoring engine

export interface Question {
  id: number;
  category: "stress" | "anxiety" | "mood" | "sleep" | "selfEsteem";
  text: string;
  options: string[];
  weights: number[]; // 0–3 for each option
}

export interface AssessmentProfile {
  stress: "Low" | "Moderate" | "High";
  anxiety: "Low" | "Moderate" | "High";
  mood: "Positive" | "Neutral" | "Low";
  sleep: "Good" | "Fair" | "Poor";
  selfEsteem: "High" | "Moderate" | "Low";
  scores: Record<string, number>;
  completedAt: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "stress",
    text: "Over the past two weeks, how often have you felt overwhelmed by academic or workplace pressure?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 2,
    category: "stress",
    text: "How often do you struggle to balance responsibilities, feeling like you cannot keep up?",
    options: ["Rarely or never", "Sometimes", "Often", "Almost always"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 3,
    category: "anxiety",
    text: "How often do you experience excessive worry about future events or outcomes?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 4,
    category: "anxiety",
    text: "Do you notice physical symptoms of anxiety (racing heart, shortness of breath, restlessness)?",
    options: ["Rarely", "Occasionally", "Frequently", "Almost daily"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 5,
    category: "mood",
    text: "Over the past week, how would you describe your overall emotional state?",
    options: ["Mostly positive and energised", "Mixed, with ups and downs", "Mostly low or flat", "Persistently sad or empty"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 6,
    category: "mood",
    text: "How often do you find it difficult to experience pleasure in activities you used to enjoy?",
    options: ["Not at all", "A few days", "More than half the time", "Almost always"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 7,
    category: "sleep",
    text: "How often do you find it difficult to fall or stay asleep due to racing thoughts or worry?",
    options: ["Rarely", "1–2 nights per week", "3–4 nights per week", "5+ nights per week"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 8,
    category: "sleep",
    text: "How rested do you feel upon waking most mornings?",
    options: ["Very rested", "Fairly rested", "Somewhat tired", "Exhausted"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 9,
    category: "selfEsteem",
    text: "How often do you have positive thoughts about your own abilities and self-worth?",
    options: ["Most of the time", "Sometimes", "Rarely", "Almost never"],
    weights: [0, 1, 2, 3],
  },
  {
    id: 10,
    category: "selfEsteem",
    text: "How often do you compare yourself negatively to others or feel you are 'not good enough'?",
    options: ["Rarely or never", "Occasionally", "Frequently", "Almost always"],
    weights: [0, 1, 2, 3],
  },
];

export function scoreAssessment(answers: Record<number, number>): AssessmentProfile {
  const categoryScores: Record<string, number[]> = {
    stress: [], anxiety: [], mood: [], sleep: [], selfEsteem: [],
  };

  QUESTIONS.forEach((q) => {
    const answerIndex = answers[q.id] ?? 0;
    categoryScores[q.category].push(q.weights[answerIndex]);
  });

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const stressAvg = avg(categoryScores.stress);
  const anxietyAvg = avg(categoryScores.anxiety);
  const moodAvg = avg(categoryScores.mood);
  const sleepAvg = avg(categoryScores.sleep);
  const selfEsteemAvg = avg(categoryScores.selfEsteem);

  const level3 = (v: number): "Low" | "Moderate" | "High" =>
    v < 1 ? "Low" : v < 2 ? "Moderate" : "High";

  const moodLevel = (v: number): "Positive" | "Neutral" | "Low" =>
    v < 1 ? "Positive" : v < 2 ? "Neutral" : "Low";

  const sleepLevel = (v: number): "Good" | "Fair" | "Poor" =>
    v < 1 ? "Good" : v < 2 ? "Fair" : "Poor";

  const selfEsteemLevel = (v: number): "High" | "Moderate" | "Low" =>
    v < 1 ? "High" : v < 2 ? "Moderate" : "Low";

  return {
    stress: level3(stressAvg),
    anxiety: level3(anxietyAvg),
    mood: moodLevel(moodAvg),
    sleep: sleepLevel(sleepAvg),
    selfEsteem: selfEsteemLevel(selfEsteemAvg),
    scores: {
      stress: Math.round(stressAvg * 33.3),
      anxiety: Math.round(anxietyAvg * 33.3),
      mood: Math.round(moodAvg * 33.3),
      sleep: Math.round(sleepAvg * 33.3),
      selfEsteem: Math.round(selfEsteemAvg * 33.3),
    },
    completedAt: new Date().toISOString(),
  };
}
