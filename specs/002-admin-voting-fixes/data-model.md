# Data Model: Admin Voting Fixes

## Election Role

- **Purpose**: Defines a ballot position managed by the administrator.
- **Key attributes**: Identifier, name, description, display order, status, created timestamp, updated timestamp.
- **Relationships**: Has many candidates.
- **Rules**: Must be creatable and editable by an authenticated administrator before the election is open; once open, setup changes are restricted.

## Candidate

- **Purpose**: Represents a selectable option in the ballot.
- **Key attributes**: Identifier, role identifier, name, class details, photo reference, status, created timestamp, updated timestamp.
- **Relationships**: Belongs to exactly one election role.
- **Rules**: Must be linked to a valid role; active candidates are available in the ballot; the UI must remain readable when a role has five or more candidates.

## Election Status

- **Purpose**: Controls whether setup, voting, and result behavior is available.
- **States**: Not started, open, closed.
- **Rules**: The vote page must block ballot submission until the election is open; administrator setup restrictions apply once the election is open.

## Role Card

- **Purpose**: Presents one role and its candidate choices to voters.
- **Key attributes**: Role label, candidate list, visual grouping, wrapped rows.
- **Rules**: Must support a clean five-candidate display target and continue to render without clipping or overlap if additional candidates exist.
