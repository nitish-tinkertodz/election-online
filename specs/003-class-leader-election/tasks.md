# Tasks: Class Leader Election Scoping

**Input**: Design documents from `/specs/003-class-leader-election/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature spec, so this task list focuses on implementation tasks and validation steps rather than formal test creation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the data model and shared eligibility foundations used by all stories

- [x] T001 Update the database schema to support class and division scoping for elections, students, and scope validation in `db/migrations/0002_class_leader_scoping.sql`
- [x] T002 Update seed data to include at least one class, one division, and one student mapping for manual validation in `db/seed/seed.ts`
- [x] T003 [P] Add shared class and division type definitions in `lib/classes/types.ts`
- [x] T004 [P] Add shared class and division repository helpers in `lib/classes/class-repository.ts` and `lib/divisions/division-repository.ts`
- [x] T005 [P] Extend shared eligibility helpers to evaluate class and division membership in `lib/election/eligibility.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core election scope plumbing that must exist before any story-specific work can be completed

- [x] T006 Add database access helpers for class-scoped election queries in `lib/election/election-service.ts`
- [x] T007 Add validation rules for class leader election scope in `lib/validation/index.ts`
- [x] T008 Update election state and ballot readiness logic to preserve class-scoped contests in `lib/election/status.ts` and `lib/election/ballot-readiness.ts`
- [x] T009 Add admin authorization checks for class-scoped election management in `lib/auth/admin.ts`

**Checkpoint**: Class-scoped election data and eligibility foundations are ready for user story work

---

## Phase 3: User Story 1 - Create Class-Scoped Elections (Priority: P1) 🎯 MVP

**Goal**: Allow administrators to create a class leader election for a specific class and, when needed, a specific division

**Independent Test**: Create a new class leader election, assign a class and optional division, and confirm the election is saved as a distinct contest with correct scope fields

### Implementation for User Story 1

- [x] T010 [US1] Add class leader election creation and update operations in `lib/election/election-service.ts`
- [x] T011 [US1] Add API endpoints for class-scoped election management in `app/api/election/route.ts`
- [x] T012 [US1] Extend admin role and candidate setup so election scope is visible during setup in `components/admin/admin-dashboard.tsx`
- [x] T013 [P] [US1] Add class and division selectors to the admin election setup form in `components/admin/admin-dashboard.tsx`
- [x] T014 [US1] Persist class and division scope metadata when creating or editing elections in `app/api/election/open/route.ts`, `app/api/election/close/route.ts`, and `app/api/election/reset/route.ts`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Restrict Voting to Matching Students (Priority: P1)

**Goal**: Ensure voters only see and vote in the class leader election that matches their own class membership

**Independent Test**: Access the vote page as a student assigned to one class and confirm that only the matching election is visible and vote submission is rejected for any non-matching election

### Implementation for User Story 2

- [x] T015 [US2] Add voter eligibility filtering by class and division in `lib/election/election-service.ts`
- [x] T016 [US2] Add vote submission checks that reject ineligible students in `lib/votes/vote-service.ts`
- [x] T017 [US2] Filter the vote page to show only class-matching elections in `components/vote/vote-flow.tsx`
- [x] T018 [P] [US2] Update ballot state messaging for ineligible students in `components/vote/vote-state-message.tsx`
- [x] T019 [US2] Ensure the vote page never exposes candidate options for inaccessible elections in `app/vote/page.tsx`

**Checkpoint**: User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Manage Divisions Within a Class (Priority: P2)

**Goal**: Support class leader elections that target either the full class or a specific division within that class

**Independent Test**: Configure one class with multiple divisions and confirm that a division-scoped election is visible only to students in that division while class-wide elections remain visible to all students in the class

### Implementation for User Story 3

- [x] T020 [US3] Add division-aware eligibility evaluation helpers in `lib/divisions/division-repository.ts`
- [x] T021 [US3] Update admin setup and edit flows to allow choosing class-wide or division-specific scope in `components/admin/candidate-form.tsx`
- [x] T022 [US3] Update the admin dashboard to explain class-wide vs division-specific election scope in `components/admin/admin-dashboard.tsx`
- [x] T023 [US3] Ensure duplicate active elections for the same class and division are blocked in `app/api/election/open/route.ts`
- [x] T024 [P] [US3] Update results grouping so class-wide and division-specific contests remain separated in `lib/results/live-results.ts` and `lib/results/finalize-election.ts`

**Checkpoint**: User Story 3 should be fully functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency work across the feature

- [x] T025 [P] Update the vote card presentation to reflect class-scoped contests clearly in `components/vote/role-card.tsx`
- [x] T026 [P] Review and refine admin and voter copy for class leader elections in `components/admin/admin-dashboard.tsx`, `components/vote/vote-state-message.tsx`, and `app/vote/page.tsx`
- [x] T027 Verify the quickstart validation flow against the implemented behavior in `specs/003-class-leader-election/quickstart.md`
- [x] T028 Confirm the feature documentation stays aligned with implementation details in `specs/003-class-leader-election/data-model.md` and `specs/003-class-leader-election/contracts/class-leader-election-api.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on completion of the desired user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; no dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational; depends on shared election and eligibility foundations, but should remain independently testable
- **User Story 3 (P2)**: Can start after Foundational; builds on class-scoped election support from User Story 1 but remains independently testable

### Within Each User Story

- Foundation tasks must complete before story tasks begin
- Admin scope creation should land before voter filtering so the ballot can consume the scope data
- Class-wide support should be working before division-specific narrowing is finalized
- Story complete before moving to the next priority

### Parallel Opportunities

- `T003`, `T004`, and `T005` can run in parallel because they touch different files
- `T013` and `T018` can run in parallel with other work in their respective stories
- `T024` can run in parallel with the class-specific admin refinements once the results grouping path is available
- `T025` and `T026` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
Task: "Add class and division selectors to the admin election setup form in components/admin/admin-dashboard.tsx"
Task: "Persist class and division scope metadata when creating or editing elections in app/api/election/open/route.ts, app/api/election/close/route.ts, and app/api/election/reset/route.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "Add vote submission checks that reject ineligible students in lib/votes/vote-service.ts"
Task: "Update ballot state messaging for ineligible students in components/vote/vote-state-message.tsx"
```

---

## Parallel Example: User Story 3

```bash
Task: "Update results grouping so class-wide and division-specific contests remain separated in lib/results/live-results.ts and lib/results/finalize-election.ts"
Task: "Update the admin dashboard to explain class-wide vs division-specific election scope in components/admin/admin-dashboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate that class-scoped elections can be created and stored correctly
5. Stop and confirm the scope model before moving to voter restrictions

### Incremental Delivery

1. Deliver the election scope model and admin creation flow first
2. Add voter eligibility filtering and access denial next
3. Finish with division-specific rules and result separation
4. Polish copy, UI clarity, and documentation last
