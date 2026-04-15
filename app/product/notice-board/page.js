import '../../landing.css';
import ProductPageLayout from '@/components/marketing/ProductPageLayout';

export const metadata = {
  title: 'Notice Board with Read Tracking — CrewNotice',
  description: "Post notices by priority. Know exactly who's read them. Send reminders to those who haven't.",
};

const PriorityIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ReadReceiptsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <polyline points="23 6 12 17 7 12" />
  </svg>
);

const AckIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const FEATURE_BLOCKS = [
  {
    icon: <PriorityIcon />,
    title: 'Priority Levels',
    body: 'Critical, Important, and Routine notices with colour-coded indicators so crew instantly see what needs attention first.',
  },
  {
    icon: <ReadReceiptsIcon />,
    title: 'Read Receipts',
    body: 'Timestamped records of who read each notice and when. Admin sees the full picture, crew sees their own status.',
  },
  {
    icon: <AckIcon />,
    title: 'Mandatory Acknowledgement',
    body: "Critical safety notices require crew to explicitly confirm they've read and understood. No more assuming.",
  },
];

const ADDITIONAL = [
  'Category filtering: Safety, Operations, Guest Info, HR, Social',
  'Pinned notices for always-visible priorities',
  'Full-text search across every notice',
  'Push notifications for new posts',
  'Scheduled notices with publish dates',
  'Expiry dates to auto-archive old notices',
  'Department targeting — send to just the relevant team',
  'Poll voting on notices for quick crew feedback',
];

export default function NoticeBoardPage() {
  return (
    <ProductPageLayout
      breadcrumb="Notice Board"
      title="Digital Notice Board with Read Tracking"
      subtitle="Post notices by priority. Know exactly who's read them. Send reminders to those who haven't."
      featureBlocks={FEATURE_BLOCKS}
      additionalFeatures={ADDITIONAL}
    />
  );
}
