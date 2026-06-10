# Tasks: Admin Voting Fixes

**Input**: Design documents from `/specs/002-admin-voting-fixes/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included where they directly prove the story behavior described in the spec.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature branch structure and shared documentation context for implementation

- [x] T001 Confirm the feature plan and design docs are present in `specs/002-admin-voting-fixes/` and align the implementation scope with `plan.md`
- [x] T002 [P] Review the current admin and voting route structure in `app/admin/page.tsx`, `app/vote/page.tsx`, and `app/api/roles/route.ts` to map the affected surfaces
- [x] T003 [P] Review the shared election and candidate domain modules in `lib/election/`, `lib/votes/`, and `lib/roles/` to identify the setup and gating touchpoints

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared groundwork required before any user story can be completed

- [x] T004 Define the admin role and candidate management contract expectations in `specs/002-admin-voting-fixes/contracts/api.md` against the existing admin routes
- [x] T005 Define the election-start gating expectations for `/vote` and vote submission in `specs/002-admin-voting-fixes/contracts/api.md`
- [x] T006 Define the role-card layout expectations for five or more candidates in `specs/002-admin-voting-fixes/data-model.md` and `specs/002-admin-voting-fixes/quickstart.md`
- [x] T007 Validate that the current election-state and session rules in `lib/election/status.ts` and `lib/election/session.ts` support the new gating behavior without changing the core lifecycle model

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Restore Admin Setup Control (Priority: P1) 🎯 MVP

**Goal**: Allow authenticated administrators to create and manage roles and candidates again so the ballot can be prepared before voting starts

**Independent Test**: Sign in as an admin, create a role, create a candidate for that role, edit the records, and confirm the admin view reflects the saved setup immediately

### Implementation for User Story 1

- [x] T008 [P] [US1] Restore role creation and editing in `app/admin/page.tsx` so authenticated administrators can add election roles
- [x] T009 [P] [US1] Restore candidate creation and assignment in `app/admin/page.tsx` so authenticated administrators can add candidates to an existing role
- [x] T010 [US1] Wire admin role persistence through the existing role repository in `lib/roles/role-repository.ts`
- [x] T011 [US1] Wire admin candidate persistence through the existing candidate repository in `lib/candidates/candidate-repository.ts`
- [x] T012 [US1] Reinstate setup validation and user-facing error handling for role and candidate creation in `lib/validation/` and the admin UI components under `components/admin/`
- [x] T013 [US1] Ensure the admin page shows freshly created and edited roles or candidates immediately after save in `app/admin/page.tsx`

**Checkpoint**: User Story 1 should now be fully functional and testable independently

---

## Phase 4: User Story 2 - Enforce Vote Start Gating (Priority: P1)

**Goal**: Keep the vote page disabled until an administrator explicitly opens the election

**Independent Test**: Visit `/vote` before the election is started and confirm voting is blocked; start the election and confirm the ballot becomes available

### Implementation for User Story 2

- [x] T014 [P] [US2] Update the vote page gating logic in `app/vote/page.tsx` so unopened elections show a disabled state instead of a live ballot
- [x] T015 [P] [US2] Enforce the not-started gate in vote submission handling in `app/api/votes/route.ts` and `lib/votes/vote-service.ts`
- [x] T016 [US2] Ensure election status checks used by the voter portal stay aligned with the admin open action in `app/api/election/status/route.ts` and `lib/election/election-service.ts`
- [x] T017 [US2] Update the voter-facing state messaging in `components/vote/vote-state-message.tsx` so unopened elections are clearly explained to voters

**Checkpoint**: User Story 2 should now be fully functional and testable independently

---

## Phase 5: User Story 3 - Improve Role Card Capacity (Priority: P2)

**Goal**: Make each role card readable when it contains up to five candidates and still stable when a role contains more than five candidates

**Independent Test**: Configure a role with five active candidates, open `/vote` on desktop and mobile widths, and confirm the candidate cards wrap cleanly without clipping or overlap

### Implementation for User Story 3

- [x] T018 [P] [US3] Rework the candidate card layout in `components/vote/role-card.tsx` so a role can display five candidates cleanly
- [x] T019 [P] [US3] Add responsive wrapping and spacing behavior for candidate groups in `components/vote/vote-flow.tsx`
- [x] T020 [US3] Update ballot rendering rules in `lib/votes/vote-service.ts` so roles with more than five candidates still map into a readable vote flow
- [x] T021 [US3] Adjust the vote page guidance copy in `app/vote/page.tsx` and `components/vote/vote-state-message.tsx` to match the wrapped multi-candidate layout
- [x] T022 [US3] Verify the role-card entity expectations in `specs/002-admin-voting-fixes/data-model.md` and quickstart steps in `specs/002-admin-voting-fixes/quickstart.md` reflect the five-candidate layout target

**Checkpoint**: User Story 3 should now be fully functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup that touches multiple stories

- [X] T023 [P] Verify end-to-end admin setup, vote gating, and role-card wrapping against `specs/002-admin-voting-fixes/quickstart.md`
- [X] T024 [P] Review affected UI states in `components/admin/`, `components/vote/`, and `app/admin/page.tsx` for consistency and copy clarity
- [X] T025 Validate that protected admin flows and public voter flows still follow the project rules documented in `specs/002-admin-voting-fixes/contracts/api.md`
- [X] T026 Confirm that `tasks.md`, `plan.md`, and `spec.md` remain aligned after implementation scoping and mark any follow-up gaps for later planning

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on the user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase - no dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational phase - independent of User Story 1, but may share shared election helpers
- **User Story 3 (P2)**: Can start after Foundational phase - depends on the existing ballot shape but remains independently testable

### Parallel Opportunities

- Setup review tasks `T002` and `T003` can run in parallel
- Foundational tasks `T004`, `T005`, and `T006` can run in parallel after `T001` completes
- User Story 1 implementation tasks `T008` and `T009` can run in parallel, as can `T010` and `T011`
- User Story 2 tasks `T014` and `T015` can run in parallel once the gating strategy is confirmed
- User Story 3 tasks `T018` and `T019` can run in parallel while `T020` and `T021` follow the layout decisions

## Parallel Example: User Story 1

```bash
Task: "Restore role creation and editing in app/admin/page.tsx so authenticated administrators can add election roles"
Task: "Restore candidate creation and assignment in app/admin/page.tsx so authenticated administrators can add candidates to an existing role"
```

## Parallel Example: User Story 2

```bash
Task: "Update the vote page gating logic in app/vote/page.tsx so unopened elections show a disabled state instead of a live ballot"
Task: "Enforce the not-started gate in vote submission handling in app/api/votes/route.ts and lib/votes/vote-service.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate admin setup independently
5. Stop here if the goal is to restore admin configuration first

### Incremental Delivery

1. Restore admin setup controls
2. Enforce vote-start gating
3. Improve candidate layout for multi-candidate roles
4. Run the quickstart checks and polish shared copy

### Parallel Team Strategy

1. One developer restores admin setup controls
2. One developer wires vote-start gating
3. One developer handles the responsive role-card layout
4. The team converges on the quickstart validation and polish pass

## Notes

- [P] tasks can run in parallel when they touch different files and do not depend on unfinished work
- Each user story is structured to be independently completable and testable
- The MVP should prioritize User Story 1 because it unblocks election configuration
