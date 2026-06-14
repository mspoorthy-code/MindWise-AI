import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessment';
import moodRoutes from './routes/mood';
import journalRoutes from './routes/journal';
import therapyRoutes from './routes/therapy';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MindWise AI Backend', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/therapy', therapyRoutes);

export default app;

// Initial project setup completed

// Psychological assessment engine integrated

// Google Gemini AI model connected

// Mood tracking and trend chart added

// AI journaling reflection + tests added

// Guided therapy sessions (CBT, grounding, box breathing)
