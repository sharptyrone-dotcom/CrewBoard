import '../../landing.css';
import ProductPageLayout from '@/components/marketing/ProductPageLayout';

export const metadata = {
  title: 'Document Library with Version Control — CrewNotice',
  description: 'SOPs, risk assessments, and manuals — always current, always accessible, always acknowledged.',
};

const VersionIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <polyline points="21 3 21 8 16 8" />
  </svg>
);

const AckIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="9 15 11 17 15 13" />
  </svg>
);

const OfflineIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const FEATURE_BLOCKS = [
  {
    icon: <VersionIcon />,
    title: 'Automatic Versioning',
    body: 'Upload a new version and the old one is archived. All previous acknowledgements are cleared. Crew are notified and must re-acknowledge.',
  },
  {
    icon: <AckIcon />,
    title: 'Acknowledgement Tracking',
    body: 'See exactly which crew have acknowledged the current version of every required document. Export the data for audits.',
  },
  {
    icon: <OfflineIcon />,
    title: 'Offline Access',
    body: 'Crew can cache critical documents for offline reading during passages with limited connectivity.',
  },
];

const ADDITIONAL = [
  'Department and type filtering: SOPs, Risk Assessments, Manuals, MSDS/COSHH, Checklists, Policies',
  'Full-text search across every document',
  'Favourites — pin the documents you use most',
  'Review date reminders for admins',
  'Built-in PDF viewer, no download required',
];

export default function DocumentLibraryPage() {
  return (
    <ProductPageLayout
      breadcrumb="Document Library"
      title="Document Library with Version Control"
      subtitle="SOPs, risk assessments, and manuals — always current, always accessible, always acknowledged."
      featureBlocks={FEATURE_BLOCKS}
      additionalFeatures={ADDITIONAL}
    />
  );
}
