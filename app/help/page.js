import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Help Centre — CrewNotice',
  description: 'Everything you need to get started and get the most out of CrewNotice. Guides for captains, admins, and crew.',
};

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const HELP_CATEGORIES = [
  {
    eyebrow: 'Getting Started',
    title: 'Getting Started',
    articles: [
      { title: 'Creating your vessel and inviting crew', desc: 'Set up your CrewNotice vessel and get your crew on board in minutes.' },
      { title: 'Joining a vessel with an invite code', desc: 'How crew members accept an invite and join their vessel.' },
      { title: 'Navigating the crew dashboard', desc: 'A tour of the notices, documents, training, and events tabs.' },
      { title: 'Setting up notifications', desc: 'Enable push, email, and browser alerts so you never miss an update.' },
      { title: 'Installing CrewNotice on your phone', desc: 'Add CrewNotice to your home screen on iOS and Android as a PWA.' },
    ],
  },
  {
    eyebrow: 'Admin Guide',
    title: 'For Captains & Admins',
    articles: [
      { title: 'Posting notices and setting priorities', desc: 'Create routine, important, and critical notices with acknowledgement tracking.' },
      { title: 'Uploading and managing documents', desc: 'Upload SOPs, risk assessments, and manuals with version control.' },
      { title: 'Creating training modules and quizzes', desc: 'Build interactive training with multiple-choice quizzes and pass marks.' },
      { title: 'Setting up events and guest briefings', desc: 'Schedule charters, drills, and events with read receipts per crew member.' },
      { title: 'Reading compliance reports', desc: 'Understand the compliance dashboard and export audit-ready reports.' },
      { title: 'Managing crew and invite codes', desc: 'Add, remove, and manage crew members and revoke invite codes.' },
    ],
  },
  {
    eyebrow: 'Crew Guide',
    title: 'For Crew',
    articles: [
      { title: 'Reading and acknowledging notices', desc: 'How to read notices, acknowledge critical items, and vote in polls.' },
      { title: 'Accessing SOPs and risk assessments', desc: 'Find and read the documents relevant to your role and department.' },
      { title: 'Completing training and quizzes', desc: 'Work through assigned training modules and complete assessments.' },
      { title: 'Viewing event briefings', desc: 'See upcoming events, guest arrivals, and drill schedules.' },
      { title: 'Saving documents for offline access', desc: 'Cache important documents so you can read them at sea without signal.' },
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
          {HELP_CATEGORIES.map(cat => (
            <div key={cat.title} className="help-category">
              <div className="help-category-head">
                <h2>{cat.title}</h2>
                <span className="help-category-count">
                  {cat.articles.length} article{cat.articles.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="help-grid">
                {cat.articles.map(article => (
                  <div
                    key={article.title}
                    className="help-article"
                    title="Coming soon"
                    aria-disabled="true"
                  >
                    <span className="help-article-badge">Coming soon</span>
                    <div className="help-article-body">
                      <h3 className="help-article-title">{article.title}</h3>
                      <p className="help-article-desc">{article.desc}</p>
                    </div>
                    <div className="help-article-arrow"><ArrowIcon /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}

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
