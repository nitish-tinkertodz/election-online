# Contracts: Admin Voting Fixes

## Admin Setup

### `POST /api/roles`

- Creates a new election role.
- Requires authenticated administrator access.
- Rejects invalid or incomplete input.

### `POST /api/candidates`

- Creates a new candidate and assigns it to a role.
- Requires authenticated administrator access.
- Rejects invalid or incomplete input, including missing role assignment.

## Election Gating

### `GET /api/election/status`

- Returns the current election state.
- Used by the vote page to decide whether the ballot should be enabled.

### `POST /api/election/open`

- Opens the election explicitly.
- Requires authenticated administrator access.
- After success, the vote page may accept ballot interaction.

## Voting

### `POST /api/votes`

- Saves a confirmed role vote for the current browser session.
- Rejects submissions when the election is not open.
- Rejects submissions for inactive or invalid roles or candidates.

## Page Contracts

### `/admin`

- Administrator-only setup page for roles, candidates, and election controls.

### `/vote`

- Public voter page that must display a disabled state until the election is open.
- Must show role cards in a readable wrapped layout.

