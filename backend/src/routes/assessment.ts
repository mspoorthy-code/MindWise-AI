import { Router } from 'express';
import { prisma } from '../lib/db';

const router = Router();

// Save assessment profile
router.post('/', async (req, res) => {
  try {
    const { userId, profile, answers } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Assessment profile data is required' });
    }

    const { stress, anxiety, mood, sleep, selfEsteem } = profile;

    if (userId) {
      try {
        const saved = await prisma.assessmentProfile.create({
          data: {
            userId,
            stress: stress || 'Moderate',
            anxiety: anxiety || 'Moderate',
            mood: mood || 'Good',
            sleep: sleep || 'Fair',
            selfEsteem: selfEsteem || 'Moderate',
            answers: answers ? JSON.stringify(answers) : null,
          },
        });
        return res.status(201).json({ status: 'success', profile: saved });
      } catch (dbErr) {
        console.warn('DB save profile warning:', dbErr);
      }
    }

    return res.json({ status: 'success', profile: { stress, anxiety, mood, sleep, selfEsteem } });
  } catch (err) {
    console.error('Assessment API error:', err);
    return res.status(500).json({ error: 'Failed to save assessment profile' });
  }
});

// Fetch latest assessment profile for user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    try {
      const latestProfile = await prisma.assessmentProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (latestProfile) {
        return res.json({ status: 'success', profile: latestProfile });
      }
    } catch (dbErr) {
      console.warn('DB fetch profile warning:', dbErr);
    }

    return res.json({ status: 'success', profile: null });
  } catch (err) {
    console.error('Fetch assessment API error:', err);
    return res.status(500).json({ error: 'Failed to fetch assessment profile' });
  }
});

export default router;
