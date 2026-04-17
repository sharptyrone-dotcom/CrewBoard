import '../../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import ApiInterestForm from './ApiInterestForm';

export const metadata = {
  title: 'API Documentation',
  description:
    'Integrate CrewNotice with your vessel management systems. REST API for notices, documents, training, and webhooks. Fleet plan.',
};

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const ENDPOINTS = [
  {
    title: 'Notices API',
    body: 'Create, read, and manage notices programmatically. Post notices from external systems, retrieve read receipt data, and sync with existing management platforms.',
  },
  {
    title: 'Documents API',
    body: 'Upload documents, manage versions, and retrieve acknowledgement status. Integrate with existing document management systems.',
  },
  {
    title: 'Training API',
    body: 'Create training modules, assign to crew, and retrieve completion data. Import training content from external LMS platforms.',
  },
  {
    title: 'Crew API',
    body: 'Read crew profiles, compliance scores, and activity data. Sync with HR and crew management systems.',
  },
  {
    title: 'Webhooks',
    body: 'Receive real-time notifications when notices are read, documents acknowledged, training completed, or compliance thresholds are crossed.',
  },
  {
    title: 'Reports API',
    body: 'Generate and retrieve compliance reports programmatically for integration with fleet management dashboards.',
  },
];

export default function ApiDocsPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <div className="section-eyebrow">Resources</div>
          <h1>API Documentation</h1>
          <p className="page-subtitle">
            Integrate CrewNotice with your existing vessel systems.
          </p>
        </div>
      </section>

      {/* Status banner */}
      <section>
        <div className="wrap">
          <div className="api-banner">
            <div className="api-banner-icon"><CodeIcon /></div>
            <p>
              <strong>The CrewNotice API is currently in development.</strong>{' '}
              Fleet plan customers will receive API access when available. Register your
              interest below.
            </p>
          </div>
        </div>
      </section>

      {/* Planned endpoints */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Endpoints</div>
            <h2>Planned API Endpoints</h2>
            <p className="section-sub">
              A REST API covering every core CrewNotice capability, designed for integration with
              fleet management, HR, and LMS platforms.
            </p>
          </div>
          <div className="api-endpoint-grid">
            {ENDPOINTS.map(ep => (
              <div key={ep.title} className="api-endpoint-card">
                <div className="api-endpoint-head">
                  <span className="api-endpoint-dot" />
                  <h3>{ep.title}</h3>
                </div>
                <p>{ep.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth + Rate limits */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Technical Details</div>
            <h2>Authentication &amp; Rate Limits</h2>
          </div>
          <div className="api-info-block">
            <h3>Authentication</h3>
            <p>
              The API will use API key authentication scoped to your vessel. All requests will be
              made over HTTPS.
            </p>
          </div>
          <div className="api-info-block">
            <h3>Rate Limits</h3>
            <p>
              Standard rate limits will apply: 100 requests per minute per API key.
            </p>
          </div>
        </div>
      </section>

      {/* Interest form */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Get Early Access</div>
            <h2>Register Your Interest</h2>
            <p className="section-sub">
              Tell us about your integration needs and we&apos;ll reach out as soon as the API is
              available.
            </p>
          </div>
          <ApiInterestForm />
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
