import express from 'express';
import chatRouter from './chat.js';
import diagnosticRouter from './diagnostic.js';
import actionRouter from './action.js';
import authorizeRouter from './authorize.js';
import incidentsRouter from './incidents.js';
import memoryRouter from './memory.js';
import employeesRouter from './employees.js';
import ticketsRouter from './tickets.js';
import resolutionIntelligenceRouter from './resolutionIntelligence.js';
import { verifyResolution } from '../tools/itTools.js';

const router = express.Router();

router.use('/chat', chatRouter);
router.use('/diagnostic', diagnosticRouter);
router.use('/action', actionRouter);
router.use('/authorize', authorizeRouter);
router.use('/incidents', incidentsRouter);
router.use('/memory', memoryRouter);
router.use('/employee', employeesRouter);
router.use('/tickets', ticketsRouter);
router.use('/resolution-intelligence', resolutionIntelligenceRouter);

// POST /api/verify - standalone verify route
router.post('/verify', (req, res) => {
  try {
    const { before, after } = req.body;
    if (!before || !after) {
      return res.status(400).json({ error: 'Missing before or after data' });
    }
    const result = verifyResolution(before, after);
    res.json(result);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
