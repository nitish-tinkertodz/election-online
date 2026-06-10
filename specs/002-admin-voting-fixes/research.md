# Research: Admin Voting Fixes

## 1) Admin role and candidate management

- **Decision**: Reuse the existing admin area and domain repositories for creating and updating roles and candidates.
- **Rationale**: The feature is a restoration and refinement of the current ballot setup workflow, not a new administrative system.
- **Alternatives considered**: Building a separate setup flow or moving management to a different page would add unnecessary surface area and fragment the admin experience.

## 2) Vote-page gating before election start

- **Decision**: Keep `/vote` publicly reachable but render a disabled state until the election is explicitly opened by an administrator.
- **Rationale**: The spec requires the page to stay accessible while preventing voting before start, which matches the current public voter portal model.
- **Alternatives considered**: Redirecting away from `/vote` entirely before start would hide the page but would not meet the requirement to keep it reachable.

## 3) Role-card layout for five or more candidates

- **Decision**: Use a responsive wrapped layout for candidate options so a role can display five candidates cleanly and still remain readable when a role has more than five candidates.
- **Rationale**: The clarification established that five candidates is a layout target, not a hard cap, so the ballot must preserve readability rather than enforce a rigid limit.
- **Alternatives considered**: Hard-capping roles at five candidates would simplify layout but would introduce an unnecessary product restriction.

## 4) Validation approach

- **Decision**: Treat admin setup validation, election-state gating, and ballot rendering as independently testable behaviors with explicit acceptance scenarios.
- **Rationale**: These are the behaviors most likely to regress and the ones most visible to administrators and voters.
- **Alternatives considered**: Relying only on end-to-end validation would miss smaller workflow and layout regressions.
