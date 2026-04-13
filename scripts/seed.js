#!/usr/bin/env node

// ---------------------------------------------------------------------------
// CrewNotice QA Seed Script
//
// Populates a test vessel (M/Y Serenity) with sample data for manual testing.
// Existing seed data (from migrations 002-004) is preserved — this script
// only inserts rows that don't already exist (ON CONFLICT DO NOTHING).
//
// Usage:
//   node scripts/seed.js
//
// Requires .env.local with:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
//
// The script authenticates as Sophie Laurent (admin) to bypass RLS.
// ---------------------------------------------------------------------------

const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// ── Load env ────────────────────────────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
} catch {
  console.error('Could not read .env.local — make sure it exists in the project root.');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Constants ───────────────────────────────────────────────────────────────
const VESSEL_ID = '10000000-0000-0000-0000-000000000001';
const SOPHIE_ID = '20000000-0000-0000-0000-000000000002'; // Admin
const JAMES_ID  = '20000000-0000-0000-0000-000000000001';
const TOM_ID    = '20000000-0000-0000-0000-000000000005';
const MARCO_ID  = '20000000-0000-0000-0000-000000000003';
const LISA_ID   = '20000000-0000-0000-0000-000000000008';

const ADMIN_EMAIL = 'sophie.laurent@serenity.yacht';
const ADMIN_PASS  = 'CrewNotice2026';

// ── Helpers ─────────────────────────────────────────────────────────────────
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function log(icon, msg) {
  console.log(`  ${icon}  ${msg}`);
}

// ── Seed data ───────────────────────────────────────────────────────────────
async function seedNotices() {
  const notices = [
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: SOPHIE_ID,
      title: 'Provisioning Order — Due Thursday',
      body: 'All departments: please submit your provisioning requests to Interior by end of day Wednesday. Include quantities, preferred brands, and any special dietary requirements for the upcoming charter.',
      category: 'Operations',
      priority: 'important',
      department_target: 'All',
      is_pinned: false,
      requires_acknowledgement: false,
    },
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: JAMES_ID,
      title: 'Fire Drill — Friday 0900',
      body: 'Mandatory fire drill on Friday at 0900hrs. All crew to muster at assigned stations per the fire plan. SCBA teams to have sets ready for deployment. This is a Class A exercise — full turnout required.',
      category: 'Safety',
      priority: 'critical',
      department_target: 'All',
      is_pinned: true,
      requires_acknowledgement: true,
    },
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: SOPHIE_ID,
      title: 'Interior Deep Clean Schedule',
      body: 'Deep clean rotation for guest cabins starts Monday. See attached schedule for assignments. All interior crew to complete assigned areas by Wednesday EOD.',
      category: 'Departmental',
      priority: 'routine',
      department_target: 'Interior',
      is_pinned: false,
      requires_acknowledgement: true,
    },
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: MARCO_ID,
      title: 'Engine Room Safety Briefing Update',
      body: 'Updated hot work permit procedures are now in effect. All crew entering the engine room must check the whiteboard for active permits. New lockout/tagout tags have been distributed to all engineers.',
      category: 'Safety',
      priority: 'important',
      department_target: 'Engine',
      is_pinned: false,
      requires_acknowledgement: true,
    },
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: LISA_ID,
      title: 'Crew Movie Night — Sunday',
      body: 'Movie night on the sundeck this Sunday at 2000hrs. Popcorn and snacks provided. We are watching Top Gun: Maverick. Off-watch crew welcome. Bring blankets, it gets chilly up there!',
      category: 'Social',
      priority: 'routine',
      department_target: 'All',
      is_pinned: false,
      requires_acknowledgement: false,
    },
  ];

  const { error } = await supabase.from('notices').insert(notices);
  if (error) throw new Error(`Notices: ${error.message}`);
  log('📋', `${notices.length} notices created`);
}

async function seedEvents() {
  const events = [
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: SOPHIE_ID,
      event_type: 'guest_visit',
      title: 'Charter Guests — Williams Family',
      description: '7-day charter starting Monday. 4 adults, 2 children (ages 8 and 12). Departing from Antibes marina, itinerary includes Saint-Tropez, Porquerolles, and Corsica.',
      start_date: daysFromNow(3),
      end_date: daysFromNow(10),
      status: 'upcoming',
      notification_schedule: [
        { days_before: 3, sent: false },
        { days_before: 1, sent: false },
      ],
    },
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: JAMES_ID,
      event_type: 'passage',
      title: 'Passage to Saint-Tropez',
      description: 'Overnight passage from Antibes to Saint-Tropez. Estimated departure 2200hrs, arrival 0600hrs. Bridge watches per standard rotation.',
      start_date: daysFromNow(4),
      end_date: daysFromNow(5),
      status: 'upcoming',
      notification_schedule: [{ days_before: 1, sent: false }],
    },
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: MARCO_ID,
      event_type: 'maintenance',
      title: 'Watermaker Service',
      description: 'Scheduled watermaker membrane replacement and system flush. Freshwater production will be offline for approximately 6 hours. All departments please conserve water usage during this period.',
      start_date: daysFromNow(2),
      end_date: daysFromNow(2),
      status: 'upcoming',
      notification_schedule: [{ days_before: 1, sent: false }],
    },
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: SOPHIE_ID,
      event_type: 'social',
      title: 'Crew Birthday — Marco',
      description: 'Surprise birthday celebration for Marco in the crew mess. Cake at 1600hrs. Interior handling decorations. Keep it quiet!',
      start_date: daysFromNow(6),
      status: 'upcoming',
      notification_schedule: [{ days_before: 1, sent: false }],
    },
  ];

  // Insert events
  const { data: insertedEvents, error } = await supabase
    .from('events')
    .insert(events)
    .select('id, title');
  if (error) throw new Error(`Events: ${error.message}`);

  // Add department briefings for the charter event
  const charterId = insertedEvents[0].id;
  const briefings = [
    { event_id: charterId, department: 'Interior', content: 'Prepare master cabin with hypoallergenic bedding. Mrs Williams has a peanut allergy — inform galley. Children in VIP 2 with connecting door to parents in master. Stock kid-friendly activities and games.', sort_order: 0 },
    { event_id: charterId, department: 'Deck', content: 'Prepare tender and all water toys. Ensure paddleboards, kayaks, and snorkelling gear are in good condition. Children will want banana boat rides — check tow rope condition. Have lifejackets in children\'s sizes ready.', sort_order: 1 },
    { event_id: charterId, department: 'Engine', content: 'Full systems check before departure. Ensure generators can handle full AC load in all guest areas. Watermaker to be at full capacity by Sunday evening. Check stabiliser operation before passage.', sort_order: 2 },
  ];

  const { error: bErr } = await supabase.from('event_briefings').insert(briefings);
  if (bErr) throw new Error(`Event briefings: ${bErr.message}`);

  log('📅', `${events.length} events created with ${briefings.length} department briefings`);
}

async function seedTrainingModules() {
  const modules = [
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: SOPHIE_ID,
      title: 'Guest Service Excellence',
      description: 'Standards and procedures for delivering 5-star guest service on board.',
      content: JSON.stringify([
        { type: 'text', value: 'Guest service on a superyacht is about anticipation, discretion, and attention to detail. Every interaction should feel effortless and personalised.' },
        { type: 'text', value: 'Key principles:\n\n1. Anticipate needs before they are expressed\n2. Remember guest preferences and apply them consistently\n3. Maintain professional distance while being warm and approachable\n4. Never say "no" — offer alternatives\n5. Communicate guest requests to the relevant department immediately' },
        { type: 'text', value: 'Service timing standards:\n- Morning coffee/tea within 5 minutes of guest rising\n- Drinks at anchor/beach club within 3 minutes of order\n- Meal service at captain\'s table within 10 minutes of being seated\n- Cabin turndown completed within 15 minutes' },
      ]),
      pass_mark: 80,
      time_limit_minutes: null,
      randomise_questions: false,
      is_published: true,
    },
    {
      id: uuid(),
      vessel_id: VESSEL_ID,
      created_by: JAMES_ID,
      title: 'STCW Fire Safety Refresher',
      description: 'Refresher on fire prevention, detection, and response procedures per STCW requirements.',
      content: JSON.stringify([
        { type: 'text', value: 'Fire is the greatest threat at sea. This refresher covers the fire triangle, classes of fire, and your vessel-specific fire plan.' },
        { type: 'text', value: 'Fire classes:\n- Class A: Ordinary combustibles (wood, paper, fabric)\n- Class B: Flammable liquids (fuel, oil, paint)\n- Class C: Flammable gases (LPG, acetylene)\n- Class D: Metal fires (rarely applicable on yachts)\n- Class F: Cooking oils and fats' },
        { type: 'text', value: 'Response procedure:\n1. Raise the alarm (fire panel / VHF)\n2. Attempt to contain if safe (close doors/vents)\n3. Muster at assigned station\n4. SCBA team deploys to scene\n5. Bridge initiates emergency checklist' },
      ]),
      pass_mark: 70,
      time_limit_minutes: 10,
      randomise_questions: true,
      is_published: true,
    },
  ];

  const { data: insertedModules, error } = await supabase
    .from('training_modules')
    .insert(modules)
    .select('id, title');
  if (error) throw new Error(`Training modules: ${error.message}`);

  // Add quiz questions for the fire safety module
  const fireModuleId = insertedModules[1].id;
  // Options format: [{ id, text, is_correct }] — matches the quiz API schema
  const mkOpts = (texts, correctIdx) => texts.map((text, i) => ({
    id: uuid(), text, is_correct: i === correctIdx,
  }));

  const questions = [
    {
      id: uuid(),
      module_id: fireModuleId,
      question_text: 'What class of fire involves flammable liquids?',
      question_type: 'multiple_choice',
      options: mkOpts(['Class A', 'Class B', 'Class C', 'Class F'], 1),
      explanation: 'Class B fires involve flammable liquids such as fuel, oil, and paint.',
      sort_order: 0,
    },
    {
      id: uuid(),
      module_id: fireModuleId,
      question_text: 'What is the FIRST action when discovering a fire on board?',
      question_type: 'multiple_choice',
      options: mkOpts(['Attempt to extinguish it', 'Raise the alarm', 'Close all doors', 'Put on SCBA'], 1),
      explanation: 'Always raise the alarm first so the entire crew is aware and can respond according to the emergency plan.',
      sort_order: 1,
    },
    {
      id: uuid(),
      module_id: fireModuleId,
      question_text: 'What type of fire extinguisher should be used on a cooking oil fire (Class F)?',
      question_type: 'multiple_choice',
      options: mkOpts(['Water', 'CO2', 'Wet chemical', 'Dry powder'], 2),
      explanation: 'Wet chemical extinguishers are specifically designed for Class F (cooking oil/fat) fires. Never use water on a fat fire.',
      sort_order: 2,
    },
    {
      id: uuid(),
      module_id: fireModuleId,
      question_text: 'What does SCBA stand for?',
      question_type: 'multiple_choice',
      options: mkOpts(['Self-Contained Breathing Apparatus', 'Safety Control Board Assembly', 'Standard Crew Briefing Action', 'Ship Communication Broadcast Alert'], 0),
      explanation: 'SCBA stands for Self-Contained Breathing Apparatus, used by fire teams to breathe in smoke-filled environments.',
      sort_order: 3,
    },
    {
      id: uuid(),
      module_id: fireModuleId,
      question_text: 'The three elements of the fire triangle are:',
      question_type: 'multiple_choice',
      options: mkOpts(['Heat, fuel, oxygen', 'Heat, water, fuel', 'Oxygen, CO2, fuel', 'Fuel, spark, wind'], 0),
      explanation: 'The fire triangle consists of heat, fuel, and oxygen. Remove any one element and the fire cannot sustain itself.',
      sort_order: 4,
    },
  ];

  const { error: qErr } = await supabase.from('quiz_questions').insert(questions);
  if (qErr) throw new Error(`Quiz questions: ${qErr.message}`);

  // Assign both modules to all crew
  const { data: crew } = await supabase
    .from('crew_members')
    .select('id')
    .eq('vessel_id', VESSEL_ID)
    .eq('is_active', true);

  if (crew && crew.length > 0) {
    const assignments = [];
    for (const mod of insertedModules) {
      for (const cm of crew) {
        assignments.push({
          id: uuid(),
          module_id: mod.id,
          crew_member_id: cm.id,
          assigned_by: SOPHIE_ID,
          deadline: daysFromNow(14),
          status: 'assigned',
        });
      }
    }
    const { error: aErr } = await supabase.from('training_assignments').insert(assignments);
    if (aErr) throw new Error(`Training assignments: ${aErr.message}`);
    log('🎓', `${modules.length} training modules with ${questions.length} quiz questions, assigned to ${crew.length} crew`);
  } else {
    log('🎓', `${modules.length} training modules created (no crew found for assignments)`);
  }
}

async function seedActivityLog() {
  const entries = [
    { action: 'notice_posted', target_type: 'notice', metadata: { title: 'Provisioning Order — Due Thursday' } },
    { action: 'notice_posted', target_type: 'notice', metadata: { title: 'Fire Drill — Friday 0900', priority: 'critical' } },
    { action: 'document_acknowledged', target_type: 'document', metadata: { title: 'Tender Operations SOP' } },
    { action: 'training_completed', target_type: 'training', metadata: { title: 'Guest Service Excellence', score: 90, passed: true } },
    { action: 'event_created', target_type: 'event', metadata: { title: 'Charter Guests — Williams Family' } },
    { action: 'crew_login', target_type: 'session', metadata: {} },
  ];

  const rows = entries.map(e => ({
    id: uuid(),
    vessel_id: VESSEL_ID,
    crew_member_id: SOPHIE_ID,
    action: e.action,
    target_type: e.target_type,
    target_id: null,
    metadata: e.metadata,
  }));

  const { error } = await supabase.from('activity_log').insert(rows);
  if (error) throw new Error(`Activity log: ${error.message}`);
  log('📊', `${rows.length} activity log entries created`);
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n  CrewNotice QA Seed Script');
  console.log('  ========================\n');

  // Authenticate as admin to bypass RLS
  log('🔑', 'Signing in as Sophie Laurent (admin)...');
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });
  if (authErr) {
    console.error(`\n  Auth failed: ${authErr.message}`);
    console.error('  Make sure the dev accounts are seeded (migration 007) and passwords are set.\n');
    process.exit(1);
  }
  log('✅', 'Authenticated');

  try {
    await seedNotices();
    await seedEvents();
    await seedTrainingModules();
    await seedActivityLog();
  } catch (err) {
    console.error(`\n  Seed failed: ${err.message}\n`);
    process.exit(1);
  }

  console.log('\n  ✅ QA seed data inserted successfully!');
  console.log('  Log in as sophie.laurent@serenity.yacht / CrewNotice2026 to verify.\n');
  process.exit(0);
}

main();
