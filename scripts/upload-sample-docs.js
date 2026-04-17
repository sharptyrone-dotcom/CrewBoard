#!/usr/bin/env node

// ---------------------------------------------------------------------------
// upload-sample-docs.js
//
// One-time script to generate sample PDFs, upload them to Supabase Storage
// (vessel-documents bucket), and link them to existing document records.
//
// Usage: node scripts/upload-sample-docs.js
// ---------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Load .env.local ─────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const VESSEL_ID = '10000000-0000-0000-0000-000000000001';
const ADMIN_ID = '20000000-0000-0000-0000-000000000002'; // Sophie (admin)
const BUCKET = 'vessel-documents';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Sample documents to upload ──────────────────────────────────────
// Each entry maps a generated PDF to an existing seeded document.
const SAMPLE_DOCS = [
  {
    filename: 'SOP-Tender-Operations.pdf',
    matchTitle: 'Tender Operations SOP',
    matchId: '40000000-0000-0000-0000-000000000001',
    newDoc: {
      title: 'Tender Operations SOP',
      department: 'Deck',
      doc_type: 'SOPs',
      is_required: true,
      version: '3.2',
      page_count: 3,
    },
    pdfContent: {
      title: 'Tender Operations SOP',
      subtitle: 'M/Y Serenity — Deck Department',
      version: 'Version 3.2',
      sections: [
        {
          heading: '1. Purpose',
          body: 'This Standard Operating Procedure establishes safe protocols for the launch, operation, and recovery of all tenders aboard M/Y Serenity. Compliance is mandatory for all deck crew involved in tender operations.',
        },
        {
          heading: '2. Pre-Launch Checklist',
          body: '• Confirm weather conditions (max wind: 20 kts, max sea state: 3)\n• Check fuel levels — minimum 75% for guest transfers\n• Test VHF radio on Ch. 72 (ship-to-tender) and Ch. 16 (emergency)\n• Inspect hull, bilge pump, navigation lights, and kill cord\n• Verify life jackets aboard (1 per passenger + 2 spare)\n• Brief all passengers on safety procedures before boarding',
        },
        {
          heading: '3. Launch Procedure',
          body: '3.1 Two crew minimum for crane/davit operations\n3.2 Helmsman boards first, starts engine at idle\n3.3 Attach tag lines before lifting\n3.4 Clear the swim platform of all personnel during crane swing\n3.5 Lower tender to waterline, detach crane hook, release tag lines\n3.6 Helmsman confirms "All clear" to deck crew via VHF',
        },
        {
          heading: '4. Recovery Procedure',
          body: '4.1 Approach yacht at idle speed from downwind quarter\n4.2 Passengers disembark first via swim platform\n4.3 Helmsman attaches crane hook and tag lines\n4.4 Engine off, kill cord removed\n4.5 Crane lift — crew manage tag lines to prevent swing\n4.6 Secure tender in cradle, attach ratchet straps (4-point)\n4.7 Rinse tender with fresh water before covering',
        },
        {
          heading: '5. Emergency Procedures',
          body: '• Man overboard: throw MOB marker, call "MAYDAY" on Ch. 16\n• Engine failure: deploy anchor, call yacht on Ch. 72\n• Fire: all passengers into water with life jackets, use extinguisher\n• Medical emergency: return to yacht immediately, alert bridge',
        },
      ],
    },
  },
  {
    filename: 'RA-COSHH-Cleaning-Chemicals.pdf',
    matchTitle: 'COSHH',
    matchId: '40000000-0000-0000-0000-000000000004',
    newDoc: {
      title: 'COSHH Risk Assessment — Cleaning Chemicals',
      department: 'Interior',
      doc_type: 'Risk Assessments',
      is_required: true,
      version: '1.4',
      page_count: 3,
    },
    pdfContent: {
      title: 'COSHH Risk Assessment',
      subtitle: 'Cleaning Chemicals — Interior Department',
      version: 'Version 1.4 | Review: September 2026',
      sections: [
        {
          heading: '1. Assessment Scope',
          body: 'This risk assessment covers all cleaning chemicals used aboard M/Y Serenity in compliance with the Control of Substances Hazardous to Health (COSHH) Regulations. All interior crew must read and acknowledge this document before handling any listed substances.',
        },
        {
          heading: '2. Substances Assessed',
          body: 'Product                  | Hazard Class      | Risk Level\nBleach (sodium hypo.)    | Corrosive, toxic   | HIGH\nOven cleaner (NaOH)      | Corrosive          | HIGH\nGlass cleaner (ammonia)  | Irritant           | MEDIUM\nDeck soap (surfactant)   | Low hazard         | LOW\nStainless polish         | Irritant, flammable| MEDIUM\nTeak oil (petroleum)     | Flammable          | MEDIUM',
        },
        {
          heading: '3. Control Measures',
          body: '• Store all chemicals in ventilated locker (frame 42, port side)\n• Never mix bleach with ammonia-based products\n• Wear nitrile gloves and safety goggles for HIGH-risk substances\n• Use in well-ventilated areas only — open ports where possible\n• Decant only into labelled secondary containers\n• Dispose of empty containers at next port — never overboard',
        },
        {
          heading: '4. First Aid Measures',
          body: 'Skin contact: Remove contaminated clothing, flush with water for 15 min\nEye contact: Flush with clean water for 20 min, seek medical attention\nIngestion: Do NOT induce vomiting, rinse mouth, call TMAS immediately\nInhalation: Move to fresh air, monitor breathing, seek medical attention\n\nEmergency contact: TMAS +39 06 5923 5267 (24h)',
        },
        {
          heading: '5. Training Requirements',
          body: 'All interior crew must complete:\n• COSHH awareness training before first use\n• Spill response drill — quarterly\n• SDS (Safety Data Sheet) review — annually\n\nRecords maintained by Chief Stewardess in the Safety Management System.',
        },
      ],
    },
  },
  {
    filename: 'SOP-Man-Overboard-Procedure.pdf',
    // This doesn't match an existing seeded doc — will create new
    matchTitle: null,
    matchId: null,
    newDoc: {
      title: 'Man Overboard Procedure',
      department: 'Safety',
      doc_type: 'SOPs',
      is_required: true,
      version: '2.1',
      page_count: 3,
    },
    pdfContent: {
      title: 'Man Overboard Procedure',
      subtitle: 'M/Y Serenity — Safety Critical SOP',
      version: 'Version 2.1 | CRITICAL — All Crew',
      sections: [
        {
          heading: '1. Immediate Actions — All Crew',
          body: 'ANY crew member who witnesses or is alerted to a person in the water:\n\n1. SHOUT "MAN OVERBOARD" — repeat three times\n2. POINT at the person continuously — do not lose visual contact\n3. THROW the nearest lifebuoy with SOLAS light and smoke marker\n4. Press the MOB button on the nearest GPS plotter\n5. Note the time and your position',
        },
        {
          heading: '2. Bridge Response',
          body: '2.1 Sound the general alarm — 3 long blasts on ship\'s whistle\n2.2 Announce on PA: "Man overboard, man overboard [port/starboard] side"\n2.3 Commence Williamson Turn or Anderson Turn as appropriate\n2.4 Deploy MOB tracking on radar — mark position\n2.5 Broadcast MAYDAY on Ch. 16 if recovery is not immediate\n2.6 Switch AIS to MOB mode\n2.7 Post lookouts on both bridge wings',
        },
        {
          heading: '3. Deck Team Response',
          body: '• Muster at recovery station (swim platform or designated point)\n• Prepare rescue sling / Jason\'s Cradle\n• Ready the tender for immediate launch if conditions allow\n• Rig the scramble net on the leeward side\n• Have hypothermia blankets and first aid kit standing by\n• One crew member assigned as dedicated radio operator',
        },
        {
          heading: '4. Recovery',
          body: 'Approach the person from downwind:\n• Use rescue sling for conscious persons\n• Use Jason\'s Cradle for unconscious or injured persons\n• Maintain horizontal position during lift — NEVER lift vertically\n• Move casualty to warm interior space immediately\n• Monitor for secondary drowning symptoms for 24 hours\n• Log the incident — complete Form SM-12 within 1 hour',
        },
        {
          heading: '5. Drill Schedule',
          body: 'ISM Code requires MOB drills:\n• Monthly — all crew participate\n• Within 24 hours of any crew change\n• Annual — nighttime drill with full rescue boat deployment\n\nDrill records maintained by the Chief Officer in the SMS.',
        },
      ],
    },
  },
  {
    filename: 'POL-Guest-Privacy-Confidentiality.pdf',
    matchTitle: 'Guest Service Standards',
    matchId: '40000000-0000-0000-0000-000000000006',
    newDoc: {
      title: 'Guest Privacy & Confidentiality Policy',
      department: 'General',
      doc_type: 'Policies',
      is_required: true,
      version: '2.0',
      page_count: 3,
    },
    pdfContent: {
      title: 'Guest Privacy & Confidentiality Policy',
      subtitle: 'M/Y Serenity — All Departments',
      version: 'Version 2.0 | Mandatory Acknowledgement',
      sections: [
        {
          heading: '1. Policy Statement',
          body: 'All crew members of M/Y Serenity are bound by strict confidentiality regarding guests, their families, associates, itineraries, and activities aboard. Breach of this policy constitutes grounds for immediate dismissal and potential legal action under applicable NDA provisions.',
        },
        {
          heading: '2. What is Confidential',
          body: 'ALL of the following are strictly confidential:\n• Guest names, identities, and physical descriptions\n• Charter dates, itineraries, and port schedules\n• Conversations overheard between guests\n• Dietary requirements, medical needs, preferences\n• Business discussions or documents seen aboard\n• Photographs, videos, or recordings of any kind\n• Names of other yachts in the fleet or associated vessels\n• Financial information — charter rates, tips, expenses',
        },
        {
          heading: '3. Social Media & Photography',
          body: '• NO photographs of guests or their belongings — ever\n• NO social media posts that identify the yacht by name or location\n• NO "check-ins" or location tags while charter guests are aboard\n• Interior photographs of the yacht require Captain\'s written approval\n• Professional portfolio photos — only with management company consent\n• Personal photos of crew are permitted in crew-only areas',
        },
        {
          heading: '4. Communication Protocols',
          body: 'When speaking about work:\n• Use "the boat" or "my yacht" — never the vessel name in public\n• Do not discuss guests with crew from other yachts\n• Phone calls about work: move to a private area, keep voice low\n• WhatsApp/messaging: no guest names, no itinerary details\n• Port agents, provisioners, marina staff: share minimum information\n\nGuest enquiries from media/press: refer ONLY to the management company.',
        },
        {
          heading: '5. Consequences of Breach',
          body: 'Any breach of this policy will result in:\n• First offence: formal written warning + additional NDA briefing\n• Second offence: immediate dismissal\n• Legal action may be pursued for material breaches\n\nAll crew sign the NDA addendum to their employment contract.\nThis policy survives termination — obligations continue after departure.',
        },
      ],
    },
  },
];

// ── PDF Generator ───────────────────────────────────────────────────
// Builds a minimal but well-structured multi-page PDF without any
// external dependencies. Uses PDF 1.4 with Type1 fonts (Helvetica).

function generatePdf({ title, subtitle, version, sections }) {
  const objects = [];
  let objNum = 0;

  function addObj(content) {
    objNum++;
    objects.push({ num: objNum, content });
    return objNum;
  }

  // Helpers for PDF text encoding
  function esc(str) {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  function wrapText(text, maxCharsPerLine) {
    const lines = [];
    for (const paragraph of text.split('\n')) {
      if (paragraph.length <= maxCharsPerLine) {
        lines.push(paragraph);
        continue;
      }
      const words = paragraph.split(' ');
      let currentLine = '';
      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = currentLine ? currentLine + ' ' + word : word;
        }
      }
      if (currentLine) lines.push(currentLine);
    }
    return lines;
  }

  // Build page content streams
  const pageContents = [];
  const PAGE_W = 595; // A4
  const PAGE_H = 842;
  const MARGIN_L = 56;
  const MARGIN_R = 56;
  const MARGIN_TOP = 56;
  const MARGIN_BOT = 56;
  const USABLE_W = PAGE_W - MARGIN_L - MARGIN_R;
  const LINE_H = 14;
  const HEADING_H = 22;
  const CHARS_PER_LINE = 80;

  let currentY = PAGE_H - MARGIN_TOP;
  let streamLines = [];
  let pageNumber = 0;

  function newPage() {
    if (streamLines.length > 0) {
      pageContents.push(streamLines.join('\n'));
    }
    streamLines = [];
    currentY = PAGE_H - MARGIN_TOP;
    pageNumber++;
  }

  function needSpace(h) {
    if (currentY - h < MARGIN_BOT) {
      newPage();
    }
  }

  function addLine(text, fontSize, x, bold) {
    const font = bold ? '/F2' : '/F1';
    streamLines.push(`BT ${font} ${fontSize} Tf ${x} ${currentY} Td (${esc(text)}) Tj ET`);
  }

  // ── Page 1: Title page ──
  newPage();

  // Blue header bar
  streamLines.push(`0.231 0.510 0.965 rg`); // #3b82f6
  streamLines.push(`0 ${PAGE_H - 120} ${PAGE_W} 120 re f`);
  streamLines.push(`1 1 1 rg`); // white text

  // Title
  currentY = PAGE_H - 60;
  addLine(title, 24, MARGIN_L, true);
  currentY -= 28;
  addLine(subtitle, 12, MARGIN_L, false);
  currentY -= 18;
  addLine(version, 11, MARGIN_L, false);

  // Reset to black
  streamLines.push(`0 0 0 rg`);
  currentY = PAGE_H - 170;

  // Vessel info box
  streamLines.push(`0.96 0.97 0.98 rg`); // light gray
  streamLines.push(`${MARGIN_L} ${currentY - 80} ${USABLE_W} 80 re f`);
  streamLines.push(`0 0 0 rg`);
  currentY -= 20;
  addLine('Vessel: M/Y Serenity', 11, MARGIN_L + 16, true);
  currentY -= 16;
  addLine('Classification: MCA LY3 Compliant', 11, MARGIN_L + 16, false);
  currentY -= 16;
  addLine('Controlled Document — Do Not Copy Without Authorisation', 11, MARGIN_L + 16, false);
  currentY -= 16;
  addLine('Document Control: Safety Management System (SMS)', 11, MARGIN_L + 16, false);

  currentY -= 40;

  // Footer note
  addLine('This document is part of the M/Y Serenity Safety Management System.', 9, MARGIN_L, false);
  currentY -= 14;
  addLine('Uncontrolled when printed. Always refer to the digital copy in CrewNotice.', 9, MARGIN_L, false);

  // ── Content pages ──
  newPage();

  for (const section of sections) {
    // Check space for heading + at least 3 lines
    needSpace(HEADING_H + LINE_H * 3);

    // Section heading
    streamLines.push(`0.231 0.510 0.965 rg`);
    addLine(section.heading, 14, MARGIN_L, true);
    streamLines.push(`0 0 0 rg`);
    currentY -= HEADING_H;

    // Divider line
    streamLines.push(`0.886 0.910 0.937 RG`); // #e2e8f0
    streamLines.push(`0.5 w`);
    streamLines.push(`${MARGIN_L} ${currentY + 6} m ${PAGE_W - MARGIN_R} ${currentY + 6} l S`);
    streamLines.push(`0 0 0 RG`);
    currentY -= 4;

    // Body text
    const lines = wrapText(section.body, CHARS_PER_LINE);
    for (const line of lines) {
      needSpace(LINE_H);
      addLine(line, 10, MARGIN_L + 8, false);
      currentY -= LINE_H;
    }
    currentY -= 12; // inter-section gap
  }

  // Flush last page
  if (streamLines.length > 0) {
    pageContents.push(streamLines.join('\n'));
  }

  // ── Build PDF object tree ──
  // Fonts
  const fontHelv = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const fontHelvBold = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  // Page content streams
  const contentRefs = [];
  for (const stream of pageContents) {
    const buf = Buffer.from(stream, 'utf-8');
    const ref = addObj(`<< /Length ${buf.length} >>\nstream\n${stream}\nendstream`);
    contentRefs.push(ref);
  }

  // Pages
  const pageRefs = [];
  const pagesRef = objNum + contentRefs.length + 1; // pre-calculate Pages obj number

  for (let i = 0; i < contentRefs.length; i++) {
    const ref = addObj(
      `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Contents ${contentRefs[i]} 0 R ` +
      `/Resources << /Font << /F1 ${fontHelv} 0 R /F2 ${fontHelvBold} 0 R >> >> >>`
    );
    pageRefs.push(ref);
  }

  // Pages catalog
  const actualPagesRef = addObj(
    `<< /Type /Pages /Kids [${pageRefs.map(r => `${r} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`
  );

  // Document catalog
  const catalogRef = addObj(`<< /Type /Catalog /Pages ${actualPagesRef} 0 R >>`);

  // ── Serialize ──
  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];

  for (const obj of objects) {
    offsets[obj.num] = Buffer.byteLength(pdf, 'utf-8');
    pdf += `${obj.num} 0 obj\n${obj.content}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf-8');
  pdf += `xref\n0 ${objNum + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 1; i <= objNum; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objNum + 1} /Root ${catalogRef} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'binary');
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('=== CrewNotice Sample Document Uploader ===\n');
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Vessel:   ${VESSEL_ID}`);
  console.log(`Bucket:   ${BUCKET}`);
  console.log(`Key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon'}\n`);

  const sampleDir = path.resolve(__dirname, '..', 'sample-docs');
  if (!fs.existsSync(sampleDir)) fs.mkdirSync(sampleDir, { recursive: true });

  const results = [];

  for (const doc of SAMPLE_DOCS) {
    const localPath = path.join(sampleDir, doc.filename);
    console.log(`\n── ${doc.filename} ──`);

    // 1. Generate PDF if not exists
    if (!fs.existsSync(localPath)) {
      console.log('  Generating PDF...');
      const pdfBuf = generatePdf(doc.pdfContent);
      fs.writeFileSync(localPath, pdfBuf);
      console.log(`  Generated: ${(pdfBuf.length / 1024).toFixed(1)} KB`);
    } else {
      console.log(`  PDF exists: ${localPath}`);
    }

    const fileBuffer = fs.readFileSync(localPath);
    const fileSize = fileBuffer.length;

    // 2. Upload to Supabase Storage
    const objectId = require('crypto').randomUUID();
    const safeName = doc.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${VESSEL_ID}/${objectId}-${safeName}`;

    console.log(`  Uploading to: ${storagePath}`);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error(`  UPLOAD FAILED: ${uploadError.message}`);
      results.push({ file: doc.filename, status: 'upload_failed', error: uploadError.message });
      continue;
    }
    console.log(`  Uploaded: ${(fileSize / 1024).toFixed(1)} KB`);

    // 3. Link to existing document or create new record
    let linked = false;

    if (doc.matchId) {
      // Try to update the existing seeded document by ID
      console.log(`  Updating existing document: ${doc.matchId}`);
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          file_url: storagePath,
          file_size_bytes: fileSize,
          page_count: doc.newDoc.page_count,
          updated_at: new Date().toISOString(),
        })
        .eq('id', doc.matchId);

      if (!updateError) {
        // Verify the update hit a row
        const { data: check } = await supabase
          .from('documents')
          .select('id, title')
          .eq('id', doc.matchId)
          .single();
        if (check) {
          console.log(`  Linked to "${check.title}" (${check.id})`);
          results.push({ file: doc.filename, status: 'linked', docId: check.id, title: check.title });
          linked = true;
        }
      } else {
        console.log(`  Update by ID failed (${updateError.message}), trying title match...`);
      }
    }

    // Try matching by title similarity
    if (!linked && doc.matchTitle) {
      const { data: matches } = await supabase
        .from('documents')
        .select('id, title, file_url')
        .eq('vessel_id', VESSEL_ID)
        .ilike('title', `%${doc.matchTitle}%`)
        .limit(1);

      if (matches && matches.length > 0) {
        const match = matches[0];
        console.log(`  Found title match: "${match.title}" (${match.id})`);
        const { error: linkError } = await supabase
          .from('documents')
          .update({
            file_url: storagePath,
            file_size_bytes: fileSize,
            page_count: doc.newDoc.page_count,
            updated_at: new Date().toISOString(),
          })
          .eq('id', match.id);

        if (linkError) {
          console.error(`  LINK FAILED: ${linkError.message}`);
          results.push({ file: doc.filename, status: 'link_failed', error: linkError.message });
        } else {
          console.log(`  Linked to "${match.title}"`);
          results.push({ file: doc.filename, status: 'linked', docId: match.id, title: match.title });
        }
        linked = true;
      }
    }

    if (linked) continue;

    // No existing document — create a new record
    console.log('  No existing document found — creating new record...');
    const { data: newRow, error: insertError } = await supabase
      .from('documents')
      .insert({
        vessel_id: VESSEL_ID,
        uploaded_by: ADMIN_ID,
        title: doc.newDoc.title,
        doc_type: doc.newDoc.doc_type,
        department: doc.newDoc.department,
        version: doc.newDoc.version,
        file_url: storagePath,
        file_size_bytes: fileSize,
        page_count: doc.newDoc.page_count,
        is_required: doc.newDoc.is_required,
      })
      .select('id, title')
      .single();

    if (insertError) {
      console.error(`  INSERT FAILED: ${insertError.message}`);
      results.push({ file: doc.filename, status: 'insert_failed', error: insertError.message });
    } else {
      console.log(`  Created: "${newRow.title}" (${newRow.id})`);
      results.push({ file: doc.filename, status: 'created', docId: newRow.id, title: newRow.title });
    }
  }

  // ── Summary ──
  console.log('\n\n=== RESULTS ===\n');
  const PAD = 45;
  for (const r of results) {
    const label = r.file.padEnd(PAD);
    if (r.status === 'linked') {
      console.log(`  ✅  ${label} → linked to "${r.title}"`);
    } else if (r.status === 'created') {
      console.log(`  ✅  ${label} → created "${r.title}"`);
    } else {
      console.log(`  ❌  ${label} → ${r.status}: ${r.error}`);
    }
  }

  const succeeded = results.filter(r => r.status === 'linked' || r.status === 'created').length;
  console.log(`\n${succeeded}/${results.length} documents uploaded and linked successfully.\n`);

  if (succeeded > 0) {
    console.log('Documents should now show their PDFs in the app document viewer.');
    console.log('Open the app → Documents tab → tap any updated document to verify.\n');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
