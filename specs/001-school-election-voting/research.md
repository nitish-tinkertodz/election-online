# Research Notes: School Election Voting System

## 1) Frontend and server runtime

- **Decision**: Use Next.js App Router with TypeScript and React.
- **Rationale**: The feature needs exactly three routed pages, server-side protected-page checks, and route-backed APIs. Next.js keeps page routing, server logic, and shared components in one codebase while remaining compatible with Cloudflare deployment targets.
- **Alternatives considered**:
  - SPA + separate backend: workable, but it adds a second deployment surface and makes server-side page protection less direct.
  - Flutter web: acceptable for UI, but it is a poorer fit for route-level server protection and API-heavy admin workflows in this repo.

## 2) Data storage

- **Decision**: Use Cloudflare D1 for election data and Cloudflare R2 for candidate photos.
- **Rationale**: The spec explicitly calls for Cloudflare deployment planning and D1 migrations. D1 supports relational constraints and transactional stop-election processing, while R2 handles image files without bloating relational rows.
- **Alternatives considered**:
  - PostgreSQL + object storage: strong general-purpose choice, but it does not match the Cloudflare-native deployment direction called out by the feature.
  - SQLite files only: too fragile for concurrent writes and immutable final-result snapshots.

## 3) Anonymous voting session tracking

- **Decision**: Use an anonymous browser session cookie to track completed role votes for the current browser session.
- **Rationale**: The clarified requirement says completed-role state must persist across refreshes and tab changes until the browser closes. A session cookie naturally survives refresh and tabs while clearing on browser close, and it does not require voter identity.
- **Alternatives considered**:
  - LocalStorage only: survives too long and is harder to treat as a browser session boundary.
  - SessionStorage: too narrow because it does not share state across tabs.

## 4) Authentication and authorization

- **Decision**: Use server-validated admin sessions with protected page and API checks for `/admin` and `/results`.
- **Rationale**: Admin-only views must never leak data client-side. Server checks keep sensitive data out of unauthorized page responses and protect API mutations as well.
- **Alternatives considered**:
  - Frontend-only guards: insufficient because protected content would still be delivered to the browser.
  - Public admin routes with hidden UI: rejected for the same reason.

## 5) Vote integrity and election closure

- **Decision**: Treat vote recording and election closure as atomic server-side transactions, with final result generation happening in the same close-election flow.
- **Rationale**: The spec requires stop-election to be atomic and final results to remain immutable after closure. A single transaction boundary reduces partial-close states and keeps the official snapshot stable.
- **Alternatives considered**:
  - Separate close and finalize jobs: easier to queue, but it risks the election being closed without a saved final snapshot.
  - Recompute results on every results-page load: conflicts with the requirement that the official result should not change after closure.

## 6) Testing strategy

- **Decision**: Use unit tests for domain rules, integration tests for API and storage behavior, and Playwright for admin/voter/results end-to-end flows.
- **Rationale**: The feature spans routing, server enforcement, data integrity, and UI flow. End-to-end tests are the best proof that the three-page application behaves correctly as a whole.
- **Alternatives considered**:
  - Unit tests only: insufficient for route protection and transactional close behavior.
  - Snapshot UI tests only: too shallow for election integrity requirements.
