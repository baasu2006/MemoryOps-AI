import express from 'express';
import { getEmployeeById } from '../data/employees.js';
import { getIncidentsByEmployeeId } from '../data/incidents.js';

const router = express.Router();

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const employee = getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const history = getIncidentsByEmployeeId(id);
    res.json({ ...employee, history });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
