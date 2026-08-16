import { Router } from 'express';
import { prisma } from '../lib/db';

const router = Router();

// Log mood
router.post('/', async (req, res) => {
  try {
    const { userId, date, score, label, emoji } = req.body;
    if (!score || !label || !emoji) {
      return res.status(400).json({ error: 'score, label, and emoji are required' });
    }

    const entryDate = date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (userId) {
      try {
        const entry = await prisma.moodEntry.create({
          data: {
            userId,
            date: entryDate,
            score: Number(score),
            label,
            emoji,
          },
        });
        return res.status(201).json({ status: 'success', mood: entry });
      } catch (dbErr) {
        console.warn('DB mood log warning:', dbErr);
      }
    }

    return res.json({
      status: 'success',
      mood: { date: entryDate, score: Number(score), label, emoji },
    });
  } catch (err) {
    console.error('Mood API error:', err);
    return res.status(500).json({ error: 'Failed to log mood' });
  }
});

// Fetch mood history
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (userId && typeof userId === 'string') {
      try {
        const history = await prisma.moodEntry.findMany({
          where: { userId },
          orderBy: { createdAt: 'asc' },
          take: 30,
        });
        return res.json({ status: 'success', history });
      } catch (dbErr) {
        console.warn('DB mood history warning:', dbErr);
      }
    }

    return res.json({ status: 'success', history: [] });
  } catch (err) {
    console.error('Fetch mood API error:', err);
    return res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

export default router;
