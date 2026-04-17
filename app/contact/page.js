import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import ContactForm from '@/components/marketing/ContactForm';

export const metadata = {
  title: 'Contact CrewNotice',
  description:
    'Get in touch for a free trial, fleet pricing, or questions about crew communications and compliance tracking for superyachts.',
};

const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function ContactPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <div className="section-eyebrow">Contact</div>
          <h1>Get in Touch</h1>
          <p className="page-subtitle">
            Whether you&apos;re a captain looking to trial CrewNotice, a management company interested in
            fleet pricing, or just have a question — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section>
        <div className="wrap">
          <div className="contact-grid">

            {/* Left — Form */}
            <div className="contact-form-wrap">
              <h2>Send us a message</h2>
              <p className="form-desc">
                Fill in the form below and we&apos;ll get back to you within 24 hours.
              </p>
              <ContactForm />
            </div>

            {/* Right — Info */}
            <div className="contact-info-panel">
              <h2>Direct contact</h2>

              <div className="contact-info-item">
                <div className="contact-info-icon"><MailIcon /></div>
                <div>
                  <div className="contact-info-label">Email</div>
                  <div className="contact-info-value">
                    <a href="mailto:hello@crewnotice.com">hello@crewnotice.com</a>
                  </div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon"><BuildingIcon /></div>
                <div>
                  <div className="contact-info-label">Company</div>
                  <div className="contact-info-value">Sharp Digital Solutions Ltd</div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon"><MapPinIcon /></div>
                <div>
                  <div className="contact-info-label">Address</div>
                  <div className="contact-info-value">
                    71-75 Shelton Street, Covent Garden,<br />
                    London, WC2H 9JQ
                  </div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon"><ClockIcon /></div>
                <div>
                  <div className="contact-info-label">Response Time</div>
                  <div className="contact-info-value">We typically respond within 24 hours</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
