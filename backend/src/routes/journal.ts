import { Router } from 'express';
import { getGeminiModel } from '../lib/gemini';
import { prisma } from '../lib/db';

const router = Router();

// Generate reflection and save journal entry
router.post('/reflect', async (req, res) => {
  try {
    const { text, profile, userId, mood } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'Journal entry must be at least 10 characters long' });
    }

    let reflectionText = 'Thank you for sharing. Your feelings are valid and taking time to write them down is a meaningful step.';

    try {
      const model = getGeminiModel();
      const profileHint = profile
        ? `The user has ${profile.stress} stress, ${profile.anxiety} anxiety, and ${profile.mood} mood. Tailor your reflection accordingly.`
        : '';

      const prompt = `You are MindWise AI's journaling companion. A user has shared the following journal entry.
${profileHint}

Your task: Provide a warm, empathetic, and insightful reflection in 2–3 sentences.
- Acknowledge what the user expressed without judgment.
- Identify the core emotion or theme.
- Offer one gentle, actionable reframe or thought to sit with.

Journal entry: "${text}"

Respond only with the reflection text. No headers, no labels.`;

      const result = await model.generateContent(prompt);
      reflectionText = result.response.text().trim();
    } catch (aiErr) {
      console.warn('Gemini Journal Reflection Warning:', aiErr);
    }

    const dateStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let savedEntry = null;
    if (userId) {
      try {
        savedEntry = await prisma.journalEntry.create({
          data: {
            userId,
            date: dateStr,
            text,
            reflection: reflectionText,
            mood: mood ? Number(mood) : 3,
          },
        });
      } catch (dbErr) {
        console.warn('DB journal save warning:', dbErr);
      }
    }

    return res.json({
      status: 'success',
      reflection: reflectionText,
      entry: savedEntry || {
        id: Date.now().toString(),
        date: dateStr,
        text,
        reflection: reflectionText,
        mood: mood ? Number(mood) : 3,
      },
    });
  } catch (err) {
    console.error('Journal reflect API error:', err);
    return res.status(500).json({ error: 'Failed to process journal reflection' });
  }
});

// Fetch past journal entries
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId && typeof userId === 'string') {
      try {
        const journals = await prisma.journalEntry.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        return res.json({ status: 'success', journals });
      } catch (dbErr) {
        console.warn('DB fetch journal warning:', dbErr);
      }
    }

    return res.json({ status: 'success', journals: [] });
  } catch (err) {
    console.error('Fetch journals API error:', err);
    return res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

export default router;
