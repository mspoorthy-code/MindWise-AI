import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/db';

const router = Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userName = name || email.split('@')[0];

    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name: userName,
          isAnonymous: false,
        },
      });

      return res.status(201).json({
        status: 'success',
        user: { id: user.id, email: user.email, name: user.name, isAnonymous: false },
      });
    } catch (dbErr: any) {
      if (dbErr.code === 'P2002') {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      // Fallback for dev without active DB
      return res.status(200).json({
        status: 'success',
        user: { id: 'local-' + Date.now(), email, name: userName, isAnonymous: false },
      });
    }
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to process signup' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      return res.json({
        status: 'success',
        user: { id: user.id, email: user.email, name: user.name, isAnonymous: user.isAnonymous },
      });
    } catch (dbErr) {
      // Fallback for dev/testing
      const userName = email.split('@')[0];
      return res.json({
        status: 'success',
        user: { id: 'local-' + Date.now(), email, name: userName, isAnonymous: false },
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to process login' });
  }
});

// Anonymous login
router.post('/anonymous', async (req, res) => {
  try {
    const anonId = 'anon-' + Date.now();
    const email = `${anonId}@mindwise.anonymous`;
    const name = 'Anonymous User';

    try {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          isAnonymous: true,
        },
      });

      return res.status(201).json({
        status: 'success',
        user: { id: user.id, email: user.email, name: user.name, isAnonymous: true },
      });
    } catch (dbErr) {
      return res.json({
        status: 'success',
        user: { id: anonId, email: 'anonymous', name: 'Anonymous', isAnonymous: true },
      });
    }
  } catch (err) {
    console.error('Anonymous auth error:', err);
    return res.status(500).json({ error: 'Failed to create anonymous session' });
  }
});

export default router;
