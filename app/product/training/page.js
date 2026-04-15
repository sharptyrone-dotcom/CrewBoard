import '../../landing.css';
import ProductPageLayout from '@/components/marketing/ProductPageLayout';

export const metadata = {
  title: 'Crew Training & Quiz Engine — CrewNotice',
  description: 'Deliver training modules, test knowledge, and track completion — all without disrupting operations.',
};

const ModuleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ScoreIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const TrackIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const FEATURE_BLOCKS = [
  {
    icon: <ModuleIcon />,
    title: 'Module Builder',
    body: 'Create training content with text, images, and video. Build quizzes with multiple choice, true/false, and scenario-based questions.',
  },
  {
    icon: <ScoreIcon />,
    title: 'Scored Assessments',
    body: 'Set pass marks, time limits, and randomised questions. Crew see instant results with explanations. Failed crew can retake.',
  },
  {
    icon: <TrackIcon />,
    title: 'Completion Tracking',
    body: 'See who has completed what, their scores, and who is overdue. Send reminders with one click.',
  },
];

const ADDITIONAL = [
  'Assign by department or individual crew member',
  'Deadline tracking with overdue alerts',
  'Training certificates generated on completion',
  'Image support in question banks',
  'Full attempt history with score breakdown',
  'Exportable training records for audits',
];

export default function TrainingPage() {
  return (
    <ProductPageLayout
      breadcrumb="Training"
      title="Crew Training & Quiz Engine"
      subtitle="Deliver training modules, test knowledge, and track completion — all without disrupting operations."
      featureBlocks={FEATURE_BLOCKS}
      additionalFeatures={ADDITIONAL}
    />
  );
}
