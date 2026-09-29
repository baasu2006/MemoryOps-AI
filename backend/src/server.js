import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { initializeBank } from './memory/hindsight.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      groq: !!process.env.GROQ_API_KEY,
      hindsight: !!process.env.HINDSIGHT_API_KEY,
      hindsightUrl: process.env.HINDSIGHT_API_URL || 'not configured'
    }
  });
});

// Mount API routes
app.use('/api', router);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 MemoryOps AI Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Groq API Key: ${process.env.GROQ_API_KEY ? '✓ configured' : '✗ missing'}`);
  console.log(`   Hindsight API Key: ${process.env.HINDSIGHT_API_KEY ? '✓ configured' : '✗ missing'}`);
  console.log(`   Hindsight URL: ${process.env.HINDSIGHT_API_URL || 'not set'}`);
  console.log(`   Hindsight Bank: ${process.env.HINDSIGHT_BANK_ID || 'not set'}\n`);

  // Initialize Hindsight bank
  if (process.env.HINDSIGHT_API_KEY) {
    console.log('📡 Initializing Hindsight memory bank...');
    const result = await initializeBank();
    if (result.success) {
      console.log('✓ Hindsight memory bank ready');
    } else {
      console.warn('⚠ Hindsight initialization warning:', result.error);
    }
  } else {
    console.warn('⚠ Hindsight API key not configured. Memory features will be limited.');
  }
});
