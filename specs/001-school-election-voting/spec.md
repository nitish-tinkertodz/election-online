# Feature Specification: School Election Voting System

**Feature Branch**: `main`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Create a complete Speckit specification for a browser-based school election voting system with an admin dashboard, voting portal, live results dashboard, candidate management, school branding, candidate photo uploads, clear route and API requirements, data constraints, validation, security, error handling, responsive web UI requirements, Cloudflare deployment expectations, and GitHub-ready delivery. Update the candidate-management requirements so administrators can manage candidate name, class details, election role or position, candidate photo with visible placeholder behavior, optional active or inactive status, add/edit-delete flows, preview candidate cards before saving, and required candidate validation. Constrain the application to exactly three main pages: an admin-only `/admin` page, a voter-facing `/vote` page, and an admin-only `/results` page with server-side protected-page checks and no results visibility for voters. Replace any fixed-position assumptions with admin-defined election roles, support role management from the admin page, require candidates to belong to exactly one admin-defined role, support multi-role voting in a guided role-by-role card flow, add explicit election lifecycle control with `NOT_STARTED`, `OPEN`, and `CLOSED` states, restrict the voting interface to `OPEN` only, require the stop-election flow to atomically generate and preserve an official final results snapshot, save each role vote immediately after the voter confirms it, and simplify the current version by removing admission-number entry, voter identity tracking, voter-table validation, and cross-system duplicate prevention."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Election Administration (Priority: P1)

As a school election administrator, I need to define election roles, manage candidates within those roles, control whether voting is open or closed, and monitor results so that the school can run a fair and organized online election without relying on hardcoded role types.

**Why this priority**: Without administration controls, the election cannot be prepared, started, stopped, or overseen, which blocks every other workflow.

**Independent Test**: Can be fully tested by signing in as an administrator, creating roles, ordering and activating those roles, creating candidates assigned to those roles, uploading candidate photos, setting school branding, opening the election, closing it, and confirming that each change is reflected correctly throughout the application.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator is on the administration dashboard, **When** they add a role with a valid name, status, and display order, **Then** the role appears in the configured order and can be used for candidate assignment.
2. **Given** an authenticated administrator is on the administration dashboard, **When** they add a candidate with a valid name, role, class, and optional photo, **Then** the candidate appears in the correct role group and is available for voting when the election opens.
3. **Given** an authenticated administrator is viewing a candidate record, **When** they edit or delete that candidate, **Then** the candidate information is updated or removed and the change is reflected in both the voting portal and results view.
4. **Given** an authenticated administrator is viewing a role that has no linked votes, **When** they edit, deactivate, reorder, or delete that role, **Then** the role state updates successfully and the ballot structure changes accordingly.
5. **Given** the election is currently not started, **When** an authenticated administrator opens the election, **Then** eligible students can begin voting, the system records the election as open, and election structure changes are locked or restricted.
6. **Given** the election is currently open, **When** an authenticated administrator confirms that the election should stop, **Then** no further votes are accepted, the system closes the election atomically, and an official final results snapshot is recorded.
7. **Given** school branding details exist, **When** an authenticated administrator updates the school name or logo, **Then** the public-facing pages display the updated branding consistently.
8. **Given** an authenticated administrator is creating or editing a candidate, **When** they have entered candidate details before saving, **Then** the system shows a preview of the candidate card including the uploaded photo or default placeholder.
9. **Given** a candidate is marked inactive, **When** a student opens the ballot, **Then** that candidate is excluded from new ballot choices while remaining manageable from the administration dashboard.
10. **Given** an unauthorized user attempts to open the administration page or results page, **When** access is checked, **Then** the system denies access server-side and redirects the user to an admin login experience or shows an unauthorized access message.

---

### User Story 2 - Cast a Valid Vote (Priority: P1)

As a student voter, I need to move through one role card at a time and save each confirmed role vote immediately so that I can complete the election safely without losing progress.

**Why this priority**: The election only delivers value if eligible students can cast valid ballots quickly and safely, with duplicate voting prevented.

**Independent Test**: Can be fully tested by opening the voter page during an open election, loading the current active roles dynamically, presenting only the next pending role card, confirming one candidate for that role, saving that role vote immediately, advancing to the next pending role, and verifying that the same browser session cannot repeat a completed role.

**Acceptance Scenarios**:

1. **Given** the election is open and a voter opens the voting page, **When** the system loads the active roles and the current session's completed-role state, **Then** it shows only the next pending role card and hides or disables completed roles.
2. **Given** a student selects one candidate on the current role card, **When** the student confirms the vote, **Then** the system records that role vote immediately, marks the role as completed for that voter, and advances to the next pending role.
3. **Given** a student has already completed a specific role in the current browser session, **When** the student attempts to vote again for that same role, **Then** the system blocks the repeat vote in that session and keeps that role marked as completed.
4. **Given** the election has not started yet, **When** a student opens the voting page, **Then** the system shows that voting has not started, hides the voting interface, and prevents vote submission.
5. **Given** the election is closed, **When** a student attempts to access or submit the ballot, **Then** the system prevents voting, hides the voting interface, and explains that voting has been closed.
6. **Given** a voter has completed all required active roles in the current voting journey, **When** the final role vote is saved, **Then** the system shows a final thank-you message.

---

### User Story 3 - View Election Results (Priority: P2)

As an authorized administrator, I need to view live or near real-time results by role so that I can understand current standings during the election and final winners after it closes.

**Why this priority**: Results visibility is valuable, but it depends on administrators being able to configure the election and students being able to cast votes successfully first.

**Independent Test**: Can be fully tested by viewing results during an active election to confirm vote totals update by role, then closing the election and confirming that winners or ties are clearly identified for each configured role.

**Acceptance Scenarios**:

1. **Given** votes have been submitted, **When** an authorized administrator opens the results dashboard, **Then** the system displays candidate rankings grouped by role with current vote totals.
2. **Given** the election is still open, **When** new votes are recorded, **Then** the results dashboard refreshes often enough to reflect near real-time standings and clearly marks the results as live and unofficial.
3. **Given** the election is closed, **When** an authorized administrator views the results dashboard, **Then** the system shows the recorded final results snapshot as the official outcome for each role and clearly shows ties when they exist.

---

### Edge Cases

- An administrator opens an election before any active roles have candidates assigned.
- An administrator tries to start the election while required role or candidate setup is incomplete.
- A student reaches the ballot while the election is open, but the election closes before ballot submission.
- Two role vote submissions for the same browser session arrive almost simultaneously.
- The election stop action succeeds in changing status but fails while generating final results.
- A candidate photo upload succeeds for storage but the candidate update fails, or the reverse.
- An administrator saves a candidate without uploading a photo and expects a visible placeholder in the form preview and candidate card.
- An administrator marks a candidate inactive after the candidate record already exists.
- An administrator attempts to delete a role that already has linked votes.
- An administrator deactivates a role after candidates already exist for that role.
- A voter or unauthenticated visitor attempts to open `/admin` or `/results` directly.
- An administrator session expires while the administrator is viewing protected setup or results pages.
- A role has no candidates, only one candidate, or multiple candidates with identical names.
- A voter leaves one active required role unselected before confirmation.
- A voter submits mismatched `candidate_id` and `role_id` pairs.
- A voter refreshes the browser after completing one or more role cards but before finishing all roles.
- A voter closes the browser after completing some roles and returns later while the election is still open.
- The same student opens the voter page on multiple systems and the system cannot distinguish that identity in the current version.
- Results are requested before any votes have been cast.
- A role ends with a tie for the highest vote total.
- School branding assets are missing, replaced, or temporarily unavailable.

## Requirements *(mandatory)*

### Overview

The system must provide a browser-based election platform for schools that supports election setup, secure multi-role voting, and transparent results viewing through exactly three main pages: an administration page, a voter page, and a results page.

## Clarifications

### Session 2026-06-09

- Q: What should the system consider the "same browser session" for duplicate-prevention and progress tracking? → A: Persist completed-role state across refresh and tab changes until the browser is closed.

### Goals

- Allow school staff to define and manage election roles without technical intervention.
- Allow school staff to prepare and manage an election without relying on hardcoded role names.
- Allow voters to progress through a simple and fast browser workflow across all active roles in the election.
- Provide accurate live results by role during the election and preserved final outcomes after closure.
- Support school-specific branding so the experience feels official and recognizable.
- Produce a specification detailed enough to drive implementation planning and delivery.

### Non-Goals

- Native mobile applications or app-store distribution.
- Multi-school tenancy within a single election instance.
- Advanced voter registration workflows beyond using a prepared voter list.
- Hardcoded role catalogs baked into the product.
- Admission-number-based voter validation, voter login, voter import, or voter registration in the current release.
- Cross-system duplicate-vote prevention tied to student identity in the current release.
- Ranked-choice, weighted, or proxy voting models.
- Automated tie-breaking rules beyond clearly reporting the tie.
- Publishing or exposing private student details or future voter-identity records beyond what the school explicitly authorizes.

### User Roles

- **Administrator**: School staff member who manages candidates, election status, branding, and privileged views.
- **Student Voter**: School-controlled participant who progresses through role cards until all required role votes are completed.

### Access Control

- Admin access to `/admin` and `/results` uses a temporary shared password gate in the current version.
- The shared admin password is `12345678` for now.
- No per-user admin accounts or role-based admin identity records are required in the current version.

### Functional Requirements

- **FR-001**: System MUST provide a protected administration experience for authorized administrators only.
- **FR-001A**: System MUST gate admin access through a temporary shared password prompt using `12345678` in the current version.
- **FR-001B**: System MUST provide exactly three main application pages: `/admin`, `/vote`, and `/results`.
- **FR-002**: System MUST allow administrators to create, edit, and delete candidate records with the fields `id`, `name`, `class_name`, `role_id`, `photo_url`, and `status`.
- **FR-002A**: System MUST allow administrators to create, edit, deactivate, reorder, and delete election roles from the administration page.
- **FR-002B**: System MUST prevent deletion of a role when votes are already linked to that role.
- **FR-002C**: System MUST store each role with `id`, `name`, `description`, `display_order`, `status`, `created_at`, and `updated_at`.
- **FR-003**: System MUST allow administrators to assign each candidate to exactly one valid admin-defined role.
- **FR-004**: System MUST allow administrators to upload, replace, and remove candidate photos.
- **FR-004A**: System MUST display a visible placeholder in candidate forms and candidate cards whenever no candidate photo is available.
- **FR-005**: System MUST allow administrators to configure and update school branding, including school name and logo.
- **FR-006**: System MUST allow administrators to start and stop the election intentionally through explicit controls.
- **FR-006A**: System MUST show the current election status to administrators at all times.
- **FR-006B**: System MUST require an explicit confirmation step before stopping the election.
- **FR-007**: System MUST store the election status as one of `NOT_STARTED`, `OPEN`, or `CLOSED` and apply it consistently across the system.
- **FR-007A**: System MUST support candidate status values of `Active` and `Inactive` and apply that status consistently in administrative and voter-facing experiences.
- **FR-007B**: System MUST treat role names and role availability as administrator-managed data rather than fixed application constants.
- **FR-008**: System MUST provide a voting portal focused on role-card voting without requiring admission-number entry, voter login, or voter registration in the current version.
- **FR-009**: System MUST allow the school to manage voter access outside the application in the current version.
- **FR-010**: System MUST show the voting interface only while the election status is `OPEN`.
- **FR-010A**: System MUST keep the `/vote` route reachable in the browser even when the election is `NOT_STARTED` or `CLOSED`, while hiding the voting form and candidate-selection interface in those states.
- **FR-010B**: System MUST show a “Voting has not started yet.” message when the election status is `NOT_STARTED`.
- **FR-010C**: System MUST show a “Voting has been closed.” message when the election status is `CLOSED`.
- **FR-011**: System MUST display candidates grouped by active admin-defined roles using a role-by-role card flow.
- **FR-012**: System MUST allow a student to select at most one candidate on the current role card.
- **FR-013**: System MUST allow a student to submit one confirmed vote per active role.
- **FR-014**: System MUST prevent a fully completed browser-session voting journey from recording additional role votes after all required active roles have been completed in that session.
- **FR-014A**: System MUST prevent a voter from casting more than one vote for the same role within the same browser session, with completed-role state persisting across page refreshes and tab changes until the browser is closed.
- **FR-015**: System MUST clearly document that duplicate prevention across separate systems is not available in the current version because voter identity is not tracked.
- **FR-016**: System MUST record each accepted vote with the selected candidate, the role, and the time of submission.
- **FR-017**: System MUST mark the current browser-session voting journey as fully completed only after votes have been recorded for all required active roles in that session.
- **FR-018**: System MUST process each role vote submission atomically so duplicate or partial recording for that role does not occur during concurrent requests or interruptions.
- **FR-019**: System MUST show clear success, validation, and failure messages throughout the voting workflow.
- **FR-019A**: System MUST fetch the current election status before allowing final ballot submission and re-check election status again during ballot processing.
- **FR-019B**: System MUST re-check whether the current session has already completed the current role before accepting another vote for that role in that same session.
- **FR-019C**: System MUST reject vote submissions when the election status is `NOT_STARTED` or `CLOSED`.
- **FR-020**: System MUST provide a results dashboard that displays vote counts and candidate rankings grouped by role.
- **FR-020A**: System MUST allow only authorized administrators to access the results dashboard.
- **FR-021**: System MUST keep the results dashboard read-only even for authorized administrators.
- **FR-022**: System MUST identify the leading candidate for each role while the election is open and the winner after the election closes.
- **FR-023**: System MUST clearly display tied outcomes when two or more candidates share the highest vote total for a role.
- **FR-024**: System MUST make live or near real-time results available without requiring manual vote recount actions from administrators while the election is `OPEN`.
- **FR-024A**: System MUST clearly mark results shown during `OPEN` as live and unofficial.
- **FR-024B**: System MUST show recorded final results as official after the election is `CLOSED`.
- **FR-025**: System MUST provide the administration dashboard at `/admin`, the voting portal at `/vote`, and the results dashboard at `/results`.
- **FR-026**: System MUST expose service interfaces for candidate management, photo handling, election status changes, ballot submission, results retrieval, and branding retrieval and update.
- **FR-027**: System MUST define field-level validation for candidate data, branding data, ballot submission, and uploaded image files.
- **FR-028**: System MUST ensure that client-side validation improves usability but never replaces server-side enforcement.
- **FR-029**: System MUST ensure that candidate photo uploads accept only approved image formats and size limits defined by school policy or system defaults.
- **FR-030**: System MUST retain an auditable record of key election-management actions such as opening and closing the election, candidate changes, and branding updates.
- **FR-031**: System MUST provide graceful empty states when no candidates, no votes, or no branding assets are available.
- **FR-032**: System MUST prevent student voters and other unauthorized users from accessing administrator-only data, actions, or results.
- **FR-033**: System MUST support repository organization and deployment documentation sufficient for GitHub-based delivery and Cloudflare deployment planning.
- **FR-034**: System MUST provide a candidate form that supports both new candidate creation and editing of existing candidate details from the administration dashboard.
- **FR-035**: System MUST let administrators preview a candidate card before saving changes.
- **FR-036**: System MUST validate candidate name, class details, and contesting role before saving candidate changes.
- **FR-037**: System MUST treat candidate photo as optional while still presenting a visible placeholder when no photo is available.
- **FR-038**: System MUST validate uploaded candidate photos for approved file type and maximum size before accepting them.
- **FR-039**: System MUST exclude inactive candidates from new ballot selections by default.
- **FR-040**: System MUST require server-side authorization checks for all protected page requests to `/admin` and `/results`.
- **FR-041**: System MUST respond to unauthorized requests for `/admin` or `/results` by redirecting to the shared admin password prompt or presenting an unauthorized access message.
- **FR-042**: System MUST keep `/vote` publicly reachable without admission-number entry, while still limiting the voting interface to the `OPEN` election state.
- **FR-043**: System MUST allow administrators to view basic election setup details from the administration page.
- **FR-044**: System MUST require every saved candidate to reference a valid active or administratively selectable role.
- **FR-045**: System MUST dynamically load roles for the voting experience from stored election data rather than assuming a fixed set of ballot sections.
- **FR-046**: System MUST present only the next pending role card to the voter or otherwise clearly guide the voter through one role at a time.
- **FR-047**: System MUST save each completed role vote immediately after confirmation rather than waiting for all roles to be finished.
- **FR-048**: System MUST prevent duplicate role voting within the same browser session and clearly disclose that cross-system duplicate prevention is not available in the current version.
- **FR-049**: System MUST restrict or lock role and candidate structure changes once the election status becomes `OPEN`.
- **FR-050**: System MUST generate a final combined results record when the election is stopped.
- **FR-051**: System MUST preserve the final combined results record separately from live vote aggregation so the official result does not change after closure.
- **FR-052**: System MUST store the final combined results with election status, closure timestamp, total votes cast, role-wise results, candidate-wise vote counts, rankings, winners, tie indicators, and a full results snapshot.
- **FR-053**: System MUST ensure the stop-election action is atomic so the election is not partially closed without a saved final results snapshot.
- **FR-054**: System MUST not recalculate or overwrite recorded final results after closure unless an explicit administrator-approved reset or recount capability is added in a future revision.
- **FR-055**: System MUST determine completed roles for the current voter journey from browser-session state for UI flow control, while the recorded votes remain the source of truth for counted results.
- **FR-055A**: System MUST treat a browser as the same voting session across refreshes and tab changes until the browser is closed, and reset completed-role state when a new browser session begins.
- **FR-056**: System MUST remove, lock, or mark completed role cards as completed after a successful role vote so the voter cannot recast that role.
- **FR-057**: System MUST show a final completion message after all required active roles have been completed.

### Non-Functional Requirements

- **NFR-001**: The experience MUST be a responsive web application optimized for desktop browsers, laptops, tablets, and mobile browsers.
- **NFR-002**: The administration dashboard MUST prioritize desktop and laptop usability while remaining functional on smaller screens.
- **NFR-003**: The voting portal MUST be simple enough for students to complete a ballot with minimal assistance.
- **NFR-003A**: The role-by-role voting flow MUST make the next required action obvious so students can progress one role at a time without confusion.
- **NFR-004**: Primary ballot actions and confirmation states MUST be keyboard accessible.
- **NFR-005**: Results updates MUST appear within a short enough interval that administrators perceive the dashboard as live during normal election activity.
- **NFR-006**: The system MUST preserve vote integrity even when multiple users act at the same time.
- **NFR-007**: Sensitive validation responses MUST avoid revealing unnecessary personal information.
- **NFR-008**: Error messages MUST be understandable to non-technical users and distinguish between validation issues and temporary system failures.
- **NFR-009**: The interface MUST maintain clear branding and visual consistency across the administration, voting, and results experiences.
- **NFR-010**: The solution MUST be organized so it can be deployed and maintained through a GitHub-hosted codebase and Cloudflare-hosted web delivery platform.
- **NFR-011**: Protected-page authorization decisions for `/admin` and `/results` MUST be enforced before protected page content is revealed.
- **NFR-012**: Election lifecycle state changes and final result recording MUST leave the system in a consistent state even if errors occur during stop-election processing.

### Application Routes

The application has exactly three main pages: `/admin`, `/vote`, and `/results`.

#### `/admin`

- Supports role creation, editing, deletion, activation, deactivation, display-order management, candidate creation, candidate editing, candidate deletion, role assignment, photo management, election status controls, results monitoring, and branding configuration.
- Must require administrator authorization before any page data or actions are available.
- Must deny unauthorized access server-side and redirect the user to the shared password prompt or show an unauthorized access message.
- Must require the temporary shared admin password `12345678` before showing protected dashboard content.
- Must present role data, candidate data, and election controls in a professional dashboard layout with clear status visibility.
- Must allow administrators to view all candidates grouped by role.
- Must provide role-management controls for name, description, status, and display order.
- Must provide a candidate form with fields for candidate name, class details, election role, optional candidate photo, and candidate status.
- Must show a visible photo placeholder in the candidate form before upload and whenever no photo is attached.
- Must allow administrators to preview the candidate card before saving changes.
- Must let administrators review basic election setup details alongside management controls.
- Must provide visible start and stop controls together with current election status.
- Must require confirmation before stopping the election to prevent accidental closure.
- Must restrict or lock election-structure changes such as role and candidate setup while the election is `OPEN`.

#### `/vote`

- Supports role-card ballot display, candidate selection by role, per-role vote submission, and confirmation messaging when voting is open.
- Must show “Voting has not started yet.” and hide the voting interface when the election is `NOT_STARTED`.
- Must show “Voting has been closed.” and hide the voting interface when the election is `CLOSED`.
- Must be the only main page accessible to student voters.
- Must load the active role list dynamically from stored election data.
- Must determine which roles are already completed in the current browser session and present only the next pending role card in configured display order.
- Must show each role as a voting card containing role name, optional role description, candidate list, candidate photo or placeholder, candidate name, class details, selection control, and confirm-vote action.
- Must save one role vote at a time immediately after confirmation.
- Must not allow vote submission unless the election status is `OPEN`.
- Must remove, disable, or clearly mark completed role cards after a successful role vote.
- Must preserve completed-role progress across refreshes and tab changes until the browser is closed.
- Must show a final completion screen after all required active roles are completed.
- Must minimize distractions and present a student-friendly voting flow.

#### `/results`

- Supports read-only visibility of live vote counts during `OPEN` and official final outcomes after `CLOSED`.
- Must require administrator authorization before any page data is available.
- Must deny unauthorized access server-side and redirect the user to the shared password prompt or show an unauthorized access message.
- Must require the temporary shared admin password `12345678` before showing protected results content.
- Must group information by election role and visually distinguish leaders, winners, and ties.
- Must not be visible to student voters.
- Must clearly distinguish live unofficial results from official final recorded results.

### API Specification

#### Role Management Interface

| Action | Method | Route | Authorized User | Purpose |
|--------|--------|-------|-----------------|---------|
| List roles | `GET` | `/api/roles` | Administrator | Retrieve all configured election roles in display order |
| Create role | `POST` | `/api/roles` | Administrator | Add a new election role |
| Get role | `GET` | `/api/roles/{roleId}` | Administrator | Retrieve a single role record |
| Update role | `PUT` | `/api/roles/{roleId}` | Administrator | Update role details, status, or display order |
| Delete role | `DELETE` | `/api/roles/{roleId}` | Administrator | Remove a role only when no votes are linked |

- Request body fields for create and update: `name`, `description`, `display_order`, and `status`.
- Response body fields: role record, validation feedback on failure, and confirmation metadata on success.
- Validation rules: required role name, allowed status values only, unique display order within the election context, and deletion blocked when linked votes exist.
- Error responses: unauthorized access, missing role, invalid payload, deletion blocked due to linked votes, and temporary service failure.
- Database operations: create, read, update, reorder, deactivate, and delete role records while preserving vote integrity.

#### Candidate Management Interface

| Action | Method | Route | Authorized User | Purpose |
|--------|--------|-------|-----------------|---------|
| List candidates | `GET` | `/api/candidates` | Administrator | Retrieve all candidates grouped or filterable by role |
| Create candidate | `POST` | `/api/candidates` | Administrator | Add a new candidate |
| Get candidate | `GET` | `/api/candidates/{candidateId}` | Administrator | Retrieve a single candidate record |
| Update candidate | `PUT` | `/api/candidates/{candidateId}` | Administrator | Update candidate details |
| Delete candidate | `DELETE` | `/api/candidates/{candidateId}` | Administrator | Remove a candidate |

- Request body fields for create and update: `name`, `class_name`, `role_id`, `status`, and `photo_url` when applicable.
- Response body fields: candidate record, validation feedback on failure, placeholder state when no photo reference exists, and confirmation metadata on success.
- Validation rules: required name, required role assignment, required class name, allowed status values only, no empty values, valid photo reference when present, and `role_id` must reference an administrator-defined role.
- Error responses: unauthorized access, missing candidate, invalid payload, conflicting candidate state, and temporary service failure.
- Database operations: create, read, update, and delete candidate records while preserving referential integrity for existing votes and role assignments.

#### Candidate Photo Interface

| Action | Method | Route | Authorized User | Purpose |
|--------|--------|-------|-----------------|---------|
| Upload photo | `POST` | `/api/candidates/{candidateId}/photo` | Administrator | Store a candidate image and attach it to the candidate record |
| Remove photo | `DELETE` | `/api/candidates/{candidateId}/photo` | Administrator | Remove the candidate photo association |

- Request body: image file payload for upload; no body required for removal.
- Response body: stored photo reference, associated candidate identifier, and any validation feedback.
- Validation rules: approved image type only, file size within allowed limit, target candidate must exist.
- Error responses: unauthorized access, invalid image type, file too large, missing candidate, upload failure, and temporary storage failure.
- Database operations: update candidate photo reference only after storage succeeds.

#### Election Status Interface

| Action | Method | Route | Authorized User | Purpose |
|--------|--------|-------|-----------------|---------|
| Start election | `POST` | `/api/election/open` | Administrator | Change election status to `OPEN` |
| Stop election | `POST` | `/api/election/close` | Administrator | Change election status to `CLOSED` and record final results |
| Get election status | `GET` | `/api/election/status` | Administrator or public client | Retrieve current election status |

- Request body: optional confirmation metadata for status changes; stop requests must include confirmation intent; none required for status fetch.
- Response body: current election status, last change timestamp, outcome message, and final result summary when the stop operation succeeds.
- Validation rules: only authorized administrators may change status; start is valid only from `NOT_STARTED`; stop is valid only from `OPEN`; repeated requests to set the current status must be handled safely; and stop processing must fail as a whole if final result generation cannot be completed.
- Error responses: unauthorized access, invalid state transition, missing settings record, confirmation required, final result generation failure, and temporary service failure.
- Database operations: read or update the election status setting, record status-change audit information, and create the final results snapshot as part of stop-election processing.

#### Vote Submission Interface

| Action | Method | Route | Authorized User | Purpose |
|--------|--------|-------|-----------------|---------|
| Submit ballot | `POST` | `/api/votes` | Validated voter | Record a single role vote |

- Request body: `role_id` and `candidate_id`.
- Response body: success confirmation, completed role identifier, and completion-state feedback for the current session.
- Validation rules: election must be `OPEN`; role must exist and be active; candidate must exist and be active; candidate must belong to the submitted role; vote submission must be allowed only while voting is active; and the role vote must succeed or fail atomically.
- Error responses: invalid payload, election not started, election closed, invalid role, inactive role, invalid candidate, inactive candidate, candidate-role mismatch, vote save failure, and temporary service failure.
- Database operations: verify election state, verify role and candidate state, record the single role vote, and return session-appropriate completion information for the UI.

#### Results Interface

| Action | Method | Route | Authorized User | Purpose |
|--------|--------|-------|-----------------|---------|
| Fetch results | `GET` | `/api/results` | Administrator | Retrieve grouped standings and final outcomes |

- Request body: none.
- Response body: roles, candidates, vote totals, rankings, tie indicators, election status, winner data when available, and an indication of whether the response is live or official final.
- Validation rules: response must be read-only, must not expose voter identities, and must return the preserved final snapshot after the election is `CLOSED`.
- Error responses: results unavailable, authorization denied when results are restricted, and temporary service failure.
- Database operations: aggregate live vote totals by role and candidate during `OPEN`, and retrieve the preserved final results snapshot after `CLOSED`.

#### Branding Interface

| Action | Method | Route | Authorized User | Purpose |
|--------|--------|-------|-----------------|---------|
| Get branding | `GET` | `/api/branding` | Public client or administrator | Retrieve school name, logo, and display settings |
| Update branding | `PUT` | `/api/branding` | Administrator | Update school branding values |

- Request body for update: school display name, logo reference, and any approved branding settings.
- Response body: persisted branding values and confirmation message.
- Validation rules: required school name, valid logo reference when present, safe value lengths and formats.
- Error responses: unauthorized access, invalid payload, missing settings storage, and temporary service failure.
- Database operations: read and update branding-related settings entries.

### Database Design

#### Key Entities *(include if feature involves data)*

- **Role**: Represents an administrator-defined election role with a name, description, display order, status, and lifecycle timestamps.
- **Candidate**: Represents a student standing for election, with an identifier, display name, class name, linked role, optional photo reference, active or inactive status, and lifecycle timestamps.
- **Vote**: Represents one recorded ballot choice linking a voter to a candidate for a single role at a specific time.
- **Election Result Snapshot**: Represents the official combined results record created when an election is closed, including summary totals, role-wise standings, candidate rankings, winners, tie indicators, and the final frozen snapshot payload.
- **Setting**: Represents configurable election values such as election status, school name, school logo, and other election-level display settings.

#### Data Requirements

- Role data must include `id`, `name`, `description`, `display_order`, `status`, `created_at`, and `updated_at`.
- Candidate data must include `id`, `name`, `class_name`, `role_id`, `photo_url`, `status`, `created_at`, and `updated_at`.
- Vote data must include `id`, `candidate_id`, `role_id`, and `timestamp`.
- Election result snapshot data must include `id`, `election_id`, `generated_at`, `total_votes_cast`, `result_json`, and `status`.
- Settings data must support at least `key` and `value`, including an `election_status` value limited to `NOT_STARTED`, `OPEN`, or `CLOSED`.

#### Election Results Table

- The system must provide a dedicated `Election_Results` table for storing final combined results separately from live vote data.
- `Election_Results` records must include `id`, `election_id`, `generated_at`, `total_votes_cast`, `result_json`, and `status`.
- The `status` field for `Election_Results` records must support `DRAFT`, `FINAL`, and `ARCHIVED`.
- The `result_json` field must preserve the official role-wise and candidate-wise results snapshot from the moment the election is closed.

#### Final Result Snapshot Requirements

- The stored final snapshot must include the closed election status and closure timestamp.
- The stored final snapshot must include summary totals for total votes cast.
- The stored final snapshot must include one entry per role containing role identity, role name, total role votes, tie status, winner identity when available, and ranked candidate results.
- Each stored candidate result must include candidate identity, candidate name, class name, vote count, rank, and winner flag.

#### Integrity Constraints

- Each vote must reference an existing candidate.
- Each vote must reference an existing role.
- Each candidate must reference exactly one existing role.
- Each vote must preserve candidate-to-role alignment.
- Each role must be deletable only when vote integrity would not be broken.
- Candidate deletion rules must protect the integrity of historical vote data once votes exist.
- Candidate status must control whether a candidate appears on new ballots without erasing historical vote records.
- Final results snapshots must remain unchanged after closure unless an explicit administrator-approved reset or recount workflow is introduced.
- Election status changes must not alter historical vote records.

### Cloudflare D1 Migrations

- The solution must define repeatable schema-creation steps for roles, candidates, votes, election result snapshots, and settings.
- The solution must define migration steps for storing official final results separately from live vote records.
- The solution must include a way to seed or import initial branding or status settings.
- The solution must describe how schema changes will be versioned and applied consistently across environments.

### Cloudflare R2 Storage Design

- Candidate photos must be stored separately from structured election records, with only the photo reference attached to the candidate record.
- Photo upload and candidate record update must behave as a coordinated workflow so the system does not leave broken photo references.
- Replaced photos must not leave the candidate record pointing to an unusable asset.
- Missing photo assets must fall back to a stable placeholder presentation in the UI.

### Admin Dashboard Specification

- The dashboard must present candidate management, election controls, branding, and basic election setup details in one protected workspace.
- The dashboard must present role management controls that allow administrators to add, edit, delete, activate, deactivate, and reorder roles.
- Candidate management must support add, edit, delete, status-management, preview, and photo-management workflows with clear form validation.
- Candidate forms must provide fields for candidate name, class details, contesting role, optional photo, and status selection.
- Candidate forms must display a visible photo placeholder before upload and whenever no photo is present.
- Candidate previews must reflect the current form values before the administrator commits changes.
- Election controls must clearly display whether voting is open or closed and require deliberate action to change status.
- Election controls must represent the full lifecycle of `NOT_STARTED`, `OPEN`, and `CLOSED`.
- Starting the election must make the voting interface available and restrict further structural changes to roles and candidates.
- Stopping the election must require confirmation and clearly warn that voting will end immediately and official final results will be recorded.
- Branding management must allow updating school name and logo with immediate effect across public-facing pages.
- Results visibility inside the dashboard must remain read-only for vote counts while still allowing administrators to monitor election progress.

### Voting Portal Specification

- The voting portal must begin directly with the role-card voting experience when the election is open.
- The voting portal route may remain reachable when voting is unavailable, but the ballot interface must appear only when the election status is `OPEN`.
- The ballot must use a role-by-role card flow and clearly show candidate names, classes, and photos when available.
- The ballot must exclude inactive candidates from selection while continuing to support roles that still have active candidates available.
- The portal must prevent more than one selection per role and make it clear when the current role has not yet been answered.
- The portal must use the current active role list and configured display order for rendering ballot sections.
- The portal must determine completed roles from browser-session state and resume the voter at the next pending role only within that same browser session.
- The portal must save each confirmed role vote immediately and then move to the next pending role.
- The portal must not allow admission-number entry, candidate display, or vote submission while the election status is `NOT_STARTED` or `CLOSED`.
- The confirmation experience must clearly explain whether the ballot was accepted or why it failed.
- The completion experience must thank the voter after all available roles have been completed successfully.
- The full voting experience must remain simple, focused, and suitable for student use in school environments.
- Student voters must not be able to navigate from the voting experience into protected administration or results content.

### Results Dashboard Specification

- The results dashboard must group standings by role and show candidate rankings within each group.
- The results dashboard must be visible only to authorized administrators.
- During an open election, the dashboard must surface current leaders without implying a final winner unless school policy permits that presentation.
- During an open election, the dashboard must clearly identify results as live and unofficial.
- After the election closes, the dashboard must clearly label winners or ties for each role.
- After the election closes, the dashboard must display the recorded final results snapshot as the official result record.
- The dashboard must visually distinguish empty roles, tied results, and roles with no votes recorded yet.
- The dashboard must support manual refresh or automatic updates so administrators can monitor changing totals.

### Security Requirements

- Administrative pages and privileged actions must require administrator authorization.
- Protected-page access checks for `/admin` and `/results` must happen server-side, not only in client-rendered logic.
- Student voters and unauthorized users must never be able to view results data or administrator-only actions.
- Vote submission must rely on server-side enforcement of election status and candidate-role validity.
- Vote submission must be blocked immediately after the election transitions away from `OPEN`, regardless of when the voting page was loaded.
- Per-role vote completion for UI flow must be derived from browser-session state in the current version, while recorded votes remain the source of truth for counted totals.
- The current version cannot prevent the same student from voting again on another system because voter identity is not tracked.
- Role definitions used for voting must come from administrator-managed data rather than hardcoded application lists.
- Vote totals must be derived from recorded vote data and must not be directly editable through any public or administrative interface.
- Results interfaces must remain read-only for viewers and must never reveal voter identities.
- Candidate photo uploads must be validated for file type and size before being accepted.
- Candidate status changes must not allow administrators to manipulate recorded vote totals or erase valid historical ballots.
- Status changes that open or close the election must be limited to administrators.
- Ballot recording must be atomic so that concurrent requests cannot create duplicate or partial voting outcomes.
- Final result generation during election closure must be atomic with the status transition so the system never exposes a partially closed election without an official final record.
- The system must capture enough audit information to investigate administrative actions without revealing private ballot choices to unauthorized viewers.
- Unauthorized attempts to reach protected pages must result in a redirect to the shared admin password prompt or a clear unauthorized access response.

### Validation Rules

- Candidate name is required and must reject empty or whitespace-only values.
- Role assignment is required for every candidate and must match an available administrator-defined role.
- Class name is required for every candidate.
- Candidate status, when provided, must be limited to `Active` or `Inactive`.
- Candidate forms must show a visible placeholder when no photo is available.
- Role name is required for every role and must reject empty or whitespace-only values.
- Role status, when provided, must be limited to `Active` or `Inactive`.
- A ballot may contain no more than one selected candidate per role.
- Each selected candidate must belong to the submitted role.
- Votes cannot be submitted when the election status is `NOT_STARTED` or `CLOSED`.
- The election status must be one of `NOT_STARTED`, `OPEN`, or `CLOSED`.
- Final result snapshot status, when present, must be limited to `DRAFT`, `FINAL`, or `ARCHIVED`.
- Uploaded candidate photos must satisfy approved type and maximum size requirements.
- Branding values must reject empty required fields and malformed image references.

### Error Handling

- Attempts by fully completed browser sessions to continue voting must return a clear completion message rather than reopening completed role cards.
- Election-not-started attempts must return a specific message explaining that voting has not started yet.
- Election-closed attempts must return a specific message explaining that voting is unavailable.
- Invalid candidate selections must return actionable validation errors.
- Candidate-role mismatches must return actionable validation errors.
- Repeat attempts for a completed role in the same session must return actionable validation errors.
- Role deletion attempts with linked votes must return actionable administrator-facing validation errors.
- Invalid or missing candidate status values must return actionable administrator-facing validation errors.
- Photo upload failures must preserve a consistent candidate state and tell the administrator what failed.
- Stop-election failures must preserve a consistent open-election state and tell the administrator that final result generation was not completed.
- Temporary service failures must return retry-friendly messages for users and maintain data integrity.
- Results requests with no votes yet must return an empty but valid live or final results state as appropriate to the election status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of eligible students can complete the role-by-role voting flow for all required active roles in under 3 minutes on a standard school-managed browser device.
- **SC-002**: 100% of repeat attempts for a completed role within the same browser session are blocked from reopening that role in the UI.
- **SC-002A**: The current version clearly documents that cross-system duplicate prevention is unavailable without voter identity.
- **SC-003**: Administrators can complete candidate creation or update workflows, including status selection, preview review, and photo association, in under 2 minutes per candidate for routine election setup.
- **SC-004**: Authorized administrators see updated standings within 30 seconds of a successfully recorded vote under normal operating conditions.
- **SC-005**: 100% of results views remain read-only and expose no voter-identifying information.
- **SC-006**: At least 90% of first-time student voters complete the voting flow without staff assistance during user acceptance testing.
- **SC-006A**: At least 95% of successfully recorded role votes remain preserved if the voter refreshes or reconnects within the same voting session before finishing all roles.
- **SC-007**: The complete web experience remains usable on desktop, tablet, and mobile browser widths for all three primary routes.
- **SC-008**: Administrators can create, activate, reorder, and assign dynamic roles without requiring code changes.
- **SC-009**: 100% of successful stop-election actions produce one preserved official final results snapshot before the election is marked closed.

## Assumptions

- New elections begin in the `NOT_STARTED` state by default.
- Each active role allows one winning candidate unless a tie occurs.
- Tie resolution, if needed, will be handled by school administrators outside the system after the tie is reported.
- The results page is restricted to authorized administrators in this version.
- A default image size limit and approved image-type list will be defined during planning if school policy does not already specify them.
- Candidates marked `Active` are shown on new ballots by default, while candidates marked `Inactive` remain available for administrative review and historical reporting.
- Active roles are voter-facing by default, while inactive roles remain available for administrative review and setup.
- Each role vote is saved immediately, and a browser-session journey is considered fully completed only after all required active roles have recorded votes in that session.
- The school will supervise physical voter access manually in the current version because voter identity is not enforced by the application.
- Admission-number-based access control, cross-system duplicate prevention, and voter audit trails are deferred to a future version.
- A single election instance has one official final results snapshot for each completed closure event unless a future reset or recount feature is explicitly introduced.
- The initial release supports a single school election context at a time.
- Deployment will target Cloudflare-hosted web delivery and use a GitHub repository as the primary source-control system.
- The application database is provisioned through the project’s Cloudflare D1 configuration and initialized through the migration and seed setup during local and Cloudflare development.
