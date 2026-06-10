# Contract: Class Leader Election API Behavior

## Purpose

Define the behavior expected from the election management and voting surfaces when class and division scoping is used.

## Admin Responsibilities

- Create a school-wide election or a class-leader election.
- When creating a class-leader election, associate it with a class and optionally a division.
- Prevent duplicate active contests for the same class/division scope.
- Keep the election open/closed state separate from scope configuration.

## Voter Responsibilities

- Show only the ballot type selected by the election scope.
- If the election is class-level, show only class-leader roles.
- If the election is school-wide, show only school-wide roles.
- Reject voting attempts for candidates that do not belong to the active ballot type.

## Data Expectations

- `scope_type` determines whether the ballot is school-wide or class-level.
- `class_id` is required for class-level elections.
- `division_id` is optional, but when present it must belong to the same class.
- Candidate class and division fields are used to keep class-leader registrations distinct from school-wide roles.

## Acceptance Behaviors

1. A class-wide election is visible to every student in the selected class.
2. A division-scoped election is visible only to the configured division.
3. School-wide elections do not surface class-leader roles on the ballot.
4. Results remain associated with the correct ballot type and election scope.
