import express from 'express';
import { getResolutionIntelligence } from '../services/resolutionIntelligence.js';

const router = express.Router();

/**
 * GET /api/resolution-intelligence/:employeeId
 * 
 * Returns:
 * - action statistics (attempts, successes, failures, successRate)
 * - most successful relevant action
 * - telemetry on analyzed incidents
 */
router.get('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { issue = 'laptop slow' } = req.query;

    console.log(`[API] GET /api/resolution-intelligence/${employeeId} (issue: "${issue}")`);
    const intelligence = await getResolutionIntelligence(employeeId, issue);

    res.json(intelligence);
  } catch (error) {
    console.error('[API] Error in GET /api/resolution-intelligence/:employeeId:', error);
    res.status(500).json({
      error: 'Failed to retrieve resolution intelligence',
      message: error.message || String(error)
    });
  }
});

export default router;
