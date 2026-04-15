import '../../landing.css';
import ProductPageLayout from '@/components/marketing/ProductPageLayout';

export const metadata = {
  title: 'Compliance Dashboard & Audit Reports — CrewNotice',
  description: 'Real-time crew compliance visibility. Exportable reports for ISM, MLC, and flag state inspections.',
};

const ScoreIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const ReportIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const LogIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FEATURE_BLOCKS = [
  {
    icon: <ScoreIcon />,
    title: 'Per-Crew Compliance Scoring',
    body: 'Every crew member has a compliance score based on notices read, documents acknowledged, and training completed. Spot gaps instantly.',
  },
  {
    icon: <ReportIcon />,
    title: 'Exportable Audit Reports',
    body: 'Generate PDF and CSV reports covering notice read receipts, document acknowledgements, training records, and activity logs. Date range filtering included.',
  },
  {
    icon: <LogIcon />,
    title: 'Full Activity Log',
    body: 'Every action timestamped and recorded. Who posted what, who read what, who acknowledged what. Complete audit trail.',
  },
];

const ADDITIONAL = [
  'Compliance heatmap across the whole crew',
  'Automated reminders for overdue items',
  'Overdue item tracking with escalation',
  'Department-level compliance views',
  'Fleet-wide compliance dashboard (Enterprise plans)',
];

export default function CompliancePage() {
  return (
    <ProductPageLayout
      breadcrumb="Compliance"
      title="Compliance Dashboard & Audit Reports"
      subtitle="Real-time crew compliance visibility. Exportable reports for ISM, MLC, and flag state inspections."
      featureBlocks={FEATURE_BLOCKS}
      additionalFeatures={ADDITIONAL}
    />
  );
}
