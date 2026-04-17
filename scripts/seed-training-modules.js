#!/usr/bin/env node

// ---------------------------------------------------------------------------
// Seed Training Modules Script
//
// Inserts 5 comprehensive training modules with quiz questions into Supabase.
// Each module has structured content sections and multiple-choice quizzes.
//
// Usage:
//   node scripts/seed-training-modules.js
//
// Requires .env.local with:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
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
const ADMIN_EMAIL = 'sophie.laurent@serenity.yacht';
const ADMIN_PASS = 'CrewNotice2026';

// ── Helpers ─────────────────────────────────────────────────────────────────
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function log(icon, msg) {
  console.log(`  ${icon}  ${msg}`);
}

/** Build options array: [{ id, text, is_correct }] */
function mkOpts(texts, correctIdx) {
  return texts.map((text, i) => ({
    id: uuid(),
    text,
    is_correct: i === correctIdx,
  }));
}

// ── Module definitions ──────────────────────────────────────────────────────

function buildModules(adminId) {
  return [
    // ────────────────────────────────────────────────────────────────────────
    // MODULE 1: Fire Safety & Extinguisher Types
    // ────────────────────────────────────────────────────────────────────────
    {
      module: {
        id: uuid(),
        vessel_id: VESSEL_ID,
        created_by: adminId,
        title: 'Fire Safety & Extinguisher Types',
        description: 'Comprehensive training on fire classifications, extinguisher types, the PASS technique, extinguisher locations on board, and when NOT to fight a fire.',
        content: [
          { type: 'text', value: 'Section 1: Types of Fire\n\nFires are classified by the material that is burning:\n\n• Class A — Solid materials: wood, paper, textiles\n• Class B — Flammable liquids: fuel, oil, paint\n• Class C — Flammable gases: propane, butane\n• Class D — Metals: magnesium, aluminium\n• Class E / Electrical — Electrical equipment. Remove the power source first before attempting to extinguish.\n• Class F — Cooking oils and fats. Never use water on a Class F fire.' },
          { type: 'text', value: 'Section 2: Extinguisher Types\n\n• Water (Red label) — Class A only. NEVER use on electrical or liquid fires.\n• Foam (Cream label) — Class A and B. Not suitable for electrical fires.\n• CO2 (Black label) — Electrical fires and Class B. Does not leave residue. Risk of oxygen displacement in enclosed spaces.\n• Dry Powder (Blue label) — Multi-purpose A/B/C. Leaves residue and can obscure vision.\n• Wet Chemical (Yellow label) — Class F cooking oil fires. Designed specifically for galley use.' },
          { type: 'text', value: 'Section 3: Using an Extinguisher — PASS Technique\n\nP — Pull the pin\nA — Aim at the base of the fire\nS — Squeeze the handle\nS — Sweep side to side\n\nAlways maintain a safe distance and ensure you have a clear escape route behind you.' },
          { type: 'text', value: 'Section 4: Extinguisher Locations On Board\n\nExtinguishers are located at:\n• Bridge\n• Engine room\n• Galley\n• Crew mess\n• Each deck level\n• Tender garage\n\nAll crew must know the locations relevant to their department. Check locations during familiarisation.' },
          { type: 'text', value: 'Section 5: When NOT to Fight a Fire\n\nDo NOT attempt to fight a fire if:\n• The fire is spreading rapidly\n• Escape routes are compromised\n• The smoke is too thick to see\n• You are unsure which extinguisher to use\n\nIn these cases:\n1. Raise the alarm\n2. Evacuate\n3. Close doors behind you\n4. Proceed to muster station' },
        ],
        pass_mark: 80,
        time_limit_minutes: null,
        randomise_questions: true,
        is_published: true,
      },
      questions: [
        {
          question_text: 'What class of fire involves flammable liquids?',
          options: mkOpts(['A', 'B', 'C', 'F'], 1),
          explanation: 'Class B fires involve flammable liquids such as fuel, oil, and paint.',
          sort_order: 0,
        },
        {
          question_text: 'Which extinguisher should NEVER be used on an electrical fire?',
          options: mkOpts(['Water', 'CO2', 'Dry Powder', 'Foam'], 0),
          explanation: 'Water extinguishers (red label) must never be used on electrical fires as water conducts electricity.',
          sort_order: 1,
        },
        {
          question_text: "What does the 'A' in the PASS technique stand for?",
          options: mkOpts(['Aim at the base of the fire', 'Activate the alarm', 'Approach the fire', 'Alert the bridge'], 0),
          explanation: 'PASS: Pull the pin, Aim at the base of the fire, Squeeze the handle, Sweep side to side.',
          sort_order: 2,
        },
        {
          question_text: 'What colour label does a CO2 extinguisher have?',
          options: mkOpts(['Red', 'Cream', 'Black', 'Blue'], 2),
          explanation: 'CO2 extinguishers have a black label. Red = Water, Cream = Foam, Blue = Dry Powder.',
          sort_order: 3,
        },
        {
          question_text: 'A fire in the galley deep fryer is what class?',
          options: mkOpts(['Class A', 'Class B', 'Class E', 'Class F'], 3),
          explanation: 'Cooking oil and fat fires are Class F. Use a wet chemical extinguisher (yellow label).',
          sort_order: 4,
        },
        {
          question_text: 'What should you do if the fire is spreading rapidly and smoke is thick?',
          options: mkOpts(['Use a dry powder extinguisher', 'Evacuate and proceed to muster station', 'Open windows for ventilation', 'Try a different extinguisher type'], 1),
          explanation: 'If the fire is spreading rapidly or smoke is too thick, do not attempt to fight it. Evacuate, close doors behind you, and proceed to the muster station.',
          sort_order: 5,
        },
        {
          question_text: 'Which extinguisher type is best for electrical fires?',
          options: mkOpts(['Water', 'Foam', 'CO2', 'Wet Chemical'], 2),
          explanation: 'CO2 extinguishers are ideal for electrical fires as they do not leave residue and do not conduct electricity.',
          sort_order: 6,
        },
        {
          question_text: 'What risk does CO2 pose in enclosed spaces?',
          options: mkOpts(['Toxic fumes', 'Oxygen displacement', 'Explosion risk', 'Corrosion'], 1),
          explanation: 'CO2 displaces oxygen in enclosed spaces, which can cause asphyxiation. Ensure ventilation after use.',
          sort_order: 7,
        },
        {
          question_text: 'Dry powder extinguishers are suitable for which fire classes?',
          options: mkOpts(['A only', 'A and B', 'A, B, and C', 'All classes'], 2),
          explanation: 'Dry powder (blue label) extinguishers are multi-purpose and suitable for Class A, B, and C fires.',
          sort_order: 8,
        },
        {
          question_text: 'What is the FIRST thing you should do when discovering a fire?',
          options: mkOpts(['Find an extinguisher', 'Raise the alarm', 'Open doors for ventilation', 'Call the coastguard'], 1),
          explanation: 'Always raise the alarm first so the entire crew is aware and can respond according to the emergency plan.',
          sort_order: 9,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // MODULE 2: VHF Radio Procedures
    // ────────────────────────────────────────────────────────────────────────
    {
      module: {
        id: uuid(),
        vessel_id: VESSEL_ID,
        created_by: adminId,
        title: 'VHF Radio Procedures',
        description: 'Channel allocation, phonetic alphabet, standard calls, distress (MAYDAY) and urgency (PAN PAN) procedures, and radio discipline for deck and bridge crew.',
        content: [
          { type: 'text', value: 'Section 1: Channel Allocation\n\n• Channel 16 — International distress and calling frequency. Monitored at all times.\n• Channel 9 — Secondary calling channel in some regions.\n• Channel 06 — Inter-ship safety.\n• Channel 13 — Bridge-to-bridge navigation safety.\n• Working channels — Assigned locally for port operations and marina communications.' },
          { type: 'text', value: 'Section 2: Phonetic Alphabet\n\nAlpha Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliet Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu\n\nUse for spelling vessel names, callsigns, and any unclear words.' },
          { type: 'text', value: 'Section 3: Standard Calls\n\nCalling another vessel:\n"[vessel name] x3, this is [your vessel] x3, on channel [number], over."\n\nResponding:\n"[calling vessel], this is [your vessel], go ahead, over."\n\nEnding:\n"[vessel name], this is [your vessel], out."' },
          { type: 'text', value: 'Section 4: Distress Calls — MAYDAY\n\n"MAYDAY MAYDAY MAYDAY, this is [vessel name] x3, MAYDAY [vessel name], my position is [lat/long], I have [nature of distress], I require [assistance needed], [number] persons on board, over."\n\nOnly used for grave and imminent danger to life or vessel.' },
          { type: 'text', value: 'Section 5: Urgency Calls — PAN PAN\n\n"PAN PAN PAN PAN PAN PAN, all stations all stations all stations, this is [vessel name] x3, [nature of urgency], [position], [assistance required], over."\n\nUsed for urgent situations that are not immediately life-threatening.' },
          { type: 'text', value: 'Section 6: Radio Discipline\n\n• Listen before transmitting\n• Keep messages brief and clear\n• Never use profanity on VHF\n• Do not use Channel 16 for routine communications\n• Always identify your vessel\n• Say "over" when expecting a reply\n• Say "out" when finished (never "over and out")' },
        ],
        pass_mark: 80,
        time_limit_minutes: null,
        randomise_questions: true,
        is_published: true,
      },
      questions: [
        {
          question_text: 'Which channel is the international distress and calling frequency?',
          options: mkOpts(['Channel 6', 'Channel 9', 'Channel 13', 'Channel 16'], 3),
          explanation: 'Channel 16 is the international distress, safety, and calling frequency, monitored at all times.',
          sort_order: 0,
        },
        {
          question_text: 'How many times do you say MAYDAY at the start of a distress call?',
          options: mkOpts(['Once', 'Twice', 'Three times', 'Five times'], 2),
          explanation: 'MAYDAY is spoken three times at the beginning of a distress call for clarity.',
          sort_order: 1,
        },
        {
          question_text: 'What is the phonetic alphabet word for the letter M?',
          options: mkOpts(['Metro', 'Mike', 'Maria', 'Mark'], 1),
          explanation: 'M = Mike in the NATO/ICAO phonetic alphabet.',
          sort_order: 2,
        },
        {
          question_text: 'When should you use a PAN PAN call instead of a MAYDAY?',
          options: mkOpts(['When you need a weather forecast', 'When the situation is urgent but not immediately life-threatening', 'When calling another yacht', 'When requesting port entry'], 1),
          explanation: 'PAN PAN is used for urgent situations that are not immediately life-threatening, such as a medical issue or mechanical failure.',
          sort_order: 3,
        },
        {
          question_text: 'What should you say when you expect a reply from the other station?',
          options: mkOpts(['Out', 'Over', 'Roger', 'Copy'], 1),
          explanation: '"Over" indicates you expect a reply. "Out" means the conversation is finished.',
          sort_order: 4,
        },
        {
          question_text: 'Channel 13 is designated for what purpose?',
          options: mkOpts(['Distress calls', 'Bridge-to-bridge navigation safety', 'Marina bookings', 'Weather forecasts'], 1),
          explanation: 'Channel 13 is used for bridge-to-bridge navigation safety communications.',
          sort_order: 5,
        },
        {
          question_text: 'What should you do before transmitting on VHF?',
          options: mkOpts(['Turn up the volume', 'Listen to check the channel is clear', 'Switch to high power', 'Press the distress button'], 1),
          explanation: 'Always listen before transmitting to avoid interfering with other communications.',
          sort_order: 6,
        },
        {
          question_text: 'What do you say to end a VHF conversation?',
          options: mkOpts(['Over', 'Out', 'Roger out', 'End transmission'], 1),
          explanation: '"Out" signals the end of a conversation. Never say "over and out" — they are contradictory.',
          sort_order: 7,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // MODULE 3: COSHH Awareness for Interior Crew
    // ────────────────────────────────────────────────────────────────────────
    {
      module: {
        id: uuid(),
        vessel_id: VESSEL_ID,
        created_by: adminId,
        title: 'COSHH Awareness for Interior Crew',
        description: 'Control of Substances Hazardous to Health — identifying hazardous substances, common yacht cleaning hazards, PPE requirements, safe storage, and emergency response procedures.',
        content: [
          { type: 'text', value: 'Section 1: What is COSHH?\n\nCOSHH stands for Control of Substances Hazardous to Health. It is a legal requirement to assess and control exposure to hazardous substances in the workplace.\n\nOn a yacht, this primarily involves cleaning chemicals, laundry products, and personal care products used in guest areas.' },
          { type: 'text', value: 'Section 2: Identifying Hazardous Substances\n\nGHS (Globally Harmonised System) pictograms:\n• Skull and crossbones — Toxic\n• Flame — Flammable\n• Exclamation mark — Irritant\n• Corrosion symbol — Corrosive\n• Health hazard — Long-term health effects\n\nAlways check the product label and Safety Data Sheet (SDS) before using any chemical for the first time.' },
          { type: 'text', value: 'Section 3: Common Yacht Cleaning Hazards\n\n• Mixing bleach with acidic cleaners produces chlorine gas (potentially fatal)\n• Aerosol products in unventilated cabins cause respiratory irritation\n• Prolonged skin contact with alkaline cleaners causes chemical burns\n• Oven cleaners produce toxic fumes in enclosed spaces\n\nNever mix cleaning chemicals unless the manufacturer specifically states it is safe to do so.' },
          { type: 'text', value: 'Section 4: Personal Protective Equipment (PPE)\n\n• Nitrile gloves — Minimum for all cleaning operations\n• Safety goggles — When using corrosive products\n• Apron — For heavy chemical use\n• Respiratory mask — For oven cleaners and products used in poorly ventilated spaces\n\nPPE must be worn even for quick jobs. "It will only take a second" is not a valid reason to skip PPE.' },
          { type: 'text', value: 'Section 5: Safe Storage\n\n• Chemicals stored in designated locker\n• Corrosives on lowest shelf\n• Flammables separate from oxidisers\n• SDS sheets accessible in the locker and digitally via CrewNotice\n• Never decant chemicals into unlabelled containers' },
          { type: 'text', value: 'Section 6: Emergency Response\n\n• Skin contact: Flush with water for 15 minutes\n• Eye contact: Flush with eyewash for 15 minutes\n• Inhalation: Move to fresh air immediately\n• Ingestion: Do NOT induce vomiting. Seek medical advice.\n\nReport ALL chemical incidents to the Captain, no matter how minor.' },
        ],
        pass_mark: 80,
        time_limit_minutes: null,
        randomise_questions: true,
        is_published: true,
      },
      questions: [
        {
          question_text: 'What does COSHH stand for?',
          options: mkOpts(['Control of Substances Hazardous to Health', 'Certificate of Ship Health and Hygiene', 'Code of Safe Handling for Hotels', 'Chemical Operations Safety and Health Handbook'], 0),
          explanation: 'COSHH = Control of Substances Hazardous to Health. It is a legal framework for managing hazardous substances in the workplace.',
          sort_order: 0,
        },
        {
          question_text: 'What happens if you mix bleach with an acidic cleaner?',
          options: mkOpts(['Nothing dangerous', 'Produces chlorine gas which is potentially fatal', 'Creates a more effective cleaner', 'The bleach becomes inactive'], 1),
          explanation: 'Mixing bleach with acidic cleaners produces chlorine gas, which is toxic and potentially fatal. Never mix cleaning chemicals.',
          sort_order: 1,
        },
        {
          question_text: 'What is the minimum PPE required for all cleaning operations?',
          options: mkOpts(['Rubber gloves', 'Nitrile gloves', 'Safety goggles', 'Full face mask'], 1),
          explanation: 'Nitrile gloves are the minimum PPE for all cleaning operations. Additional PPE is required for more hazardous tasks.',
          sort_order: 2,
        },
        {
          question_text: 'The skull and crossbones GHS pictogram indicates what?',
          options: mkOpts(['Flammable substance', 'Corrosive substance', 'Toxic substance', 'Irritant'], 2),
          explanation: 'The skull and crossbones symbol indicates a toxic substance that can cause serious harm or death.',
          sort_order: 3,
        },
        {
          question_text: 'Where should corrosive chemicals be stored?',
          options: mkOpts(['In the galley', 'On the highest shelf', 'On the lowest shelf in the chemical locker', 'In the laundry room'], 2),
          explanation: 'Corrosive chemicals should always be stored on the lowest shelf to prevent spills dripping onto other containers or surfaces.',
          sort_order: 4,
        },
        {
          question_text: 'For how long should you flush skin after chemical contact?',
          options: mkOpts(['30 seconds', '2 minutes', '5 minutes', '15 minutes'], 3),
          explanation: 'Flush affected skin with water for a full 15 minutes to ensure the chemical is fully removed.',
          sort_order: 5,
        },
        {
          question_text: 'What should you do if someone ingests a cleaning chemical?',
          options: mkOpts(['Make them drink milk', 'Induce vomiting immediately', 'Do not induce vomiting and seek medical advice', 'Give them water and wait'], 2),
          explanation: 'Never induce vomiting after chemical ingestion — this can cause further damage. Seek medical advice immediately.',
          sort_order: 6,
        },
        {
          question_text: 'Why should you never decant chemicals into unlabelled containers?',
          options: mkOpts(['It damages the container', 'Because another person may not know what the substance is and could misuse it', 'The chemical loses effectiveness', 'It violates customs regulations'], 1),
          explanation: 'Unlabelled containers are dangerous because other crew members will not know what the substance is, leading to potential misuse or accidental exposure.',
          sort_order: 7,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // MODULE 4: Guest Service Standards
    // ────────────────────────────────────────────────────────────────────────
    {
      module: {
        id: uuid(),
        vessel_id: VESSEL_ID,
        created_by: adminId,
        title: 'Guest Service Standards',
        description: 'Five-star service expectations covering first impressions, anticipation of needs, communication etiquette, table service, cabin service, and complaint handling.',
        content: [
          { type: 'text', value: 'Section 1: First Impressions\n\n• Greet guests by name (if known and appropriate)\n• Make eye contact, smile, and stand upright\n• Never be seen on your phone in guest areas\n• Remove sunglasses when speaking to guests\n• Offer assistance before being asked' },
          { type: 'text', value: 'Section 2: Anticipation of Needs\n\nThis is the hallmark of five-star service.\n\n• Notice empty glasses before guests do\n• Prepare sun cream and towels before guests go on deck\n• Have coffee ready at the time guests typically wake\n• Track preferences in CrewNotice event briefings and build on them each visit\n\nThe goal is to make guests feel that their needs are met before they even realise they have them.' },
          { type: 'text', value: 'Section 3: Communication\n\n• Speak clearly and at an appropriate volume\n• Use formal address (Mr/Mrs/Ms + surname) unless guests request otherwise\n• Never say "no problem" — say "of course" or "my pleasure"\n• Never discuss other guests, other vessels, or crew personal matters in guest areas\n• If you don\'t know the answer to a question, say "let me find that out for you" — never guess' },
          { type: 'text', value: 'Section 4: Table Service\n\n• Serve from the left, clear from the right\n• Ladies served first, then gentlemen, host served last\n• Water glasses never less than half full\n• Replace cutlery between courses\n• Know the menu, ingredients, and allergen information for every dish\n• Coordinate with galley on timing' },
          { type: 'text', value: 'Section 5: Cabin Service\n\n• Knock and announce yourself before entering any guest cabin\n• If no response after 10 seconds, enter quietly\n• Turn-down service completed while guests are at dinner\n• Fresh towels arranged neatly\n• Bathroom amenities topped up\n• Personal items never moved or touched\n• Close curtains, set lighting to dim, place slippers by the bed' },
          { type: 'text', value: 'Section 6: Handling Complaints\n\n1. Listen without interrupting\n2. Apologise sincerely without making excuses\n3. Offer a solution immediately\n4. Follow up to ensure the guest is satisfied\n5. Report the complaint to the Chief Stew and log in CrewNotice\n\nNever take complaints personally — they are opportunities to improve.' },
        ],
        pass_mark: 80,
        time_limit_minutes: null,
        randomise_questions: true,
        is_published: true,
      },
      questions: [
        {
          question_text: 'When serving at table, which side do you serve from?',
          options: mkOpts(['The right', 'The left', 'Either side', 'Behind the guest'], 1),
          explanation: 'Serve from the left, clear from the right. This is the standard convention in formal table service.',
          sort_order: 0,
        },
        {
          question_text: 'What should you say instead of "no problem"?',
          options: mkOpts(['"You\'re welcome"', '"Of course" or "my pleasure"', '"Sure thing"', '"Don\'t worry about it"'], 1),
          explanation: '"Of course" or "my pleasure" convey a positive willingness to serve, whereas "no problem" implies there could have been a problem.',
          sort_order: 1,
        },
        {
          question_text: 'How long should you wait after knocking on a guest cabin door?',
          options: mkOpts(['3 seconds', '5 seconds', '10 seconds', '30 seconds'], 2),
          explanation: 'Wait 10 seconds after knocking and announcing yourself. If no response, enter quietly.',
          sort_order: 2,
        },
        {
          question_text: 'Who is served last at table?',
          options: mkOpts(['The youngest guest', 'The eldest guest', 'The host', 'The person nearest the galley'], 2),
          explanation: 'Ladies are served first, then gentlemen, and the host is always served last.',
          sort_order: 3,
        },
        {
          question_text: 'What is the hallmark of five-star service?',
          options: mkOpts(['Fast service', 'Anticipation of needs before guests ask', 'Expensive tableware', 'Formal uniforms'], 1),
          explanation: 'Five-star service is defined by anticipating guest needs before they arise — noticing an empty glass, preparing items in advance.',
          sort_order: 4,
        },
        {
          question_text: "If a guest asks a question you don't know the answer to, what should you say?",
          options: mkOpts(['"I don\'t know"', '"Let me find that out for you"', '"Ask the Captain"', '"I think it might be..."'], 1),
          explanation: 'Never guess or admit ignorance flatly. "Let me find that out for you" shows initiative and professionalism.',
          sort_order: 5,
        },
        {
          question_text: 'What should you never discuss in guest areas?',
          options: mkOpts(['The weather', 'Other guests, other vessels, or crew personal matters', 'The lunch menu', 'Port information'], 1),
          explanation: 'Guest privacy and professional discretion are paramount. Never discuss other guests, other vessels, or personal crew matters in guest-facing areas.',
          sort_order: 6,
        },
        {
          question_text: 'When handling a complaint, what should you do first?',
          options: mkOpts(['Explain what happened', 'Listen without interrupting', 'Fetch the Captain', 'Apologise and leave'], 1),
          explanation: 'Always listen to the guest fully without interrupting. This shows respect and ensures you understand the issue before responding.',
          sort_order: 7,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // MODULE 5: Environmental Compliance — MARPOL Basics
    // ────────────────────────────────────────────────────────────────────────
    {
      module: {
        id: uuid(),
        vessel_id: VESSEL_ID,
        created_by: adminId,
        title: 'Environmental Compliance — MARPOL Basics',
        description: 'Introduction to MARPOL regulations covering garbage management, oil pollution prevention, sewage discharge rules, air emissions, and individual crew responsibilities for environmental compliance.',
        content: [
          { type: 'text', value: 'Section 1: What is MARPOL?\n\nMARPOL is the International Convention for the Prevention of Pollution from Ships. It applies to all vessels including superyachts.\n\nMARPOL covers pollution by:\n• Oil\n• Chemicals\n• Sewage\n• Garbage\n• Air emissions\n\nNon-compliance can result in significant fines, detention, and criminal prosecution.' },
          { type: 'text', value: 'Section 2: Garbage Management (Annex V)\n\n• No garbage may be discharged into the sea except food waste (beyond 12nm from land, ground to less than 25mm)\n• All plastics must be retained on board for shore disposal\n• Separate waste into categories: plastics, food waste, domestic waste, cooking oil, operational waste, fishing gear\n• Maintain a Garbage Record Book\n• Special Areas (Mediterranean, Baltic, etc.) have stricter rules — no garbage discharge at all in most Special Areas' },
          { type: 'text', value: 'Section 3: Oil Pollution Prevention (Annex I)\n\n• No oil or oily mixtures may be discharged into the sea from superyachts\n• All oily waste (bilge water, used lubricating oil, fuel sludge) must be retained on board and disposed of at approved shore reception facilities\n• Maintain an Oil Record Book\n• Report any accidental oil spills to the Captain immediately' },
          { type: 'text', value: 'Section 4: Sewage (Annex IV)\n\n• Untreated sewage cannot be discharged within 12nm of land\n• Between 12nm and shore, treated sewage may be discharged if the vessel has an approved sewage treatment plant\n• Beyond 12nm, sewage may be discharged at a moderate rate while underway\n• If in doubt, retain and pump ashore' },
          { type: 'text', value: 'Section 5: Air Emissions (Annex VI)\n\n• Emission Control Areas (ECAs) require low-sulphur fuel\n• Open burning of waste on board is prohibited\n• Refrigerant gases (air conditioning, provision cooling) must not be deliberately released — log all refrigerant top-ups\n• Ozone-depleting substances must be managed and recorded' },
          { type: 'text', value: 'Section 6: Your Responsibility\n\nEvery crew member is responsible for environmental compliance. This means:\n\n• Never throw anything over the side\n• Report any spills or discharges immediately\n• Follow the vessel\'s garbage management plan\n• Use shore reception facilities at every port\n• Be aware of Special Area restrictions on your cruising itinerary\n\nIgnorance of the rules is not a defence.' },
        ],
        pass_mark: 80,
        time_limit_minutes: null,
        randomise_questions: true,
        is_published: true,
      },
      questions: [
        {
          question_text: 'What does MARPOL stand for?',
          options: mkOpts(['Maritime Police Regulations', 'International Convention for the Prevention of Pollution from Ships', 'Marine Pollution Assessment Legislation', 'Maritime Pollution Response Law'], 1),
          explanation: 'MARPOL = International Convention for the Prevention of Pollution from Ships, adopted by the International Maritime Organization (IMO).',
          sort_order: 0,
        },
        {
          question_text: 'Can plastics ever be discharged into the sea?',
          options: mkOpts(['Yes, beyond 12nm', 'Yes, if ground to small pieces', 'No, all plastics must be retained on board', 'Only biodegradable plastics'], 2),
          explanation: 'Under MARPOL Annex V, all plastics must be retained on board for shore disposal. There are no exceptions.',
          sort_order: 1,
        },
        {
          question_text: 'What is the minimum distance from land for discharging food waste?',
          options: mkOpts(['3 nautical miles', '6 nautical miles', '12 nautical miles', '25 nautical miles'], 2),
          explanation: 'Food waste may only be discharged beyond 12 nautical miles from land, and must be ground to less than 25mm.',
          sort_order: 2,
        },
        {
          question_text: 'What must food waste be ground to before discharge?',
          options: mkOpts(['Less than 10mm', 'Less than 25mm', 'Less than 50mm', 'Any size is acceptable'], 1),
          explanation: 'MARPOL Annex V requires food waste to be ground to less than 25mm before discharge beyond 12nm.',
          sort_order: 3,
        },
        {
          question_text: 'Can oily bilge water be pumped overboard from a superyacht?',
          options: mkOpts(['Yes, beyond 12nm', 'Yes, through an oil separator', 'No, it must be retained for shore disposal', 'Only in emergencies'], 2),
          explanation: 'Superyachts must retain all oily waste on board and dispose of it at approved shore reception facilities.',
          sort_order: 4,
        },
        {
          question_text: 'What is a Special Area under MARPOL?',
          options: mkOpts(['A protected marine park', 'An area with stricter discharge rules such as the Mediterranean', 'A port with recycling facilities', 'An area where fishing is prohibited'], 1),
          explanation: 'Special Areas under MARPOL (such as the Mediterranean and Baltic) have stricter discharge restrictions, often prohibiting all garbage discharge.',
          sort_order: 5,
        },
        {
          question_text: 'What should you do if you witness an accidental oil spill on board?',
          options: mkOpts(['Clean it up quietly', 'Report it to the Captain immediately', 'Discharge it overboard at night', 'Wait until the next port'], 1),
          explanation: 'All oil spills must be reported to the Captain immediately, regardless of size. The spill must be logged in the Oil Record Book.',
          sort_order: 6,
        },
        {
          question_text: 'Is open burning of waste on board permitted?',
          options: mkOpts(['Yes, for food waste', 'Yes, in international waters', 'No, it is prohibited', 'Only with Captain approval'], 2),
          explanation: 'Open burning of waste on board is prohibited under MARPOL Annex VI. All waste must be disposed of at shore facilities.',
          sort_order: 7,
        },
      ],
    },
  ];
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n  CrewNotice Training Module Seed Script');
  console.log('  ======================================\n');

  // 1. Authenticate as admin
  log('🔑', 'Signing in as Sophie Laurent (admin)...');
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });
  if (authErr) {
    console.error(`\n  Auth failed: ${authErr.message}`);
    console.error('  Make sure the dev accounts are seeded and passwords are set.\n');
    process.exit(1);
  }
  log('✅', 'Authenticated');

  // 2. Find the admin crew member ID
  log('🔍', 'Looking up admin crew member...');
  const { data: adminRow, error: adminErr } = await supabase
    .from('crew_members')
    .select('id, full_name, role')
    .eq('vessel_id', VESSEL_ID)
    .eq('email', ADMIN_EMAIL)
    .single();

  if (adminErr || !adminRow) {
    console.error(`\n  Could not find admin crew member: ${adminErr?.message || 'not found'}\n`);
    process.exit(1);
  }
  const adminId = adminRow.id;
  log('✅', `Admin: ${adminRow.full_name} (${adminRow.role}) — ${adminId}`);

  // 3. Check for existing modules to avoid duplicates
  log('🔍', 'Checking for existing training modules...');
  const { data: existingModules } = await supabase
    .from('training_modules')
    .select('id, title')
    .eq('vessel_id', VESSEL_ID);

  const existingTitles = new Set((existingModules || []).map(m => m.title));

  // 4. Build module data
  const allModules = buildModules(adminId);
  const modulesToInsert = allModules.filter(m => !existingTitles.has(m.module.title));

  if (modulesToInsert.length === 0) {
    log('ℹ️ ', 'All 5 training modules already exist. Nothing to insert.');
    console.log('\n  Existing modules:');
    for (const m of existingModules) {
      console.log(`    • ${m.title}`);
    }
    console.log('');
    process.exit(0);
  }

  if (modulesToInsert.length < allModules.length) {
    const skipped = allModules.filter(m => existingTitles.has(m.module.title));
    for (const s of skipped) {
      log('⏭️ ', `Skipping "${s.module.title}" (already exists)`);
    }
  }

  // 5. Insert modules
  log('📦', `Inserting ${modulesToInsert.length} training module(s)...`);
  const moduleRows = modulesToInsert.map(m => m.module);
  const { data: insertedModules, error: modErr } = await supabase
    .from('training_modules')
    .insert(moduleRows)
    .select('id, title');

  if (modErr) {
    console.error(`\n  Module insert failed: ${modErr.message}\n`);
    process.exit(1);
  }

  // Map inserted IDs back
  const idMap = {};
  for (const im of insertedModules) {
    idMap[im.title] = im.id;
  }

  // 6. Insert quiz questions
  let totalQuestions = 0;
  const allQuestions = [];

  for (const entry of modulesToInsert) {
    const moduleId = idMap[entry.module.title];
    if (!moduleId) {
      console.error(`\n  Could not find ID for module: ${entry.module.title}\n`);
      continue;
    }

    for (const q of entry.questions) {
      allQuestions.push({
        id: uuid(),
        module_id: moduleId,
        question_text: q.question_text,
        question_type: 'multiple_choice',
        options: q.options,
        explanation: q.explanation,
        sort_order: q.sort_order,
      });
    }
    totalQuestions += entry.questions.length;
  }

  if (allQuestions.length > 0) {
    log('📝', `Inserting ${allQuestions.length} quiz questions...`);
    const { error: qErr } = await supabase
      .from('quiz_questions')
      .insert(allQuestions);

    if (qErr) {
      console.error(`\n  Quiz questions insert failed: ${qErr.message}\n`);
      process.exit(1);
    }
  }

  // 7. Print results
  console.log('\n  ────────────────────────────────────────');
  console.log('  Results:');
  console.log('  ────────────────────────────────────────');
  for (const entry of modulesToInsert) {
    const moduleId = idMap[entry.module.title];
    log('✅', `"${entry.module.title}" — ${entry.questions.length} questions (pass mark: ${entry.module.pass_mark}%)`);
    console.log(`       ID: ${moduleId}`);
  }
  console.log('  ────────────────────────────────────────');
  console.log(`  Total: ${insertedModules.length} modules, ${totalQuestions} questions`);
  console.log('');

  process.exit(0);
}

main();
