// Assessment scoring engine tests
// Run with: npm test

import { scoreAssessment, QUESTIONS, AssessmentProfile } from '../lib/assessment';

describe('QUESTIONS array', () => {
  test('has exactly 10 questions', () => {
    expect(QUESTIONS.length).toBe(10);
  });

  test('each question has exactly 4 options and 4 weights', () => {
    QUESTIONS.forEach((q) => {
      expect(q.options.length).toBe(4);
      expect(q.weights.length).toBe(4);
    });
  });

  test('covers all 5 categories', () => {
    const cats = new Set(QUESTIONS.map((q) => q.category));
    expect(cats).toContain('stress');
    expect(cats).toContain('anxiety');
    expect(cats).toContain('mood');
    expect(cats).toContain('sleep');
    expect(cats).toContain('selfEsteem');
  });

  test('each category has exactly 2 questions', () => {
    const cats: Record<string, number> = {};
    QUESTIONS.forEach((q) => { cats[q.category] = (cats[q.category] || 0) + 1; });
    Object.values(cats).forEach((count) => expect(count).toBe(2));
  });

  test('weights start at 0 and are non-negative integers', () => {
    QUESTIONS.forEach((q) => {
      q.weights.forEach((w) => {
        expect(w).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(w)).toBe(true);
      });
    });
  });
});

describe('scoreAssessment()', () => {
  const allZero: Record<number, number> = {};
  const allMax: Record<number, number> = {};
  const allMid: Record<number, number> = {};

  beforeAll(() => {
    QUESTIONS.forEach((q) => {
      allZero[q.id] = 0;   // all "Not at all"
      allMax[q.id] = 3;    // all worst answers
      allMid[q.id] = 1;    // all moderate answers
    });
  });

  test('all-zero answers produce Low/Positive/Good/High profile', () => {
    const profile = scoreAssessment(allZero);
    expect(profile.stress).toBe('Low');
    expect(profile.anxiety).toBe('Low');
    expect(profile.mood).toBe('Positive');
    expect(profile.sleep).toBe('Good');
    expect(profile.selfEsteem).toBe('High');
  });

  test('all-max answers produce High/Low/Poor profile', () => {
    const profile = scoreAssessment(allMax);
    expect(profile.stress).toBe('High');
    expect(profile.anxiety).toBe('High');
    expect(profile.mood).toBe('Low');
    expect(profile.sleep).toBe('Poor');
    expect(profile.selfEsteem).toBe('Low');
  });

  test('mid answers produce Moderate profile', () => {
    const profile = scoreAssessment(allMid);
    expect(profile.stress).toBe('Moderate');
    expect(profile.anxiety).toBe('Moderate');
  });

  test('profile includes completedAt ISO timestamp', () => {
    const profile = scoreAssessment(allZero);
    expect(profile.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('scores object has all 5 dimension keys', () => {
    const profile = scoreAssessment(allZero);
    expect(profile.scores).toHaveProperty('stress');
    expect(profile.scores).toHaveProperty('anxiety');
    expect(profile.scores).toHaveProperty('mood');
    expect(profile.scores).toHaveProperty('sleep');
    expect(profile.scores).toHaveProperty('selfEsteem');
  });

  test('score values are between 0 and 100', () => {
    const profile = scoreAssessment(allMax);
    Object.values(profile.scores).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  test('missing answers default gracefully (no throw)', () => {
    expect(() => scoreAssessment({})).not.toThrow();
  });

  test('partial answers produce valid profile shape', () => {
    const partial = { 1: 2, 3: 1 };
    const profile = scoreAssessment(partial);
    expect(['Low', 'Moderate', 'High']).toContain(profile.stress);
    expect(['Low', 'Moderate', 'High']).toContain(profile.anxiety);
  });

  test('profile object has all required fields', () => {
    const profile: AssessmentProfile = scoreAssessment(allZero);
    const requiredKeys: (keyof AssessmentProfile)[] = ['stress', 'anxiety', 'mood', 'sleep', 'selfEsteem', 'scores', 'completedAt'];
    requiredKeys.forEach((key) => {
      expect(profile).toHaveProperty(key);
    });
  });
});

describe('Crisis keyword detection (utility)', () => {
  const CRISIS_KEYWORDS = ['suicide', 'kill myself', "end my life", "don't want to live", 'self-harm', 'hurt myself'];
  const hasCrisis = (text: string) => CRISIS_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

  test('detects suicide keyword', () => {
    expect(hasCrisis('I am thinking about suicide')).toBe(true);
  });

  test('detects "kill myself"', () => {
    expect(hasCrisis('I want to kill myself')).toBe(true);
  });

  test('ignores normal text', () => {
    expect(hasCrisis('I feel a bit sad today')).toBe(false);
    expect(hasCrisis('I am overwhelmed with work')).toBe(false);
  });

  test('is case-insensitive', () => {
    expect(hasCrisis('SUICIDE thoughts')).toBe(true);
    expect(hasCrisis('SELF-HARM issues')).toBe(true);
  });
});

describe('Mood scoring logic', () => {
  const MOODS = [
    { score: 1, label: 'Terrible' },
    { score: 2, label: 'Bad' },
    { score: 3, label: 'Okay' },
    { score: 4, label: 'Good' },
    { score: 5, label: 'Great' },
  ];

  test('has 5 moods', () => {
    expect(MOODS.length).toBe(5);
  });

  test('scores are 1 to 5', () => {
    expect(MOODS[0].score).toBe(1);
    expect(MOODS[4].score).toBe(5);
  });

  test('average mood computation', () => {
    const scores = [1, 3, 5, 4, 2];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    expect(avg).toBeCloseTo(3.0);
  });
});
