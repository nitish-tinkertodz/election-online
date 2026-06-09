# Quickstart: School Election Voting System

## Prerequisites

- Node.js 20+
- Cloudflare account with D1 and R2 enabled
- Admin access password for the election dashboard: `12345678`

## Setup

1. Install dependencies.

```bash
npm install
```

2. Apply database migrations and seed the baseline election settings.

```bash
npm run db:migrate
npm run db:seed
```

3. Start the development server.

```bash
npm run dev
```

## Validation Scenarios

### Admin page

1. Open `/admin`.
2. Sign in with the shared admin password `12345678`.
3. Create or edit roles and candidates.
4. Upload a candidate photo and confirm the preview updates.
5. Start the election and confirm the status changes to `OPEN`.
6. Stop the election and confirm the final results snapshot is generated.

### Voting page

1. Open `/vote` while the election is `NOT_STARTED`.
2. Confirm the page shows the “Voting has not started yet.” message.
3. Open `/vote` while the election is `OPEN`.
4. Cast one role vote, refresh the page, and confirm completed role progress remains visible.
5. Open a second tab in the same browser and confirm the same completed role cannot be voted again.
6. Close the browser, reopen it, and confirm a fresh anonymous session begins.

### Results page

1. Open `/results` as an admin while the election is `OPEN`.
2. Confirm live vote counts and role rankings render.
3. Close the election.
4. Confirm the page shows the official final snapshot and does not recalculate on refresh.

## Expected Outcomes

- Only `/admin`, `/vote`, and `/results` exist as main pages.
- Unauthorized users cannot access admin-only data.
- The vote API rejects submissions outside the `OPEN` state.
- Final results remain stable after closure.
