import express from 'express';
import { runDiagnostic } from '../tools/diagnostic.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { employeeId, deviceId } = req.body;
    if (!employeeId || !deviceId) {
      return res.status(400).json({ error: 'Missing employeeId or deviceId' });
    }
    const results = runDiagnostic(employeeId, deviceId);
    res.json(results);
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
