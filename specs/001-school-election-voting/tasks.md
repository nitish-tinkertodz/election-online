# Tasks: School Election Voting System

**Input**: Design documents from `/specs/001-school-election-voting/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api.md`, `quickstart.md`

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js local-network project structure and shared configuration.

- [X] T001 Create the Next.js project scaffold and base folders in `package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `components/`, `lib/`, `db/`, `tests/`, and `public/`
- [X] T002 Add Tailwind CSS and global app styling in `tailwind.config.ts`, `postcss.config.js`, and `app/globals.css`
- [X] T003 Configure local-network startup and environment guidance in `README.md`
- [X] T004 Add shared TypeScript path aliases and lint/build scripts in `package.json` and `tsconfig.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the data model, server utilities, and route structure required by every user story.

- [X] T005 Create the file-backed election state model for roles, candidates, votes, result snapshots, settings, and admin session state in `lib/election/local-store.ts`
- [X] T006 Seed baseline election settings and placeholder branding through the local store defaults
- [X] T007 Build serialized atomic local-state updates in `lib/election/local-store.ts`
- [X] T008 Build the anonymous browser-session helper for vote progress tracking in `lib/election/session.ts`
- [X] T009 Build shared election-state utilities and transition guards in `lib/election/status.ts`
- [X] T010 Build shared validation schemas for roles, candidates, election status, votes, and branding in `lib/validation/`
- [X] T011 Create the route skeleton for `/admin`, `/vote`, and `/results` in `app/admin/page.tsx`, `app/vote/page.tsx`, and `app/results/page.tsx`
- [X] T012 Create the API route skeletons for roles, candidates, election, votes, results, and branding in `app/api/roles/`, `app/api/candidates/`, `app/api/election/`, `app/api/votes/`, `app/api/results/`, and `app/api/branding/`

**Checkpoint**: Foundation ready - user stories can now be implemented independently.

---

## Phase 3: User Story 1 - Admin Dashboard and Election Management (Priority: P1) 🎯 MVP

**Goal**: Let authorized admins manage roles, candidates, branding, and election open/close controls from `/admin`.

**Independent Test**: Sign in as admin, create and edit roles and candidates, upload or replace a candidate photo, preview candidate cards, update branding, start the election, and stop the election with a preserved final result snapshot.

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement shared-password admin session checks and protected-page redirects in `lib/auth/admin.ts` and `app/admin/layout.tsx`
- [X] T014 [P] [US1] Implement role management persistence and ordering in `lib/roles/role-repository.ts` and `app/api/roles/route.ts`
- [X] T015 [P] [US1] Implement candidate CRUD persistence with role assignment in `lib/candidates/candidate-repository.ts` and `app/api/candidates/route.ts`
- [X] T016 [P] [US1] Implement candidate photo upload and replace flow with local filesystem storage in `lib/storage/photos.ts` and `app/api/candidates/[candidateId]/photo/route.ts`
- [X] T017 [US1] Implement election start/stop controls and atomic close workflow in `lib/election/election-service.ts` and `app/api/election/open/route.ts`
- [X] T018 [US1] Implement final results snapshot generation and archival persistence in `lib/results/finalize-election.ts` and `app/api/election/close/route.ts`
- [X] T019 [US1] Build the admin dashboard UI with role, candidate, branding, and election controls in `app/admin/page.tsx`
- [X] T020 [US1] Build candidate form, placeholder preview, and candidate card preview components in `components/admin/`
- [X] T021 [US1] Build school branding management UI in `components/admin/branding-form.tsx` and `app/api/branding/route.ts`
- [X] T022 [US1] Add server-side authorization for `/results` access and admin-only result visibility in `app/results/layout.tsx`

**Checkpoint**: User Story 1 should now be fully functional and testable independently.

---

## Phase 4: User Story 2 - Voting Portal and Anonymous Session Voting (Priority: P1)

**Goal**: Let voters move through role cards one at a time, with progress preserved across refreshes and tabs until the browser closes.

**Independent Test**: Open `/vote` during `OPEN`, cast a role vote, refresh the page, open another tab, confirm the same role cannot be re-voted, and confirm a fresh browser session starts cleanly after the browser is closed.

### Implementation for User Story 2

- [X] T023 [P] [US2] Implement public election-state gating for `/vote` in `app/vote/page.tsx` and `app/api/election/status/route.ts`
- [X] T024 [P] [US2] Implement anonymous session creation and completed-role persistence in `lib/election/session.ts` and `app/api/votes/route.ts`
- [X] T025 [P] [US2] Implement vote validation for open-state, active role, active candidate, and role alignment in `lib/votes/vote-service.ts`
- [X] T026 [US2] Implement atomic vote submission and duplicate-role prevention within a browser session in `app/api/votes/route.ts`
- [X] T027 [US2] Build the role-by-role voting flow UI in `components/vote/role-card.tsx` and `app/vote/page.tsx`
- [X] T028 [US2] Build the not-started and closed state messages for `/vote` in `components/vote/vote-state-message.tsx`
- [X] T029 [US2] Build client-side progress handling for next-pending-role navigation in `components/vote/vote-flow.tsx`
- [X] T030 [US2] Persist completed-role progress across refreshes and tab changes until browser close in `components/vote/vote-session.ts`

**Checkpoint**: User Story 2 should now be fully functional and testable independently.

---

## Phase 5: User Story 3 - Live Results Dashboard (Priority: P2)

**Goal**: Let authorized admins view live standings during `OPEN` and official frozen results after `CLOSED`.

**Independent Test**: Open `/results` as admin while voting is live to confirm live counts and rankings, then close the election and confirm the final official snapshot remains stable on refresh.

### Implementation for User Story 3

- [X] T031 [P] [US3] Implement grouped live results retrieval in `lib/results/live-results.ts` and `app/api/results/route.ts`
- [X] T032 [P] [US3] Implement winner, ranking, and tie calculation helpers in `lib/results/ranking.ts`
- [X] T033 [US3] Implement the read-only results dashboard UI in `app/results/page.tsx`
- [X] T034 [US3] Build role-grouped results cards and tie/winner visuals in `components/results/`
- [X] T035 [US3] Implement live-versus-official result state labeling in `components/results/results-banner.tsx`
- [ ] T036 [US3] Wire periodic refresh or auto-update behavior for live results in `app/results/page.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish quality, consistency, and delivery readiness across the whole feature.

- [X] T037 Harden server-side authorization and error handling across `app/api/` and `app/*/page.tsx`
- [X] T038 Add empty, loading, and failure states for admin, voting, and results screens in `components/shared/`
- [X] T039 Verify local state initialization against the quickstart flow in `lib/election/local-store.ts` and `specs/001-school-election-voting/quickstart.md`
- [X] T040 Review and align implementation notes with the API contract in `specs/001-school-election-voting/contracts/api.md`
- [X] T041 Run a final cleanup pass on shared election utilities in `lib/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on the desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase - no dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational phase - may use shared election and results infrastructure
- **User Story 3 (P2)**: Can start after Foundational phase - depends on the shared results layer and admin access controls

### Within Each User Story

- Build persistence and shared logic before UI wiring
- Implement server-side validation before client-side convenience behavior
- Keep each user story independently testable from its own route

## Parallel Opportunities

- Setup tasks `T002` and `T003` can run in parallel after `T001`
- Foundational tasks `T007` through `T012` can be split across the shared data, validation, and route work
- User Story 1 tasks `T013` through `T022` contain several parallelizable file-isolated tasks
- User Story 2 tasks `T023` through `T030` can be split between API logic and UI components
- User Story 3 tasks `T031` through `T036` can be divided between result computation and dashboard rendering

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate admin management and stop-election flow

### Incremental Delivery

1. Deliver the admin dashboard and election controls first
2. Add anonymous browser-session voting next
3. Add live and final results after the core election loop is proven
4. Finish with hardening, empty states, and contract alignment

## Format Validation

All tasks follow the required checklist format: checkbox, sequential task ID, optional `[P]` marker, optional story label, and an exact file path in the description.
