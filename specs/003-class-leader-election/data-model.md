# Data Model: Class Leader Election Scoping

## Entities

### Election

Represents a voting contest.

Fields:
- `id`
- `status`
- `scope_type` as the contest-level marker (`SCHOOL` or `CLASS`)
- `class_id`
- `division_id` or null for class-wide elections
- `started_at`
- `closed_at`
- `created_at`
- `updated_at`

Validation rules:
- A class leader election must reference exactly one class.
- A class leader election may reference zero or one division.
- A division-scoped election must belong to the same class as the selected division.
- A class cannot have more than one active election for the same class/division combination.
- When `scope_type` is `CLASS`, the election should expose only class-leader roles on the vote page.
- When `scope_type` is `SCHOOL`, the election should expose only standard school-wide roles on the vote page.

### Class

Represents the school grouping used for class-level contests.

Fields:
- `id`
- `name`
- `display_order`
- `status`

Validation rules:
- Class names must be unique within the school context.

### Division

Represents a subdivision within a class.

Fields:
- `id`
- `class_id`
- `name`
- `display_order`
- `status`

Validation rules:
- A division must belong to exactly one class.
- Division names should be unique within a class.

### Student

Represents a voter in the broader school system.

Fields:
- `id`
- `name`
- `class_id`
- `division_id` or null
- `status`

Validation rules:
- A student may be associated with a class and division in the broader school model.
- Eligibility is determined by the election scope and candidate registration rules, not by a separate voter setup screen.

### Vote

Represents a ballot choice recorded for a specific election.

Fields:
- `id`
- `election_id`
- `student_id` or session reference
- `candidate_id`
- `timestamp`

Validation rules:
- A vote must belong to exactly one election.
- A vote must only be accepted if the student is eligible for that election at the time of submission.

### Candidate

Represents a student option on the ballot.

Fields:
- `id`
- `role_id`
- `name`
- `class_name`
- `class_id` or null
- `division_id` or null
- `photo_url`
- `status`

Validation rules:
- Class and division details are optional for school-wide roles.
- Class and division details are required when the role is marked as a class-leader role.
- Candidate class/division values must match the election scope if the role belongs to a class leader contest.

## Relationships

- One `Class` has many `Division` records.
- One `Class` has many `Student` records.
- One `Election` belongs to one `Class`.
- One `Election` optionally belongs to one `Division`.
- One `Election` has many `Candidate` records.
- One `Election` has many `Vote` records.
- One `Candidate` belongs to exactly one `Role`.
- One `Candidate` may optionally belong to a class and division for class-leader registration.

## State Considerations

- Election scope is fixed once voting begins.
- A student who changes class or division after voting opens should not be reclassified into a different election mid-contest.
- An election that is class-wide can be narrowed only before it opens, not during live voting.
