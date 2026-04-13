# CrewNotice — Manual Testing Checklist

Use this checklist when testing new deployments or after significant changes.
Login with dev accounts: `sophie.laurent@serenity.yacht` (Admin) or `tom.hayes@serenity.yacht` (Crew).
Password: `CrewNotice2026`

---

## Authentication

- [ ] Admin can log in with email and password
- [ ] Crew can log in with email and password
- [ ] Admin can generate invite code (Admin > Invite Crew)
- [ ] Crew can join vessel with valid invite code at `/join`
- [ ] Invalid/expired invite codes are rejected with clear error
- [ ] Join page requires "I agree to Terms of Service and Privacy Policy" checkbox
- [ ] Unauthenticated users see login screen at `/app`
- [ ] Admin sees admin UI (sidebar: Dashboard, Notices, Documents, Training, Events, Crew, Activity)
- [ ] Crew sees crew UI (bottom nav: Home, Notices, Docs, Training, Events)
- [ ] Logging out returns to login screen

## Notices

- [ ] Admin can create notice with all options (category, priority, pin, ack required, department target, expiry)
- [ ] Crew receives real-time notification for new notice (bell icon badge updates)
- [ ] Notice toast appears for crew on other tabs when new notice arrives
- [ ] Crew can read notice and it marks as read (read count updates)
- [ ] Critical notices require explicit acknowledgement button
- [ ] Admin can see read receipts per notice (who read, who acknowledged)
- [ ] Admin can send reminder to non-readers from notice detail
- [ ] Search by title works correctly
- [ ] Filter by category works correctly
- [ ] Filter by department works correctly
- [ ] Pinned notices appear at top of the list
- [ ] Admin can delete a notice
- [ ] Deleted notice disappears in real-time for crew

## Documents

- [ ] Admin can upload a PDF document with metadata (title, type, department, version)
- [ ] Document appears in correct department and type filters
- [ ] Crew can view document inline (PDF renders in iframe)
- [ ] Crew can acknowledge document
- [ ] Admin can upload new version (Replace with new version button)
- [ ] Replacing a document clears all previous acknowledgements
- [ ] Version notes display on the replaced document
- [ ] Crew notified of document update
- [ ] Department filter works correctly
- [ ] Type filter (SOPs, Risk Assessments, etc.) works correctly
- [ ] Quick Access (star) bookmarking works
- [ ] Admin can delete a document

## Training

- [ ] Admin can create training module with content blocks (text, image)
- [ ] Admin can add quiz questions with multiple choice answers
- [ ] Admin can set pass mark, time limit, and randomise options
- [ ] Admin can assign module to all crew or specific departments
- [ ] Crew sees assignment with deadline on Training tab
- [ ] Module content displays correctly (text blocks, images)
- [ ] Quiz questions display correctly with answer options
- [ ] Timer countdown works when time limit is set
- [ ] Scoring calculates correctly against pass mark
- [ ] Pass/fail result displays with score breakdown
- [ ] Failed crew can retake quiz
- [ ] Admin sees completion rates and individual scores
- [ ] Admin can edit an existing module
- [ ] Admin can send training reminders to incomplete crew

## Events

- [ ] Admin can create event with type, title, description, dates, and times
- [ ] Admin can add department briefings to event
- [ ] Admin can add restricted fields visible only to selected roles
- [ ] Event appears on crew timeline with correct type icon and countdown
- [ ] Crew sees department-specific briefing for their department
- [ ] Restricted fields hidden from unauthorised crew roles
- [ ] Admin can post live updates on an event
- [ ] Live updates appear in real-time for crew viewing the event
- [ ] Crew receives notification when admin posts event update
- [ ] Notification click-through navigates to the event detail
- [ ] Admin who posted update does NOT receive notification
- [ ] Admin can archive/complete an event
- [ ] Admin can delete an event
- [ ] Event filter (Upcoming, Active, All, Archived) works correctly
- [ ] Mark as read works for crew

## Notifications

- [ ] Bell icon shows unread count badge
- [ ] Notification panel lists all notifications newest first
- [ ] Clicking a notice notification navigates to that notice
- [ ] Clicking a document notification navigates to that document
- [ ] Clicking an event notification navigates to that event
- [ ] Read notifications are visually distinct from unread
- [ ] Dashboard "Send Reminder" sends compliance reminders to crew with outstanding items

## PWA & Offline

- [ ] App installable to home screen (Android Chrome)
- [ ] App installable to home screen (iOS 16.4+ Safari)
- [ ] Service worker registers without errors
- [ ] Cookie consent banner appears on first visit
- [ ] Documents can be saved for offline access (crew doc list download icon)
- [ ] Cached documents accessible when offline
- [ ] Offline indicator banner shows when disconnected
- [ ] "Back online" flash appears on reconnect
- [ ] Cached documents can be removed individually from Profile
- [ ] "Clear all" removes all cached documents

## Responsive Design

- [ ] Login page renders correctly on mobile (375px)
- [ ] Join page renders correctly on mobile
- [ ] Works on iPhone SE (320px width)
- [ ] Works on standard phones (375px-414px)
- [ ] Works on tablets in portrait (768px)
- [ ] Works on tablets in landscape (1024px)
- [ ] Works on desktop browsers (1280px+)
- [ ] Sidebar collapses to bottom nav on mobile
- [ ] Modals are scrollable and don't overflow on small screens

## Legal & Compliance

- [ ] Landing page footer shows Sharp Digital Solutions Ltd with registered address
- [ ] Privacy Policy page loads at `/privacy` with correct company details
- [ ] Terms of Service page loads at `/terms` with correct company details
- [ ] Cookie Policy page loads at `/cookies` with correct company details
- [ ] Legal pages use light theme with Outfit font
- [ ] Login page shows "A product by Sharp Digital Solutions Ltd"
- [ ] Login page has links to Privacy, Terms, Cookies
- [ ] Join page has links to Privacy, Terms, Cookies

## Real-time Updates

- [ ] New notice appears instantly for other logged-in users
- [ ] Notice deletion removes it instantly for other users
- [ ] Notice read/ack status updates in real-time on admin view
- [ ] New notification bell badge updates without refresh
- [ ] Poll votes update in real-time
- [ ] Event updates appear live on event detail screen
