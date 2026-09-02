import app from './app';

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`🧠 MindWise AI Backend Server running on http://localhost:${PORT}`);
});
