// Runs 10 test stories through the real extraction pipeline and prints a
// pass/fail summary. Throttled to stay under the free-tier rate limit.
// Usage: node ai/runTestStories.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import FormSchema from '../models/FormSchema.js';
import { extractClaim } from './extractClaim.js';

const DELAY_MS = 15_000; // stays under 5 requests/minute
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Each case: the story, plus the answers we expect the model to find.
// "expect: null" for a key means we deliberately don't check it (ambiguous
// in the story), so a missing value there is not counted as a failure.
const cases = [
  {
    label: 'deer on I-95 (from the plan)',
    story: 'I hit a deer on I-95 yesterday in my Honda and the windshield shattered.',
    expect: { incidentType: 'animal_collision', animalType: 'deer', vehicleMake: 'honda', damageArea: 'windshield' },
  },
  {
    label: 'collision, other driver at fault',
    story: 'Someone rear-ended my Toyota Corolla at a red light on Main Street this morning. It was clearly their fault. My bumper is dented.',
    expect: { incidentType: 'collision', vehicleMake: 'toyota', otherPartyAtFault: true, damageArea: 'rear' },
  },
  {
    label: 'theft, no vehicle damage mentioned',
    story: 'My car was stolen from the parking lot outside my apartment last night.',
    expect: { incidentType: 'theft' },
  },
  {
    label: 'collision, fault unclear',
    story: 'I was in a fender bender with another car on the highway. Not sure whose fault it was.',
    expect: { incidentType: 'collision' },
  },
  {
    label: 'animal collision, not a deer',
    story: 'A raccoon ran into the road and I couldn\'t avoid it. Hit it with the front of my Ford pickup.',
    expect: { incidentType: 'animal_collision', animalType: 'other', vehicleMake: 'ford', damageArea: 'front' },
  },
  {
    label: 'injuries reported',
    story: 'I was hit from the side by another vehicle at an intersection. My neck hurts and I think I need to see a doctor.',
    expect: { incidentType: 'collision', damageArea: 'side', injuriesReported: true },
  },
  {
    label: 'vehicle not driveable',
    story: 'My Hyundai collided with a deer on a rural road. The front end is completely smashed and the car won\'t start.',
    expect: { incidentType: 'animal_collision', animalType: 'deer', vehicleMake: 'hyundai', damageArea: 'front', vehicleDriveable: false },
  },
  {
    label: 'minimal story, most fields missing',
    story: 'I was in an accident yesterday.',
    expect: { incidentType: null },
  },
  {
    label: 'other party insured (3-level chain)',
    story: 'A driver in a Ford ran a stop sign and hit my Honda Civic on the side. The other driver was at fault and gave me their insurance information.',
    expect: { incidentType: 'collision', vehicleMake: 'honda', damageArea: 'side', otherPartyAtFault: true, otherPartyInsured: true },
  },
  {
    label: 'VIN mentioned',
    story: 'My Toyota with VIN 1HGCM82633A004352 was damaged in a collision with another car at a parking garage.',
    expect: { incidentType: 'collision', vehicleMake: 'toyota', vin: '1HGCM82633A004352' },
  },
];

function checkExpectations(expect, answers) {
  const problems = [];
  for (const [key, expected] of Object.entries(expect)) {
    if (expected === null) continue; // intentionally not checked
    if (answers[key] !== expected) {
      problems.push(`${key}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(answers[key] ?? null)}`);
    }
  }
  return problems;
}

async function run() {
  await connectDB(process.env.MONGODB_URI);
  const form = await FormSchema.findOne({ formId: 'auto_claim_v1' }).sort({ version: -1 }).lean();
  if (!form) throw new Error('Seed the database first: npm run seed');

  console.log(`Using form version ${form.version}. Running ${cases.length} stories...\n`);

  let passed = 0;
  for (let i = 0; i < cases.length; i++) {
    const { label, story, expect: expected } = cases[i];
    process.stdout.write(`[${i + 1}/${cases.length}] ${label} ... `);
    try {
      const { answers, missing, rejected } = await extractClaim(form, story);
      const problems = checkExpectations(expected, answers);
      if (problems.length === 0) {
        console.log('PASS');
        passed++;
      } else {
        console.log('FAIL');
        for (const p of problems) console.log(`    ${p}`);
      }
      if (rejected.length) console.log(`    rejected: ${JSON.stringify(rejected)}`);
      if (missing.length) console.log(`    missing (required, unanswered): ${missing.join(', ')}`);
    } catch (err) {
      console.log('ERROR');
      console.log(`    ${err.message}`);
    }
    if (i < cases.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n${passed}/${cases.length} passed.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Script failed:', err.message);
  process.exitCode = 1;
});
