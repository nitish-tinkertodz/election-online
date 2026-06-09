# Data Model: School Election Voting System

## Entities

### Election

- `id`
- `status` with values `NOT_STARTED`, `OPEN`, `CLOSED`
- `started_at`
- `closed_at`
- `created_at`
- `updated_at`

**Relationships**
- Owns the active election lifecycle.
- Has many roles, candidates, votes, audit logs, and result snapshots.

**Rules**
- Start may only transition from `NOT_STARTED` to `OPEN`.
- Stop may only transition from `OPEN` to `CLOSED`.
- Final results are generated when status becomes `CLOSED`.

### Role

- `id`
- `name`
- `description`
- `display_order`
- `status`
- `created_at`
- `updated_at`

**Relationships**
- Has many candidates.
- Has many votes.

**Rules**
- `display_order` is unique within the election context.
- A role cannot be deleted once votes are linked to it.
- Role and candidate structure becomes locked or restricted while the election is `OPEN`.

### Candidate

- `id`
- `name`
- `class_name`
- `role_id`
- `photo_url`
- `status`
- `created_at`
- `updated_at`

**Relationships**
- Belongs to exactly one role.
- Appears in votes through the role it belongs to.

**Rules**
- Name, class name, and role are required.
- Photo is optional.
- Uploaded photo references must pass file type and size validation before `photo_url` is updated.
- Inactive candidates remain in the admin area but are excluded from new ballot selections.

### VoteSession

- `id`
- `session_key`
- `election_id`
- `completed_role_ids_json`
- `created_at`
- `updated_at`
- `closed_at`

**Relationships**
- Represents one anonymous browser session for a voter journey.
- Has many votes.

**Rules**
- Session data persists across refreshes and tabs until the browser is closed.
- A new browser session must begin with no completed roles.
- The session is anonymous and does not identify the voter.

### Explicitly Excluded

- There is intentionally no `Voters` table in this version.
- There is intentionally no admission-number lookup or voter identity record in this version.

### Vote

- `id`
- `session_id`
- `candidate_id`
- `role_id`
- `timestamp`

**Relationships**
- Belongs to one vote session.
- Belongs to one candidate.
- Belongs to one role.

**Rules**
- Each vote must preserve candidate-to-role alignment.
- A unique constraint on `session_id + role_id` blocks duplicate votes for the same role within one browser session.
- Votes are written atomically so a role vote cannot be partially recorded.

### ElectionResultSnapshot

- `id`
- `election_id`
- `generated_at`
- `total_votes_cast`
- `result_json`
- `status`

**Relationships**
- Belongs to one election.
- Is separate from live vote aggregation.

**Rules**
- `status` supports `DRAFT`, `FINAL`, and `ARCHIVED`.
- The stored `result_json` must freeze the official result at election close.
- Final snapshots must not be overwritten after closure unless a future reset or recount feature is explicitly added.

### Setting

- `key`
- `value`

**Relationships**
- Stores singleton configuration data.

**Rules**
- Holds election status, school branding, and other application-wide settings.
- Values must be validated by key-specific rules.

### AuditLog

- `id`
- `action`
- `actor_type`
- `actor_id`
- `payload_json`
- `created_at`

**Relationships**
- Records election-management actions.

**Rules**
- Opening, closing, candidate changes, and branding updates should be captured here.

## State Transitions

### Election

- `NOT_STARTED` -> `OPEN`
- `OPEN` -> `CLOSED`
- Any other transition is invalid

### Candidate

- `Active` -> `Inactive`
- `Inactive` -> `Active`

### Role

- `Active` -> `Inactive`
- `Inactive` -> `Active`

### Vote Session

- `OPEN_SESSION` -> `COMPLETED`
- Browser close ends the session boundary and starts a fresh anonymous session later

## Snapshot Shape

The result snapshot JSON should preserve:

- election status and closed timestamp
- total votes cast
- one entry per role
- candidate vote counts
- rankings
- winners
- tie indicators
- the frozen final snapshot as of closure
