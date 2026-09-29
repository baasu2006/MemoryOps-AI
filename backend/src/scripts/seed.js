import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeBank, retainIncidentMemory } from '../memory/hindsight.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log('\n======================================================');
  console.log('🚀 MemoryOps AI — Hindsight Memory Bank Seeding Process');
  console.log('======================================================\n');

  const apiKey = process.env.HINDSIGHT_API_KEY;
  const bankId = process.env.HINDSIGHT_BANK_ID || 'memoryops-it-support';

  if (!apiKey) {
    console.warn('⚠️  HINDSIGHT_API_KEY is not set in environment variables.');
    console.warn('   To seed memories to live Hindsight Cloud, set HINDSIGHT_API_KEY in backend/.env.');
    console.warn('   Proceeding in simulation verification mode...\n');
  }

  // 1. Read synthetic datasets
  const incidentsPath = path.resolve(__dirname, '../../../data/incidents.json');
  const employeesPath = path.resolve(__dirname, '../../../data/employees.json');

  const incidents = JSON.parse(fs.readFileSync(incidentsPath, 'utf8'));
  const employees = JSON.parse(fs.readFileSync(employeesPath, 'utf8'));

  console.log(`📦 Loaded ${employees.length} synthetic employees`);
  console.log(`📦 Loaded ${incidents.length} historical incidents\n`);

  // 2. Initialize Memory Bank
  if (apiKey) {
    console.log(`📡 Connecting to Hindsight Cloud (Bank: ${bankId})...`);
    const initRes = await initializeBank();
    if (initRes.success) {
      console.log('✓ Memory bank confirmed/created successfully.\n');
    }
  }

  // 3. Seed incident memories into Hindsight
  console.log('🧠 Seeding incident memories into Hindsight:');
  let retainedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < incidents.length; i++) {
    const inc = incidents[i];
    process.stdout.write(`  [${i + 1}/${incidents.length}] ${inc.id} (${inc.employeeId} - ${inc.issue})... `);

    try {
      const res = await retainIncidentMemory(inc);
      if (res.success) {
        console.log('✓ Retained');
        retainedCount++;
      } else {
        console.log(`○ Simulated (${res.error || 'local verification'})`);
        skippedCount++;
      }
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
      skippedCount++;
    }
  }

  console.log('\n======================================================');
  console.log('📊 Seeding Summary:');
  console.log(`   Total Incidents Processed: ${incidents.length}`);
  console.log(`   Cloud Memories Retained:   ${retainedCount}`);
  console.log(`   Local/Simulated Items:     ${skippedCount}`);
  console.log('======================================================\n');
  console.log('✅ Seed process completed successfully.\n');
}

seed().catch(err => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
