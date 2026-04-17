export const ARTICLES = {
  'creating-your-vessel': {
    slug: 'creating-your-vessel',
    title: 'Creating Your Vessel and Inviting Crew',
    category: 'Getting Started',
    description:
      'Set up your CrewNotice vessel and get your crew on board in minutes using invite codes.',
    body: [
      {
        type: 'p',
        text:
          'Setting up your vessel in CrewNotice takes just a few minutes. As the captain or admin you create the workspace, then invite your crew to join using a shareable code — no emails to collect, no app stores to wait on.',
      },
      { type: 'h2', text: 'Step-by-step setup' },
      {
        type: 'steps',
        items: [
          {
            title: 'Create your account',
            body:
              'Visit crewnotice.com and sign up with your email, a password, your full name, and your role onboard. Your account belongs to you — it stays with you even if you change vessels later.',
          },
          {
            title: 'Create your vessel',
            body:
              'Enter your vessel name and select the departments that apply — deck, engineering, interior, galley, and so on. You can adjust departments later without starting over.',
          },
          {
            title: "You're now the vessel admin",
            body:
              'You automatically have full access to every feature: notices, documents, training, events, compliance reports, and crew management. You can add additional admins at any time.',
          },
          {
            title: 'Generate an invite code',
            body:
              'Head to Admin > Invite Crew to create a shareable code. Optionally preset the role and department, set an expiry date, and set how many times the code can be used before it stops working.',
          },
          {
            title: 'Share the invite code',
            body:
              'Send the code to your crew by any channel you prefer — text, WhatsApp, email, or just write it on the whiteboard. Crew visit crewnotice.com/join and enter it to sign up.',
          },
          {
            title: 'Watch your crew appear',
            body:
              'As crew join, they show up in your Crew Management screen. From there you can adjust roles, departments, or remove accounts when someone signs off.',
          },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Tips for invite codes',
        text:
          "Generate department-specific invite codes with presets so crew don't have to pick their department manually. Set the expiry to 7 days so codes aren't floating around forever — and generate a fresh code at the start of each rotation.",
      },
    ],
  },

  'joining-a-vessel': {
    slug: 'joining-a-vessel',
    title: 'Joining a Vessel with an Invite Code',
    category: 'Getting Started',
    description:
      'How crew members accept an invite and join their vessel on CrewNotice.',
    body: [
      {
        type: 'p',
        text:
          'Joining a vessel on CrewNotice takes under a minute. All you need is an invite code from your captain or HOD.',
      },
      { type: 'h2', text: 'What you need' },
      {
        type: 'p',
        text:
          "An invite code. That's it. Your captain, chief officer, or HOD will share one with you before you board.",
      },
      { type: 'h2', text: 'Step by step' },
      {
        type: 'steps',
        items: [
          {
            title: 'Visit the join page',
            body:
              'Open crewnotice.com/join on your phone or any browser — iPhone, Android, tablet, or laptop all work.',
          },
          {
            title: 'Enter the invite code',
            body:
              "Type in the code and tap Verify. You'll see the vessel name confirmed so you know you're joining the right workspace.",
          },
          {
            title: 'Fill in your details',
            body:
              'Enter your name, email, password, role, and department. Some fields may be pre-filled if the admin set presets on the invite code.',
          },
          {
            title: 'Tap Join Vessel',
            body:
              "Your account is created immediately and you're taken straight into the app — no email verification step to wait through.",
          },
          {
            title: 'Install to your home screen',
            body:
              "Tap your browser's menu and select Add to Home Screen. CrewNotice will then behave like a native app with a full-screen experience.",
          },
        ],
      },
      { type: 'h2', text: "What if my code doesn't work?" },
      {
        type: 'p',
        text:
          'A few things to check: the code may have expired, the code may have been used up (some codes are limited to a set number of uses), or the admin may have revoked it. Ask your captain or HOD for a fresh code.',
      },
      { type: 'h2', text: 'Moving to a new vessel' },
      {
        type: 'p',
        text:
          "Your account stays with you between rotations. You don't need to create a new account when you join a different vessel — just ask the new vessel's admin for their invite code and enter it from the join page, whether you're signed in or not.",
      },
    ],
  },

  'navigating-the-dashboard': {
    slug: 'navigating-the-dashboard',
    title: 'Navigating the Crew Dashboard',
    category: 'Getting Started',
    description:
      'A tour of the Home, Notices, Library, Training, and Events tabs, plus notifications and profile.',
    body: [
      {
        type: 'p',
        text:
          'The CrewNotice dashboard is built around one question: what needs my attention right now? Everything else is one tap away.',
      },
      { type: 'h2', text: 'The Home screen' },
      {
        type: 'p',
        text:
          "Your action centre. It surfaces everything that needs you to do something — unread notices, documents waiting for acknowledgement, overdue training, and upcoming events. If the Home screen is clear, you're up to date.",
      },
      { type: 'h2', text: 'Bottom navigation' },
      {
        type: 'p',
        text: 'Five tabs cover every corner of the app:',
      },
      {
        type: 'list',
        items: [
          '**Home** — your dashboard and action items',
          '**Notices** — every notice posted to your vessel',
          '**Library** — SOPs, risk assessments, and manuals',
          '**Training** — modules assigned to you',
          '**Events** — charters, drills, and briefings',
        ],
      },
      { type: 'h2', text: 'Profile' },
      {
        type: 'p',
        text:
          'Tap your avatar in the top right to open profile settings. This is where you see your personal details, manage cached offline documents, and toggle dark mode.',
      },
      { type: 'h2', text: 'Notifications bell' },
      {
        type: 'p',
        text:
          'Tap the bell icon in the top bar to see every notification in one place. Tap any notification to jump straight to the notice, document, or event it refers to.',
      },
      { type: 'h2', text: 'Colour coding at a glance' },
      {
        type: 'list',
        items: [
          '**Red** — critical or urgent, needs action now',
          '**Amber** — important or needs attention soon',
          '**Blue** — new or unread',
          '**Green** — completed or acknowledged',
        ],
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'Good to know',
        text:
          "CrewNotice remembers where you left off. If you're halfway through a notice and the app closes, you'll come back to exactly the same spot.",
      },
    ],
  },

  'setting-up-notifications': {
    slug: 'setting-up-notifications',
    title: 'Setting Up Notifications',
    category: 'Getting Started',
    description:
      'Enable push, email, and browser alerts so you never miss an important update from the vessel.',
    body: [
      {
        type: 'p',
        text:
          "CrewNotice uses your device's push notifications so you never miss something important — even when the app is closed.",
      },
      { type: 'h2', text: 'Enabling push notifications' },
      {
        type: 'p',
        text:
          'The first time you open CrewNotice, your browser will ask for permission to send notifications. Tap Allow. You only need to do this once per device.',
      },
      { type: 'h2', text: "What you'll be notified about" },
      {
        type: 'list',
        items: [
          'New notices — especially critical ones',
          'Document updates that need re-acknowledgement',
          'New training assignments and deadline reminders',
          'Event briefings and live updates',
          'Reminders sent by your admin',
        ],
      },
      { type: 'h2', text: 'Notifications cannot be muted' },
      {
        type: 'p',
        text:
          "CrewNotice notifications cannot be muted. This is by design — the platform exists to ensure every crew member receives every relevant update, with auditable proof. Every crew member on a vessel receives every notification targeted at them, with the only exception being department targeting (e.g. a deck-only notice only notifies deck crew).",
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'Why no opt-out?',
        text:
          "Compliance tracking — the core reason CrewNotice exists — depends on guaranteed delivery. If a crew member could mute a category of notification, admins would lose the audit trail that proves a notice was delivered. So there is no in-app mute switch.",
      },
      { type: 'h2', text: 'Troubleshooting' },
      {
        type: 'p',
        text:
          "If you're not receiving notifications, check your phone's system notification settings for your browser. Specifically:",
      },
      {
        type: 'list',
        items: [
          "Your phone's notification settings for your browser (Safari / Chrome / etc.) are set to Allow",
          "CrewNotice is not in a restricted battery-saving mode",
          "You have connectivity when the notice is sent",
          "You granted notification permission the first time you opened CrewNotice — if you declined, you can re-enable it in your browser's site settings",
        ],
      },
    ],
  },

  'installing-on-your-phone': {
    slug: 'installing-on-your-phone',
    title: 'Installing CrewNotice on Your Phone',
    category: 'Getting Started',
    description:
      'Add CrewNotice to your home screen on iOS, Android, and desktop as a Progressive Web App.',
    body: [
      {
        type: 'p',
        text:
          "CrewNotice is a Progressive Web App — it installs straight from your browser with no App Store download. Here's how to add it to each device.",
      },
      { type: 'h2', text: 'iPhone / iPad' },
      {
        type: 'steps',
        items: [
          {
            title: 'Open in Safari',
            body:
              'Go to crewnotice.com in Safari — on iOS the install option only appears in Safari, not Chrome.',
          },
          {
            title: 'Tap the Share button',
            body:
              'The square icon with an arrow pointing up, at the bottom of the screen.',
          },
          {
            title: 'Scroll and select Add to Home Screen',
            body:
              "You'll find it in the share sheet alongside AirDrop, Mail, and Messages.",
          },
          {
            title: 'Tap Add',
            body:
              'CrewNotice now appears as an app icon on your home screen and opens full-screen like a native app.',
          },
        ],
      },
      { type: 'h2', text: 'Android' },
      {
        type: 'steps',
        items: [
          {
            title: 'Open in Chrome',
            body: 'Go to crewnotice.com in Chrome or any Chromium browser.',
          },
          {
            title: 'Tap the three-dot menu',
            body: 'Top-right of the browser.',
          },
          {
            title: 'Tap Add to Home Screen or Install App',
            body:
              'Depending on your Android version, one of these options will appear.',
          },
          {
            title: 'Tap Add',
            body:
              'CrewNotice appears in your app drawer alongside your other apps.',
          },
        ],
      },
      { type: 'h2', text: 'Desktop' },
      {
        type: 'steps',
        items: [
          {
            title: 'Open in Chrome',
            body:
              'Go to crewnotice.com in Chrome, Edge, or any Chromium browser.',
          },
          {
            title: 'Click the install icon',
            body:
              'Look for the install icon on the right-hand side of the address bar — it appears as a small monitor with a down arrow.',
          },
          {
            title: 'Click Install',
            body:
              'CrewNotice opens in its own window and appears in your OS dock or start menu.',
          },
        ],
      },
      { type: 'h2', text: 'Why install?' },
      {
        type: 'list',
        items: [
          'Full-screen experience without browser bars',
          'Cached offline access for critical documents',
          'Push notifications even when the app is closed',
          'Faster loading — assets stay cached locally',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Good to know',
        text:
          "You only need to install once per device. Updates happen automatically in the background — you're always on the latest version.",
      },
    ],
  },

  'posting-notices': {
    slug: 'posting-notices',
    title: 'Posting Notices and Setting Priorities',
    category: 'For Captains & Admins',
    description:
      'Create routine, important, and critical notices with targeting, acknowledgement tracking, and reminders.',
    body: [
      {
        type: 'p',
        text:
          'Notices are the fastest way to get information in front of your crew. This guide covers posting a notice, picking the right priority, targeting the right people, and following up afterwards.',
      },
      { type: 'h2', text: 'How to post a notice' },
      {
        type: 'p',
        text:
          'Go to the Notices tab and tap the **+** button in the bottom-right corner. You can also tap **New Notice** from Quick Actions on the Home screen.',
      },
      { type: 'h2', text: 'Notice fields' },
      {
        type: 'list',
        items: [
          '**Title** — short and specific, this is what crew see in the list',
          '**Body** — rich text with bold, bullet points, and inline links',
          '**Category** — Safety, Operations, Guest Info, HR/Admin, Social, or Departmental',
          '**Priority** — Critical, Important, or Routine',
        ],
      },
      { type: 'h2', text: 'Priority levels' },
      {
        type: 'list',
        items: [
          '**Critical** — requires acknowledgement, crew cannot dismiss it, and it is shown with a red bar. Use for safety alerts, emergency procedures, and anything that could get someone hurt.',
          '**Important** — highlighted in amber and shown prominently in the list. Use for operational changes, guest briefings, and anything the crew need to know promptly.',
          '**Routine** — standard grey styling with normal visibility. Use for day-to-day updates, social announcements, and low-urgency information.',
        ],
      },
      { type: 'h2', text: 'Targeting the right crew' },
      {
        type: 'p',
        text:
          'Choose **All Crew** to post to everyone on the vessel, or pick a specific department to limit the audience. Department-targeted notices only appear for crew in that department — everyone else does not see them at all.',
      },
      { type: 'h2', text: 'Pinning and expiry' },
      {
        type: 'list',
        items: [
          '**Pin notice** — keeps the notice at the top of the list regardless of date, ideal for standing orders and the current charter brief',
          '**Require acknowledgement** — crew must explicitly confirm they have read and understood before the notice leaves their action list',
          '**Expiry date** — set a date after which the notice auto-archives, handy for time-sensitive information like port briefings',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'When to require acknowledgement',
        text:
          'Turn acknowledgement on for anything you might need to prove someone saw — safety updates, procedural changes, standing orders. Keep it off for social and informational notices to avoid acknowledgement fatigue.',
      },
      { type: 'h2', text: 'After you post' },
      {
        type: 'p',
        text:
          'All targeted crew receive a push notification immediately. Critical notices also trigger a persistent reminder on their Home screen until they acknowledge.',
      },
      { type: 'h2', text: 'Monitoring read and acknowledgement status' },
      {
        type: 'p',
        text:
          'Tap any notice you have posted to see who has read it, who has acknowledged, and who has not. From the same screen you can send a reminder to non-readers with one tap — they get a fresh push notification pointing straight at the notice.',
      },
      { type: 'h2', text: 'Editing and withdrawing' },
      {
        type: 'p',
        text:
          'You can edit a live notice at any time — crew who have already read it will be notified that it has changed and prompted to read again. To remove a notice entirely, tap **Withdraw** — it disappears from crew lists but is preserved in the audit log.',
      },
    ],
  },

  'uploading-documents': {
    slug: 'uploading-documents',
    title: 'Uploading and Managing Documents',
    category: 'For Captains & Admins',
    description:
      'Upload SOPs, risk assessments, and manuals with version control, acknowledgement tracking, and review reminders.',
    body: [
      {
        type: 'p',
        text:
          'The Documents library is your vessel\u2019s single source of truth for SOPs, risk assessments, manuals, and checklists. This guide covers uploading, versioning, and tracking who has read what.',
      },
      { type: 'h2', text: 'How to upload a document' },
      {
        type: 'p',
        text:
          'Go to the Documents tab and tap **Upload Document**, or use **Upload Document** from Quick Actions on the Home screen.',
      },
      { type: 'h2', text: 'Upload fields' },
      {
        type: 'list',
        items: [
          '**Title** — clear and searchable, e.g. "Tender Operations SOP" rather than "SOP3"',
          '**Department** — Bridge, Deck, Engine, Interior, Safety, or General',
          '**Type** — SOPs, Risk Assessments, Manuals, MSDS/COSHH, Checklists, or Policies',
          '**PDF file** — upload the file itself from your device or cloud storage',
        ],
      },
      { type: 'h2', text: 'Required vs optional acknowledgement' },
      {
        type: 'p',
        text:
          'Toggle **Required acknowledgement** when uploading. When enabled, crew must tap **I have read and understood** on the document and their name plus timestamp is logged. Leave it off for reference documents that do not need formal sign-off.',
      },
      { type: 'h2', text: 'Review dates' },
      {
        type: 'p',
        text:
          'Set a review date to remind yourself to revisit the document and keep it current. On the review date, you get a notification prompting you to update or confirm the document is still valid — a simple way to stay on top of document control.',
      },
      { type: 'h2', text: 'Version control' },
      {
        type: 'p',
        text:
          'When you upload a new version of an existing document:',
      },
      {
        type: 'list',
        items: [
          'The old version is archived automatically and remains accessible in the audit log',
          'All previous acknowledgements are cleared so the new version starts from zero',
          'Crew are notified immediately and prompted to review and re-acknowledge',
          'The compliance dashboard shows anyone still outstanding against the new version',
        ],
      },
      { type: 'h2', text: 'Version notes' },
      {
        type: 'p',
        text:
          'Add a short description of what changed — for example, "Updated Section 3.2 — new tender boarding procedure". Crew see these notes when they open the new version so they know where to focus, and auditors see a clean change history.',
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'Keep version notes specific',
        text:
          'A vague note like "Updated document" is not useful at audit time. Name the section or procedure that changed so the reason for re-acknowledgement is obvious.',
      },
      { type: 'h2', text: 'Monitoring acknowledgements' },
      {
        type: 'p',
        text:
          'Tap any document to see which crew have acknowledged the current version and who is still outstanding. Send reminders from the same screen — crew get a push notification pointing to the document.',
      },
      { type: 'h2', text: 'Storage limits' },
      {
        type: 'p',
        text:
          'The Vessel plan includes **100 GB** of document storage. For fleets needing more, the Fleet plan includes unlimited storage.',
      },
    ],
  },

  'creating-training': {
    slug: 'creating-training',
    title: 'Creating Training Modules and Quizzes',
    category: 'For Captains & Admins',
    description:
      'Build interactive training with text, images, video, and multiple-choice quizzes — and track completion across the crew.',
    body: [
      {
        type: 'p',
        text:
          'Training modules let you deliver structured learning to your crew — induction training, refresher courses, role-specific SOPs — with a quiz at the end to confirm understanding.',
      },
      { type: 'h2', text: 'How to create a module' },
      {
        type: 'p',
        text:
          'Go to the Training tab from the admin side and tap the **+** button to open the Module Builder.',
      },
      { type: 'h2', text: 'Adding content blocks' },
      {
        type: 'p',
        text:
          'Build the module by adding content blocks in any order. Crew work through these in sequence before reaching the quiz.',
      },
      {
        type: 'list',
        items: [
          '**Text paragraphs** — formatted with bold, bullets, and inline links',
          '**Images** — photos or diagrams uploaded from your device',
          '**Video links** — embed training videos from YouTube, Vimeo, or a direct URL',
        ],
      },
      { type: 'h2', text: 'Building the quiz' },
      {
        type: 'p',
        text:
          'Add quiz questions below the content blocks. Three question types are supported:',
      },
      {
        type: 'list',
        items: [
          '**Multiple choice** — 2 to 4 options, mark the correct one',
          '**True/false** — binary questions for quick knowledge checks',
          '**Scenario-based** — a longer question with context, followed by multiple-choice answers',
        ],
      },
      { type: 'h2', text: 'Quiz settings' },
      {
        type: 'list',
        items: [
          '**Pass mark** — the percentage required to pass, typically 80%',
          '**Time limit** — optional, sets a countdown timer on the quiz',
          '**Randomise question order** — shuffles questions per attempt to discourage memorisation',
        ],
      },
      { type: 'h2', text: 'Assigning the module' },
      {
        type: 'p',
        text:
          'Assign the module to all crew, a specific department, or individual crew members. Set an optional deadline — crew get reminders at 7 days, 3 days, and 1 day before the deadline, and overdue modules are flagged on the compliance dashboard.',
      },
      { type: 'h2', text: 'Publishing' },
      {
        type: 'p',
        text:
          'The module is only visible to crew after you publish it. While you are building, save it as a **Draft** and come back later — nothing appears on the crew side until you hit Publish.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Preview before publishing',
        text:
          'Open the module in preview mode and run through the quiz yourself to check the flow, catch any typos, and confirm the pass mark feels right.',
      },
      { type: 'h2', text: 'Monitoring completion' },
      {
        type: 'p',
        text:
          'From the admin Training tab, open any module to see completion rates, individual scores, pass/fail status, and the number of attempts each crew member has made. Sort by status to find anyone still outstanding.',
      },
      { type: 'h2', text: 'Reminders' },
      {
        type: 'p',
        text:
          'Send reminder notifications to crew who have not started the module or who have not yet passed. One tap triggers a push notification pointing straight to the module.',
      },
      { type: 'h2', text: 'Editing a published module' },
      {
        type: 'p',
        text:
          'You can update content blocks and quiz questions after publishing. If the module has already been completed by some crew, their existing results are preserved — they are not automatically reset. If a change is significant enough to warrant re-testing, publish it as a new module instead.',
      },
    ],
  },

  'setting-up-events': {
    slug: 'setting-up-events',
    title: 'Setting Up Events and Guest Briefings',
    category: 'For Captains & Admins',
    description:
      'Schedule charters, drills, and passages with per-department briefings, restricted fields, and live updates.',
    body: [
      {
        type: 'p',
        text:
          'Events coordinate everything that needs the crew on the same page — charters, passages, drills, maintenance, and social events. This guide covers creating an event, writing department briefings, and managing it through to completion.',
      },
      { type: 'h2', text: 'Event types' },
      {
        type: 'list',
        items: [
          '**Passage** — long trips with watch schedules and weather notes',
          '**Guest Visit** — owner or charter visits with arrival details and preferences',
          '**Maintenance** — planned yard periods, service calls, and work scopes',
          '**Social** — crew nights out, birthdays, and team events',
          '**Custom** — anything that does not fit the above',
        ],
      },
      { type: 'h2', text: 'Creating an event' },
      {
        type: 'p',
        text:
          'Go to the Events tab on the admin side and tap **+**. Enter the title, pick a type, set the start and end dates, and write a general description that applies to everyone on the vessel.',
      },
      { type: 'h2', text: 'Department briefings' },
      {
        type: 'p',
        text:
          'Under the general description, add specific briefings for each department. For a guest visit, that might mean:',
      },
      {
        type: 'list',
        items: [
          '**Deck** — tender schedules, water toys, and beach setup',
          '**Interior** — cabin assignments, service timings, and preferences',
          '**Galley** — dietary requirements, allergies, and menu preferences',
          '**Engineering** — generator and water-maker load planning',
        ],
      },
      {
        type: 'p',
        text:
          'Each department only sees their own briefing plus the general description — no cross-department noise.',
      },
      { type: 'h2', text: 'Restricted fields' },
      {
        type: 'p',
        text:
          'Mark sensitive information as restricted to specific roles. For example, guest names and personal details might be visible only to the Captain, Chief Stew, and Chef. Crew who do not have access see a placeholder — they know the restricted field exists but not what it contains.',
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'Guest privacy',
        text:
          'Restricted fields are how you satisfy guest privacy requirements without sacrificing operational awareness. If you are unsure who should see a field, default to fewer roles — you can expand access later.',
      },
      { type: 'h2', text: 'Notification schedule' },
      {
        type: 'p',
        text:
          'Set automatic reminders to fire before the event starts — for example, 7 days, 3 days, and 1 day before. Crew receive push notifications at each interval pointing straight to the briefing, so nothing is left until the last minute.',
      },
      { type: 'h2', text: 'Live updates' },
      {
        type: 'p',
        text:
          'During a running event, post real-time updates — "ETA changed to 1400", "2 additional guests confirmed", "tender departure delayed 30 minutes". Every crew member targeted by the event is notified immediately and the update is appended to the event timeline.',
      },
      { type: 'h2', text: 'Monitoring' },
      {
        type: 'p',
        text:
          'Open any event to see which crew have read the briefing and which have not. Send reminders to outstanding crew with one tap — especially useful in the final hours before a guest arrival or drill.',
      },
      { type: 'h2', text: 'Archiving' },
      {
        type: 'p',
        text:
          'Completed events are archived automatically with all data preserved — briefings, read receipts, live updates, and attached documents. Archived events stay searchable and are included in compliance reports for audit purposes.',
      },
    ],
  },

  'reading-compliance-reports': {
    slug: 'reading-compliance-reports',
    title: 'Reading Compliance Reports',
    category: 'For Captains & Admins',
    description:
      'Understand the compliance dashboard and export audit-ready reports for ISM, flag state, and internal reviews.',
    body: [
      {
        type: 'p',
        text:
          'CrewNotice keeps a continuous compliance record for your vessel — every notice read, document acknowledged, and training module completed is timestamped and tied to a crew member. Reports turn that record into something you can hand to an auditor.',
      },
      { type: 'h2', text: 'Accessing reports' },
      {
        type: 'p',
        text:
          'Go to **Admin Dashboard > Export Report**, or tap **Export Report** from Quick Actions on the Home screen.',
      },
      { type: 'h2', text: 'Report types' },
      {
        type: 'list',
        items: [
          '**Full Compliance Report (PDF)** — the headline document, suitable for handing directly to auditors',
          '**Notice Read Receipts (CSV)** — per-notice read and acknowledgement data for every crew member',
          '**Document Acknowledgements (CSV)** — per-document acknowledgement status across the crew',
          '**Training Records (CSV)** — completion rates, scores, and attempt counts per module',
          '**Activity Log (CSV)** — raw timeline of every action taken in the app during the period',
        ],
      },
      { type: 'h2', text: 'Date range' },
      {
        type: 'p',
        text:
          'Select the period the report should cover — a single day, a rotation, a charter, a quarter, or a full year. The report is scoped to activity inside that window.',
      },
      { type: 'h2', text: 'What the Full Compliance Report includes' },
      {
        type: 'list',
        items: [
          'Vessel summary — name, flag, gross tonnage, and reporting period',
          'Crew roster with roles, departments, and join dates',
          'Per-notice read and acknowledgement status for every notice in the period',
          'Per-document acknowledgement status for every active document',
          'Training completion rates and scores per crew member',
          'Overall compliance percentages for the vessel and each department',
        ],
      },
      { type: 'h2', text: 'Using reports for audits' },
      {
        type: 'p',
        text:
          'Export the report for the audit period, then print it or have it available digitally on a tablet. The PDF includes timestamped evidence of every crew interaction — exactly what ISM auditors and flag state inspectors look for when verifying familiarisation, safety briefings, and training completion.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Audit-ready in under a minute',
        text:
          'When an auditor asks to see evidence of a specific notice or training module, export a targeted CSV right there on the spot. It turns a stressful request into a 60-second answer.',
      },
      { type: 'h2', text: 'Compliance scores explained' },
      {
        type: 'p',
        text:
          "Each crew member's compliance score is calculated from the notices they've read, the documents they've acknowledged, and the training they've completed, divided by the total required items assigned to them. 100% means fully compliant — nothing outstanding.",
      },
      { type: 'h2', text: 'Tips for staying ahead' },
      {
        type: 'list',
        items: [
          'Run a compliance report weekly to spot gaps early, not the night before an audit',
          'Address low individual scores before they become a vessel-wide pattern',
          'Use CSV exports in a spreadsheet to spot trends across rotations',
          'Keep a saved PDF of each quarter\u2019s report in your offline records',
        ],
      },
    ],
  },

  'managing-crew': {
    slug: 'managing-crew',
    title: 'Managing Crew and Invite Codes',
    category: 'For Captains & Admins',
    description:
      'Add, manage, and deactivate crew members, and generate invite codes with role and department presets.',
    body: [
      {
        type: 'p',
        text:
          'Crew management covers everything from onboarding a new deckhand to deactivating an account at the end of a rotation. This guide walks through the tools you use most.',
      },
      { type: 'h2', text: 'The crew roster' },
      {
        type: 'p',
        text:
          'Go to **Admin > Crew** to see every crew member on your vessel. Each row shows their name, role, department, online status, and current compliance score — a quick way to spot anyone falling behind.',
      },
      { type: 'h2', text: 'Individual crew profiles' },
      {
        type: 'p',
        text:
          "Tap any crew member to open their profile. You see their full compliance breakdown — which notices they've read, which documents they've acknowledged, and which training modules they've completed — plus their history of reads, acknowledgements, and quiz attempts.",
      },
      { type: 'h2', text: 'Generating invite codes' },
      {
        type: 'p',
        text:
          'Go to **Admin > Invite Crew** to create a new code. Share it with new crew by any channel you prefer — text, WhatsApp, email, or on the whiteboard.',
      },
      { type: 'h2', text: 'Invite code settings' },
      {
        type: 'list',
        items: [
          '**Role preset** — pre-fill the role on the join form, e.g. "Deckhand"',
          '**Department preset** — pre-fill the department, e.g. "Deck"',
          '**Number of uses** — 1 for a specific person, 5 for a department intake, or unlimited',
          '**Expiry date** — the code stops working after this date, even if uses remain',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'One-shot invite codes',
        text:
          'For new hires, set the uses to 1 and the expiry to 7 days. Once they join, the code is spent — nobody else can use it by accident or intent.',
      },
      { type: 'h2', text: 'When crew leave' },
      {
        type: 'p',
        text:
          'Deactivate a crew member from their profile when they sign off. Their historical data — reads, acknowledgements, training records — is preserved for audit purposes, but they can no longer access the vessel workspace. Deactivation is reversible if they return on a future rotation.',
      },
      { type: 'h2', text: 'Crew rotating between vessels' },
      {
        type: 'p',
        text:
          "Each vessel on CrewNotice is a separate workspace. Crew joining a new vessel need a fresh invite code from that vessel's admin — there is no cross-vessel sharing. Their personal account (name, email, password) carries over, so they don't create a new account each time, but vessel data stays scoped to each vessel for privacy and security.",
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'Privacy between vessels',
        text:
          'When a crew member leaves your vessel and joins another, your vessel data — notices, documents, training results — is not visible to the new vessel. Only their personal account details carry over.',
      },
    ],
  },

  'reading-notices': {
    slug: 'reading-notices',
    title: 'Reading and Acknowledging Notices',
    category: 'For Crew',
    description:
      'How to find, read, and acknowledge notices — and what happens if you skip the critical ones.',
    body: [
      {
        type: 'p',
        text:
          'Notices are how your captain, HOD, or admin communicates anything the whole crew needs to know — from routine updates to critical safety changes. Here is how to stay on top of them.',
      },
      { type: 'h2', text: 'Finding your notices' },
      {
        type: 'p',
        text:
          'Tap the Notices tab in the bottom navigation. You will see every notice posted to your vessel, newest first. Unread notices are marked with a blue dot, and critical notices have a red bar down the left side so you can spot them at a glance.',
      },
      { type: 'h2', text: 'Filtering and searching' },
      {
        type: 'p',
        text:
          'Use the filter chips at the top of the list to narrow by priority, category, or status — for example **Critical only**, **Unread**, or **Needs acknowledgement**. Tap the search icon to find a specific notice by keyword.',
      },
      { type: 'h2', text: 'Reading a notice' },
      {
        type: 'p',
        text:
          'Tap any notice to open it. You will see who posted it, when, the priority level, and the full body. Attachments — photos, PDFs, and linked documents — appear inline so you can review everything in one place.',
      },
      { type: 'h2', text: 'Marking as read' },
      {
        type: 'p',
        text:
          'Routine notices are marked as read automatically once you open them and scroll to the bottom. No tap required — just make sure you actually read to the end.',
      },
      { type: 'h2', text: 'Acknowledging critical notices' },
      {
        type: 'p',
        text:
          'Critical notices require an explicit acknowledgement. When you finish reading, a button at the bottom says **I have read and understood**. Tap it to confirm. Your name and timestamp are logged against the notice so your admin has a clear compliance record.',
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'What happens if I do not acknowledge?',
        text:
          'Unacknowledged critical notices stay pinned to the top of your Home screen and keep sending reminders. Your name will also show up on the admin compliance dashboard as outstanding, which gets flagged to the captain.',
      },
      { type: 'h2', text: 'Pinned notices' },
      {
        type: 'p',
        text:
          'Your admin can pin important notices to the top of the list so they stay visible even as new ones are posted — typical examples include standing orders, the current charter brief, and weather warnings.',
      },
      { type: 'h2', text: 'Voting and polls' },
      {
        type: 'p',
        text:
          'Some notices include a poll — for example, picking the crew meal on a changeover day. Just tap your choice inside the notice. You can change your vote until the poll closes.',
      },
    ],
  },

  'accessing-documents': {
    slug: 'accessing-documents',
    title: 'Accessing SOPs and Risk Assessments',
    category: 'For Crew',
    description:
      'Find the documents relevant to your role, save them for offline, and stay on top of updated versions.',
    body: [
      {
        type: 'p',
        text:
          'The Library holds every SOP, risk assessment, manual, checklist, and reference document your vessel runs on. It is organised so you only see what is relevant to your role.',
      },
      { type: 'h2', text: 'Finding documents' },
      {
        type: 'p',
        text:
          'Tap the Library tab to see documents grouped by category — Safety, Operations, Interior, Engineering, and so on. Your admin controls which categories you can see based on your department, so the list stays focused.',
      },
      { type: 'h2', text: 'Searching' },
      {
        type: 'p',
        text:
          'Tap the search icon and start typing. Library search looks inside document titles, descriptions, and the body text of PDFs — so you can find a specific SOP even if you do not remember exactly what it is called.',
      },
      { type: 'h2', text: 'Viewing a document' },
      {
        type: 'p',
        text:
          'Tap any document to open it. PDFs render inline — you can pinch to zoom, swipe between pages, and tap headings in the table of contents to jump around. Word documents and images work the same way.',
      },
      { type: 'h2', text: 'Acknowledging a document' },
      {
        type: 'p',
        text:
          'Some documents — typically SOPs for your role — require an acknowledgement that you have read them. Scroll to the bottom and tap **I have read and understood**. Your acknowledgement is logged with a timestamp.',
      },
      { type: 'h2', text: 'Updated documents' },
      {
        type: 'p',
        text:
          'When an admin uploads a new version of a document you already acknowledged, CrewNotice notifies you and asks you to re-acknowledge. The changelog shows what changed since the last version so you can focus on what is new.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Tip',
        text:
          'Documents marked with a pin icon are mandatory for your role — prioritise reading those first when you join a new vessel.',
      },
      { type: 'h2', text: 'Saving for offline' },
      {
        type: 'p',
        text:
          'Tap the download icon on any document to save it to your device for offline access. This is essential before heading out of WiFi range — at sea, in a tender, or anywhere coverage is flaky. See **Saving Documents for Offline Access** for the full guide.',
      },
      { type: 'h2', text: 'Favourites' },
      {
        type: 'p',
        text:
          'Tap the star icon on a document to add it to your Favourites. Your favourites appear at the top of the Library for instant access — a good spot for the documents you check every day.',
      },
    ],
  },

  'completing-training': {
    slug: 'completing-training',
    title: 'Completing Training and Quizzes',
    category: 'For Crew',
    description:
      'Work through assigned training modules, take quizzes, and track your training history.',
    body: [
      {
        type: 'p',
        text:
          'Training modules in CrewNotice combine reading material, images, and quizzes so you can complete assigned training at your own pace — whether that is during downtime on watch or when you first join a vessel.',
      },
      { type: 'h2', text: 'Finding your training' },
      {
        type: 'p',
        text:
          'Tap the Training tab in the bottom navigation. You will see every module assigned to you, with a status chip — **Not started**, **In progress**, **Completed**, or **Overdue**. Modules with a deadline show the due date.',
      },
      { type: 'h2', text: 'Working through a module' },
      {
        type: 'p',
        text:
          'Tap a module to open it. Training is structured as a series of sections — read through each one, tap Next when you are ready, and your progress is saved automatically. You can pause and come back at any time without losing your place.',
      },
      { type: 'h2', text: 'Taking the quiz' },
      {
        type: 'p',
        text:
          'Most modules end with a multiple-choice quiz. Read each question, tap your answer, and tap Next. You can flag questions to come back to before you submit. Once you submit, your score is calculated immediately.',
      },
      { type: 'h2', text: 'Results and pass marks' },
      {
        type: 'p',
        text:
          'Each quiz has a pass mark set by your admin — typically 80%. If you pass, the module is marked as completed and added to your training history. If you do not pass, you will see which questions you got wrong along with the correct answer, so you can learn before retaking it.',
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'Retakes',
        text:
          'You can retake a quiz as many times as you need until you pass. Admins see the number of attempts in the compliance dashboard, but only your final passing attempt counts toward completion.',
      },
      { type: 'h2', text: 'Deadlines' },
      {
        type: 'p',
        text:
          'If a module has a deadline, you will get reminders at 7 days, 3 days, and 1 day before it is due. Overdue modules show a red badge on the Training tab and are flagged on the compliance dashboard.',
      },
      { type: 'h2', text: 'Your training history' },
      {
        type: 'p',
        text:
          'Tap **History** at the top of the Training tab to see every module you have completed, with scores and completion dates. This is your personal training record — you can export it as a PDF to share with future employers or show during a crew audit.',
      },
    ],
  },

  'viewing-events': {
    slug: 'viewing-events',
    title: 'Viewing Event Briefings',
    category: 'For Crew',
    description:
      'See upcoming charters, drills, guest arrivals, and live event updates as they happen.',
    body: [
      {
        type: 'p',
        text:
          'The Events tab keeps every crew member on the same page for charters, drills, guest arrivals, and any other event that needs coordination across departments.',
      },
      { type: 'h2', text: 'Finding events' },
      {
        type: 'p',
        text:
          'Tap the Events tab. You will see a list of upcoming and current events — past events are archived under the History view. The next event is pinned to the top, and currently running events are highlighted in blue.',
      },
      { type: 'h2', text: 'Event types' },
      {
        type: 'list',
        items: [
          '**Charters** — guest bookings with arrival, departure, and preferences',
          '**Drills** — safety drills, fire, abandon ship, man overboard',
          '**Guest arrivals** — owner or VIP onboardings',
          '**Passages** — long trips with crew watch schedules',
          '**Shipyard** — planned yard periods with work scopes',
        ],
      },
      { type: 'h2', text: 'Reading a briefing' },
      {
        type: 'p',
        text:
          'Tap an event to open the full briefing. You will see the itinerary, start and end times, assigned crew, attached documents, and department-specific notes. Your own tasks — if the admin has assigned any to you — appear highlighted at the top.',
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'Restricted information',
        text:
          'Some guest information — names, VIP preferences, allergies — may only be visible to specific departments for privacy reasons. If you cannot see a section that a colleague can, it is by design.',
      },
      { type: 'h2', text: 'Live updates' },
      {
        type: 'p',
        text:
          'During a running event, admins can post live updates — a flight delay, an itinerary change, a new guest preference. You will get a push notification and the update appears in the event timeline. Pull to refresh if you are already on the event page.',
      },
      { type: 'h2', text: 'Marking a briefing as read' },
      {
        type: 'p',
        text:
          'Open the briefing and scroll to the bottom to mark it as read. For critical briefings — owner arrivals, for example — your admin may require an explicit acknowledgement before the event starts, the same as with critical notices.',
      },
      { type: 'h2', text: 'Calendar view' },
      {
        type: 'p',
        text:
          'Tap the calendar icon at the top of the Events tab to switch to a month view. Events appear as coloured bars so you can see how the month is shaping up at a glance.',
      },
    ],
  },

  'offline-access': {
    slug: 'offline-access',
    title: 'Saving Documents for Offline Access',
    category: 'For Crew',
    description:
      'Cache the documents you need so you can read them at sea, in a tender, or anywhere signal drops out.',
    body: [
      {
        type: 'p',
        text:
          'Vessels work in places where WiFi is flaky or absent. CrewNotice is designed to keep working offline — you just need to cache the documents you might need before you leave coverage.',
      },
      { type: 'h2', text: 'Why save documents offline?' },
      {
        type: 'list',
        items: [
          'Read SOPs and risk assessments at sea with no signal',
          'Reference checklists in the engine room or a tender',
          'View guest briefings during a transfer with patchy data',
          'Keep working during scheduled satellite downtime',
        ],
      },
      { type: 'h2', text: 'How to save a document' },
      {
        type: 'steps',
        items: [
          {
            title: 'Open the document',
            body:
              'Go to the Library tab and tap any document to open it.',
          },
          {
            title: 'Tap the download icon',
            body:
              'Look for the download icon in the top-right corner of the document viewer.',
          },
          {
            title: 'Wait for the confirmation',
            body:
              'You will see a green check appear when the document is fully cached. Large PDFs may take a few seconds.',
          },
          {
            title: 'The document is now available offline',
            body:
              'Cached documents show a small cloud icon with a checkmark next to them in the Library list.',
          },
        ],
      },
      { type: 'h2', text: 'Checking what you have cached' },
      {
        type: 'p',
        text:
          'Go to **Profile > Offline Documents** to see every document currently cached on your device, how much storage each one uses, and when it was last updated.',
      },
      { type: 'h2', text: 'Using documents offline' },
      {
        type: 'p',
        text:
          'When you lose connectivity, CrewNotice automatically switches into offline mode — you will see a small banner at the top of the screen. Cached documents open exactly as they do online. Anything you have not cached will show a greyed-out icon and be unavailable until you reconnect.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Tip',
        text:
          'Before each trip offshore, spend 2 minutes caching any documents you might need — safety SOPs, the current charter brief, and emergency checklists are a good default set.',
      },
      { type: 'h2', text: 'Clearing cached documents' },
      {
        type: 'p',
        text:
          'To free up space on your device, go to **Profile > Offline Documents** and tap the bin icon next to any document. You can also tap **Clear all** to remove every cached document at once.',
      },
      { type: 'h2', text: 'What works offline?' },
      {
        type: 'list',
        items: [
          '**Works offline** — cached documents, previously viewed notices, your training history',
          '**Limited offline** — you can read but not acknowledge critical items until reconnected',
          '**Needs connection** — posting new notices, submitting quiz attempts, syncing event updates',
        ],
      },
      { type: 'h2', text: 'Automatic reconnection' },
      {
        type: 'p',
        text:
          'When your device comes back online, CrewNotice automatically syncs any acknowledgements, quiz submissions, and reads you performed while offline. You do not need to do anything — just keep using the app as normal.',
      },
    ],
  },
};

export function getArticle(slug) {
  return ARTICLES[slug] || null;
}

export function getAllSlugs() {
  return Object.keys(ARTICLES);
}
