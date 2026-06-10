# Feature Specification: Admin Voting Fixes

**Feature Branch**: `002-admin-voting-fixes`

**Created**: 2026-06-10

**Status**: Draft

**Input**: User description: "Admin is not able to create the candidture and roles. admin should be able to do so. if the admin does not start the voting,the voting should be disabled even if i moe to vote page. the votercards should be precise that it can hold up to 5 candidates for a role with proper wraping to next line functionality and all"

## Clarifications

### Session 2026-06-10

- Q: Should five candidates be a hard maximum per role, or just the standard layout target? → A: Layout target: roles may have more than five candidates, but the ballot should display five cleanly and handle overflow.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Restore Admin Setup Control (Priority: P1)

As an election administrator, I need to create and manage roles and candidates from the admin area so that I can prepare the ballot before voting begins.

**Why this priority**: If the admin cannot create roles or candidates, the election cannot be configured and the rest of the product is blocked.

**Independent Test**: Can be fully tested by signing in as an admin, creating a new role, creating candidates under that role, editing those records, and confirming they remain available in the admin area.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator is on the admin page, **When** they submit a valid new role, **Then** the system saves the role and shows it in the admin role list.
2. **Given** an authenticated administrator is on the admin page, **When** they submit a valid new candidate assigned to an existing role, **Then** the system saves the candidate and shows it in the correct role grouping.
3. **Given** an administrator submits incomplete or invalid role or candidate information, **When** the system validates the request, **Then** it rejects the submission and shows a clear correction message without losing the rest of the admin page state.
4. **Given** an election is already open, **When** an administrator attempts to create or structurally change a role or candidate, **Then** the system applies the existing election-setup restrictions consistently and explains the restriction clearly.

---

### User Story 2 - Enforce Vote Start Gating (Priority: P1)

As a voter, I need the vote page to remain unavailable until the administrator explicitly starts voting so that ballots are not shown or accepted before the election opens.

**Why this priority**: Voting must not appear active before the admin intentionally opens it, or users may think the election has begun when it has not.

**Independent Test**: Can be fully tested by leaving the election unopened, visiting the vote page directly, and confirming that ballot choices and vote submission stay disabled until the admin starts the election.

**Acceptance Scenarios**:

1. **Given** the administrator has not started the election, **When** a voter opens the vote page directly, **Then** the page shows that voting is not started and hides or disables all ballot interaction.
2. **Given** the election is not started, **When** a vote submission is attempted through normal UI interaction or direct request, **Then** the system rejects the submission and records no vote.
3. **Given** the administrator changes the election status to open, **When** a voter refreshes or revisits the vote page, **Then** the guided role-by-role ballot becomes available.

---

### User Story 3 - Improve Role Card Capacity (Priority: P2)

As a voter, I need each role card to display up to five candidates cleanly, with overflow moving to the next line in a readable way, so that I can review and choose candidates without a broken layout.

**Why this priority**: Layout problems on the ballot can confuse voters and make selection unreliable even when election data is correct.

**Independent Test**: Can be fully tested by configuring a role with five active candidates, opening the vote page on common desktop and mobile widths, and confirming that all candidate cards remain readable with orderly wrapping. Roles with more than five candidates should still render without layout breakage, with the visible ballot area staying readable and navigable.

**Acceptance Scenarios**:

1. **Given** a role has up to five active candidates, **When** the voter opens that role card, **Then** all candidate options are visible without overlapping, clipping, or horizontal overflow.
2. **Given** candidate cards do not fit on one row at the current screen width, **When** the layout reflows, **Then** the remaining candidate cards wrap to the next line while keeping labels, actions, and spacing readable.
3. **Given** a role has fewer than five candidates, **When** the role card is displayed, **Then** the layout remains balanced and does not leave broken alignment or oversized empty gaps.
4. **Given** a role has more than five candidates, **When** the voter opens that role card, **Then** the ballot continues to display the candidates in a readable wrapped layout without clipping or overlap.

---

### Edge Cases

- What happens when an administrator tries to create a candidate before any role exists?
- What happens when a role has more than five configured candidates and some are inactive?
- How does the vote page behave if the election status changes from not started to open while a voter already has the page loaded?
- How does the admin page behave if role or candidate creation fails because of duplicate names, missing required fields, or restricted election state?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated administrators to create election roles from the admin page.
- **FR-002**: System MUST allow authenticated administrators to create candidates from the admin page and assign each candidate to exactly one existing role.
- **FR-003**: System MUST show newly created roles and candidates in the admin interface immediately after successful save.
- **FR-004**: System MUST validate required role and candidate fields before saving and provide clear error messages when validation fails.
- **FR-005**: System MUST preserve administrator access to role and candidate management while the election is not started.
- **FR-006**: System MUST keep the vote page reachable before voting starts while hiding or disabling ballot interaction until the administrator explicitly opens the election.
- **FR-007**: System MUST reject all vote submissions while the election status is not started, including direct requests that bypass the visible page controls.
- **FR-008**: System MUST make the ballot available only after the administrator explicitly starts voting.
- **FR-009**: System MUST present each role's candidate choices in a layout that supports up to five active candidates without clipping, overlap, or horizontal spill.
- **FR-010**: System MUST wrap candidate cards to additional rows when needed while maintaining readable spacing and clear association between each card and its vote action.
- **FR-011**: System MUST keep the candidate card layout usable across common school desktop, tablet, and mobile screen widths.
- **FR-012**: System MUST allow roles to contain more than five candidates while keeping the ballot readable, with the first visible grouping still rendering cleanly and additional candidates handled without layout breakage.
- **FR-013**: System MUST continue to enforce existing election-state restrictions on structural setup changes after voting has started, with user-facing guidance when an action is blocked.

### Key Entities *(include if feature involves data)*

- **Election Role**: A ballot position defined by the administrator, including its name, ordering, activation state, and the set of candidates eligible for that role.
- **Candidate**: A student option on the ballot with identifying details and a single assigned role.
- **Election Status**: The current lifecycle state that controls whether the admin may still set up the ballot and whether voters may interact with the vote page.
- **Role Card**: The voter-facing presentation unit for a single role, including up to five candidate choices and their selection controls.
- **Overflow Candidate Set**: Additional candidates beyond the first visible grouping for a role, which must remain readable and usable rather than causing layout failure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can successfully create a new role and a new candidate for that role in under 2 minutes during acceptance testing.
- **SC-002**: 100% of attempts to access the vote page before the election is opened show a non-voting state with no working ballot submission path.
- **SC-003**: In acceptance testing, 100% of role cards with five or more candidates remain fully readable with no clipped content or horizontal scrolling on agreed desktop and mobile viewport sizes.
- **SC-004**: At least 95% of test users can identify and select a candidate from a five-candidate role card on the first attempt without layout-related confusion.

## Assumptions

- The existing admin authentication flow remains the access gate for role and candidate management.
- The existing election lifecycle remains the source of truth for whether voting is available.
- The ballot is expected to support up to five visible active candidates per role in the standard voting layout for this feature, while remaining readable if a role has additional candidates.
- Broader redesign of the entire admin dashboard is out of scope; this feature focuses on restoring the blocked setup actions and improving ballot presentation.
