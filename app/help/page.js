import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import HelpCategories from '@/components/marketing/HelpCategories';

export const metadata = {
  title: 'Help Centre — CrewNotice',
  description: 'Everything you need to get started and get the most out of CrewNotice. Guides for captains, admins, and crew.',
};

const HELP_CATEGORIES = [
  {
    eyebrow: 'Getting Started',
    title: 'Getting Started',
    articles: [
      { slug: 'creating-your-vessel', title: 'Creating your vessel and inviting crew', desc: 'Set up your CrewNotice vessel and get your crew on board in minutes.' },
      { slug: 'joining-a-vessel', title: 'Joining a vessel with an invite code', desc: 'How crew members accept an invite and join their vessel.' },
      { slug: 'navigating-the-dashboard', title: 'Navigating the crew dashboard', desc: 'A tour of the notices, documents, training, and events tabs.' },
      { slug: 'setting-up-notifications', title: 'Setting up notifications', desc: 'Enable push, email, and browser alerts so you never miss an update.' },
      { slug: 'installing-on-your-phone', title: 'Installing CrewNotice on your phone', desc: 'Add CrewNotice to your home screen on iOS and Android as a PWA.' },
    ],
  },
  {
    eyebrow: 'Admin Guide',
    title: 'For Captains & Admins',
    articles: [
      { slug: 'posting-notices', title: 'Posting notices and setting priorities', desc: 'Create routine, important, and critical notices with acknowledgement tracking.' },
      { slug: 'uploading-documents', title: 'Uploading and managing documents', desc: 'Upload SOPs, risk assessments, and manuals with version control.' },
      { slug: 'creating-training', title: 'Creating training modules and quizzes', desc: 'Build interactive training with multiple-choice quizzes and pass marks.' },
      { slug: 'setting-up-events', title: 'Setting up events and guest briefings', desc: 'Schedule charters, drills, and events with read receipts per crew member.' },
      { slug: 'reading-compliance-reports', title: 'Reading compliance reports', desc: 'Understand the compliance dashboard and export audit-ready reports.' },
      { slug: 'managing-crew', title: 'Managing crew and invite codes', desc: 'Add, remove, and manage crew members and revoke invite codes.' },
    ],
  },
  {
    eyebrow: 'Crew Guide',
    title: 'For Crew',
    articles: [
      { slug: 'reading-notices', title: 'Reading and acknowledging notices', desc: 'How to read notices, acknowledge critical items, and vote in polls.' },
      { slug: 'accessing-documents', title: 'Accessing SOPs and risk assessments', desc: 'Find and read the documents relevant to your role and department.' },
      { slug: 'completing-training', title: 'Completing training and quizzes', desc: 'Work through assigned training modules and complete assessments.' },
      { slug: 'viewing-events', title: 'Viewing event briefings', desc: 'See upcoming events, guest arrivals, and drill schedules.' },
      { slug: 'offline-access', title: 'Saving documents for offline access', desc: 'Cache important documents so you can read them at sea without signal.' },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <div className="section-eyebrow">Help Centre</div>
          <h1>Help Centre</h1>
          <p className="page-subtitle">
            Everything you need to get started and get the most out of CrewNotice.
          </p>
        </div>
      </section>

      {/* Help categories */}
      <section>
        <div className="wrap">
          <HelpCategories categories={HELP_CATEGORIES} />

          <div className="help-contact">
            <h3>Can&apos;t find what you need?</h3>
            <p>
              Email us at <a href="mailto:support@crewnotice.com">support@crewnotice.com</a> and
              we&apos;ll get back to you within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
