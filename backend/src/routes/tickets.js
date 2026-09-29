import express from 'express';

const router = express.Router();
let tickets = [];
let ticketCounter = 1;

router.get('/', (req, res) => {
  res.json(tickets);
});

router.post('/', (req, res) => {
  try {
    const ticketData = req.body;
    const ticketId = `INC-2026-${ticketCounter.toString().padStart(4, '0')}`;
    ticketCounter++;
    
    const newTicket = {
      id: ticketId,
      ...ticketData,
      createdAt: new Date().toISOString()
    };
    
    tickets.push(newTicket);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
