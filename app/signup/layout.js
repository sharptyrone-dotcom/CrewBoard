// Shared metadata for the /signup tree. We want every page under /signup
// (including the client-component /signup/vessel form, which can't export
// its own metadata) to be noindex — these are transactional pages, not
// marketing content, and they shouldn't compete with the landing page
// in search results.

export const metadata = {
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }) {
  return children;
}
