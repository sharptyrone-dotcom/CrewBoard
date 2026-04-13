# CrewNotice — Yacht Crew Operational Platform

Digital notice board, document library, and compliance tracking for superyacht crew.

## Project Structure

```
crewnotice/
├── app/
│   ├── globals.css        # Global styles, fonts, resets
│   ├── layout.js          # Root layout with metadata & PWA config
│   └── page.js            # Main page (imports CrewNotice component)
├── components/
│   └── CrewNotice.js       # Full app component (all screens, state, UI)
├── public/
│   └── manifest.json      # PWA manifest for installable app
├── .gitignore
├── jsconfig.json          # Path aliases (@/ → root)
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
└── README.md
```

## Setup & Deploy

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 3. Deploy to Vercel
```bash
# If not already linked
vercel link

# Deploy
vercel --prod
```

### 4. Custom domain (GoDaddy)
After deploying, add your custom domain in Vercel dashboard:
- Settings → Domains → Add domain
- Update DNS in GoDaddy to point to Vercel

## PWA Notes

This is configured as a Progressive Web App. For full PWA functionality:
- Add icon-192.png and icon-512.png to /public/
- The manifest.json is already configured
- Service worker for offline support can be added in Phase 2

## Current State

This is the Phase 1 frontend prototype with mock data. It includes:
- **Crew view**: Home dashboard, notices with read/acknowledge, document library, profile
- **Admin view**: Dashboard with compliance metrics, notice management with read receipts, document management, crew compliance profiles
- **Notifications panel**: Slide-over panel with notification types
- **New Notice modal**: Full creation form with category, priority, pinning, acknowledgement

## Next Steps (Backend Integration)

When ready to add a backend:
1. Set up Supabase project (database + auth + storage)
2. Replace mock data with API calls
3. Add authentication flow (email/password + invite codes)
4. Implement file upload for documents
5. Add push notifications via Web Push API
6. Add real-time updates via Supabase subscriptions
