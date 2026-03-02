# NurseConnect Pro

> A full-stack international nurse recruitment platform connecting healthcare professionals with global employers.

---

## Architecture Overview

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | React Context (`AppContext`, `AuthContext`) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Email | Resend (via Supabase Edge Functions) |
| Charts | Recharts |
| Routing | React Router v6 |

---

## User Roles

| Role | Access |
|---|---|
| `job_seeker` | Job feed, applications, profile, marketplace |
| `student` | Same as job seeker |
| `recruiter` | Recruiter dashboard, post jobs, view applicants, reveals |
| `admin` | Full admin panel at `/admin/dashboard` |

Admin user is auto-assigned via Supabase DB trigger — set `rahulpradeepan55@gmail.com` as admin in `profiles.role`.

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

For Supabase Edge Functions (email notifications), set via Supabase Dashboard → Edge Functions → Secrets:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## Supabase Setup

### 1. Run schema migrations

```bash
# Initial schema
psql -h db.YOUR_PROJECT.supabase.co -U postgres -f supabase_schema.sql

# Feature migration (video, employer status, consent, notifications, etc.)
psql -h db.YOUR_PROJECT.supabase.co -U postgres -f supabase_migration_002.sql
```

### 2. Create Storage Buckets

Go to **Supabase Dashboard → Storage** and create:

| Bucket | Public |
|---|---|
| `profile-videos` | ✅ Yes |
| `profile-avatars` | ✅ Yes |
| `application-cvs` | ❌ Private |
| `user-documents` | ❌ Private |
| `ad-images` | ✅ Yes |

### 3. Set RLS Policies

All tables have RLS enabled. Key policies:

- `profiles` — users read/update own; admins read all
- `notifications` — users read/mark own
- `audit_logs` — admins read; service role insert
- `certificates` — users CRUD own

---

## Running Locally

```bash
bun install
bun run dev
```

App runs at `http://localhost:8080`

---

## Feature Modules

### Video Introduction (Mandatory)
- Upload via `ProfilePage` → Supabase Storage `profile-videos` bucket
- Status: `pending → approved / rejected` (admin approves in Applicant Management tab)
- Job seekers cannot apply until video is uploaded

### Employer Reveals System
- Plans: Agency (10 reveals/$40), Pro (25 reveals/$119), Enterprise (unlimited/$249)
- Add-ons: Match Alerts ($12), Assessment Reports ($10), Branding ($14)
- Reveal counter shown in `RecruiterDashboard` with progress bar and warning at ≤3 remaining

### Admin Dashboard (`/admin/dashboard`)
| Tab | Features |
|---|---|
| Overview | Stats, charts, recent activity |
| Job Approvals | Approve/reject pending jobs |
| User Management | Edit users, change roles, delete |
| Applicant Management | Doc verify, video approve/reject, monthly intake lock (120/mo) |
| Employer Management | Approve/suspend employers, reveal reset |
| Revenue | MRR, ARR, invoice ledger, commission tracking |
| Ads & Partners | Ad management, partner directory |

### VAS Marketplace (`/marketplace`)
- Partner services: LinguaPro, LicenseEase, NursePortfolio, DepartureReady
- One-time mock purchase → `purchaseAddOn()` in AppContext
- Certificate upload → Supabase `certificates` table → badge auto-assigned
- Badge carousel on Profile page

### Notifications
- Real-time bell in Header with unread count badge
- Click to mark as read; "Mark all read" action
- Triggered on: video upload, purchase, badge earned, job matches

### GDPR Consent
- `ConsentModal` shown on first login
- 3-checkbox agreement (Terms + Privacy + DPA)
- Writes `consent_given: true` + `consent_date` to `profiles` table

### Audit Logging
- `src/lib/audit.ts` — `logAction()` + convenience `audit.*` helpers
- Writes to `audit_logs` table (viewable by admins)
- Degrades gracefully to `console.info()` when table unavailable

---

## Key File Map

```
src/
├── App.tsx                          # Routes + global providers
├── context/
│   ├── AppContext.tsx                # Global state, 9+ methods
│   └── AuthContext.tsx              # Supabase auth wrapper
├── pages/
│   ├── ProfilePage.tsx              # User profile + video upload
│   ├── MarketplacePage.tsx          # VAS Marketplace
│   ├── PricingPage.tsx              # Employer/seeker plans
│   ├── RecruiterDashboard.tsx       # Recruiter dashboard
│   ├── admin/AdminDashboard.tsx     # Admin super-panel (7 tabs)
│   └── ...
├── components/
│   ├── ConsentModal.tsx             # GDPR consent dialog
│   ├── layout/Header.tsx           # Nav + notification bell
│   ├── subscription/
│   │   ├── EmployerAddOns.tsx       # Add-on purchase UI
│   │   └── PricingCard.tsx         # Plan card with reveals
│   └── jobs/ApplyModal.tsx         # Application with video gate
├── lib/
│   ├── audit.ts                     # Audit log utility
│   └── supabase.ts                 # Supabase client
└── types/index.ts                   # All TypeScript interfaces
```

---

## Admin Login

Navigate to `/admin/login/superuser` and sign in with the admin-role account.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
