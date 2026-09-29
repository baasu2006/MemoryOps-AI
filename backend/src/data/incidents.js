import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rawIncidents = [];
try {
  const jsonPath = path.resolve(__dirname, '../../../data/incidents.json');
  if (fs.existsSync(jsonPath)) {
    const data = fs.readFileSync(jsonPath, 'utf8');
    rawIncidents = JSON.parse(data);
  }
} catch (e) {
  console.warn('[Data] Notice reading incidents.json:', e.message);
}

export let incidents = [...rawIncidents];

export function getIncidents() {
  return incidents;
}

export function addIncident(incident) {
  incidents.unshift(incident);
}

export function getIncidentsByEmployeeId(id) {
  return incidents.filter(i => i.employeeId === id || i.id === id);
}
