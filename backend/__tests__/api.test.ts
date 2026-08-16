import request from 'supertest';
import app from '../src/app';

describe('MindWise AI Backend API Tests', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/anonymous should return anonymous user session', async () => {
    const res = await request(app).post('/api/auth/anonymous');
    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('success');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.isAnonymous).toBe(true);
  });

  it('POST /api/assessment should accept and save psychological profile', async () => {
    const res = await request(app).post('/api/assessment').send({
      userId: 'test-user',
      profile: {
        stress: 'Moderate',
        anxiety: 'Low',
        mood: 'Good',
        sleep: 'Good',
        selfEsteem: 'High',
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.profile.stress).toBe('Moderate');
  });

  it('POST /api/mood should log a mood entry', async () => {
    const res = await request(app).post('/api/mood').send({
      userId: 'test-user',
      score: 4,
      label: 'Good',
      emoji: '🙂',
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('success');
    expect(res.body.mood.score).toBe(4);
  });

  it('POST /api/journal/reflect should validate short entries', async () => {
    const res = await request(app).post('/api/journal/reflect').send({ text: 'too short' });
    expect(res.status).toBe(400);
  });
});
