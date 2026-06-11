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

### `GET /api/election/events`

- Public server-sent event stream used by loaded voter pages.
- Accepts the currently rendered election status as the `status` query parameter.
- Emits a `status` event only when the server observes a different election status.
- Voter clients refresh their server-rendered ballot state after receiving a changed status.

### `POST /api/election/open`

- Opens the election explicitly.
- Requires authenticated administrator access.
- Rejects the request until at least one active candidate is assigned to an active role.
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
- Must treat an empty ballot with no configured candidates as closed until admin setup is complete.
- Must show role cards in a readable wrapped layout.
