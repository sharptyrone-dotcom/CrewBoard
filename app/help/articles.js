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
};

export function getArticle(slug) {
  return ARTICLES[slug] || null;
}

export function getAllSlugs() {
  return Object.keys(ARTICLES);
}
