import { Router } from 'express';
import { getGeminiModel } from '../lib/gemini';
import { prisma } from '../lib/db';

const router = Router();

// AI Therapy Chat & Session Summary
router.post('/', async (req, res) => {
  try {
    const { userMessage, conversationHistory = [], assessmentProfile, userId, sessionId } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    const model = getGeminiModel();

    // Session summary request
    if (userMessage === '__SUMMARISE_SESSION__') {
      const sessionText = conversationHistory
        .filter((m: { role: string }) => m.role !== 'assistant' || conversationHistory.indexOf(m) > 0)
        .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'MindWise'}: ${m.content}`)
        .join('\n');

      const summaryPrompt = `You are MindWise AI. Summarise this therapy session in 2-3 sentences. 
Focus on key themes the user shared, any progress made, and one supportive closing thought.
Session:\n${sessionText}`;

      let summaryText = 'Thank you for taking time for this therapy session. Reflecting on your thoughts is an empowering step forward.';
      try {
        const result = await model.generateContent(summaryPrompt);
        summaryText = result.response.text().trim();
      } catch (aiErr) {
        console.warn('Gemini Session Summary Warning:', aiErr);
      }

      if (userId && sessionId) {
        try {
          const userExists = await prisma.user.findUnique({ where: { id: userId } });
          if (userExists) {
            await prisma.therapySession.upsert({
              where: { id: sessionId },
              update: { summary: summaryText },
              create: {
                id: sessionId,
                userId: userId,
                summary: summaryText,
              },
            });
          }
        } catch (dbErr) {
          console.warn('DB session summary update warning:', dbErr);
        }
      }

      return res.json({
        status: 'success',
        role: 'assistant',
        content: summaryText,
      });
    }

    // Build context-aware system prompt
    const profileContext = assessmentProfile
      ? `
User's Psychological Profile (from their assessment):
- Stress Level: ${assessmentProfile.stress}
- Anxiety Level: ${assessmentProfile.anxiety}
- Mood: ${assessmentProfile.mood}
- Sleep Quality: ${assessmentProfile.sleep}
- Self-Esteem: ${assessmentProfile.selfEsteem}

Therapy Style Guidance:
${assessmentProfile.stress === 'High' ? '- Use stress-reduction language, validate overwhelm, suggest manageable steps.' : ''}
${assessmentProfile.anxiety === 'High' ? '- Use grounding techniques, avoid catastrophic language, promote present-moment focus.' : ''}
${assessmentProfile.mood === 'Low' ? '- Use warm, uplifting language. Celebrate small wins. Avoid toxic positivity.' : ''}
${assessmentProfile.sleep === 'Poor' ? '- Acknowledge sleep impact on emotions. Gently suggest sleep hygiene if relevant.' : ''}
${assessmentProfile.selfEsteem === 'Low' ? '- Affirm the user regularly. Challenge self-critical thoughts gently.' : ''}`.trim()
      : 'No assessment profile available. Respond with general empathy and support.';

    const historyText = conversationHistory.length > 0
      ? '\nPrevious conversation context:\n' + conversationHistory
          .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'MindWise'}: ${m.content}`)
          .join('\n')
      : '';

    const prompt = `You are MindWise AI — an empathetic, non-judgmental, trauma-informed conversational mental health companion.
Your audience: college students and young professionals experiencing stress, anxiety, and burnout.

${profileContext}${historyText}

Core guidelines:
1. Validate feelings before offering solutions.
2. Keep responses warm, concise (3–5 sentences), conversational.
3. Never diagnose or prescribe. Always recommend professional help for serious concerns.
4. Use evidence-based techniques (CBT reframing, mindfulness, grounding) when relevant.
5. Ask one meaningful follow-up question to deepen the conversation.

User says: "${userMessage}"`;

    let replyContent = "I'm listening and right here with you. Could you share a bit more about how that feels?";
    try {
      const result = await model.generateContent(prompt);
      replyContent = result.response.text().trim();
    } catch (aiErr) {
      console.warn('Gemini Therapy Chat Warning:', aiErr);
    }

    if (userId && sessionId) {
      try {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (userExists) {
          // Ensure the session exists in the database first
          await prisma.therapySession.upsert({
            where: { id: sessionId },
            update: {},
            create: {
              id: sessionId,
              userId: userId,
            },
          });

          // Insert chat messages linked to the valid session
          await prisma.chatMessage.createMany({
            data: [
              { sessionId, role: 'user', content: userMessage },
              { sessionId, role: 'assistant', content: replyContent },
            ],
          });
        }
      } catch (dbErr) {
        console.warn('DB chat message save warning:', dbErr);
      }
    }

    return res.json({
      status: 'success',
      role: 'assistant',
      content: replyContent,
    });
  } catch (err) {
    console.error('Therapy API Error:', err);
    return res.status(500).json({ error: 'Failed to generate AI therapy response' });
  }
});

// Log guided session completion
router.post('/guided/complete', async (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Session type is required' });
    }

    if (userId) {
      try {
        const completion = await prisma.guidedCompletion.create({
          data: {
            userId,
            sessionType: type,
          },
        });
        return res.status(201).json({ status: 'success', completion });
      } catch (dbErr) {
        console.warn('DB guided completion save warning:', dbErr);
      }
    }

    return res.json({
      status: 'success',
      completion: { type, completedAt: new Date().toISOString() },
    });
  } catch (err) {
    console.error('Guided completion API Error:', err);
    return res.status(500).json({ error: 'Failed to record guided completion' });
  }
});

export default router;
