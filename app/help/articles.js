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
          'Tap your avatar in the top right to open profile settings. This is where you manage your personal details, cached offline documents, and notification preferences.',
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
      { type: 'h2', text: 'Notification preferences' },
      {
        type: 'p',
        text:
          'Go to Profile > Notification Preferences to customise what you receive. You can mute routine categories while keeping the important ones loud.',
      },
      {
        type: 'callout',
        variant: 'note',
        title: 'Note',
        text:
          'Critical safety notices cannot be muted — this is a safety policy that applies to every vessel on CrewNotice.',
      },
      { type: 'h2', text: 'Troubleshooting' },
      {
        type: 'p',
        text:
          "If you're not receiving notifications, check the following:",
      },
      {
        type: 'list',
        items: [
          "Your phone's notification settings for your browser are set to Allow",
          'CrewNotice is not in a restricted battery-saving mode',
          'You have WiFi connectivity when the notice is sent',
        ],
      },
      { type: 'h2', text: 'Quiet hours' },
      {
        type: 'p',
        text:
          "When your admin has configured off-watch times, notifications respect them — you won't be woken up by non-critical alerts during your sleep watch.",
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
