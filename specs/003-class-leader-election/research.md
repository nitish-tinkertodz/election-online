# Research: Class Leader Election Scoping

## Decision 1: Model class leader elections as scoped contests

- Decision: Represent class leader elections as elections that carry class scope and, optionally, a division scope.
- Rationale: This preserves the existing election lifecycle while adding a clear eligibility boundary for class-specific contests.
- Alternatives considered: Creating a separate election subsystem for class leader elections; this was rejected because it would duplicate vote lifecycle and result handling.

## Decision 2: Keep eligibility enforced on the server

- Decision: Determine class and division eligibility on the server before showing the ballot or accepting a vote.
- Rationale: Client-side hiding alone would not prevent a student from reaching a contest they should not access.
- Alternatives considered: Client-only filtering; rejected because it is not sufficient for access control.

## Decision 3: Treat division as an optional narrowing rule inside a class

- Decision: Allow an election to target a whole class or a single division inside that class.
- Rationale: Schools that do not use divisions should still be able to run class leader elections without extra complexity.
- Alternatives considered: Requiring a division for every class election; rejected because it would exclude schools that only organize by class.

## Decision 4: Store class membership separately from election state

- Decision: Add durable class and division membership fields to student eligibility data and reference them from the election scope.
- Rationale: Eligibility must stay stable across the voting period and be auditable when the election is reviewed later.
- Alternatives considered: Inferring class membership from vote-session state; rejected because class assignment belongs to student data, not the ballot session.

## Decision 5: Reuse the existing vote flow for all elections

- Decision: Keep the current ballot and result flow, and filter the elections that are visible to a student based on scope.
- Rationale: This minimizes user confusion and reduces implementation risk.
- Alternatives considered: A separate class-leader voting UI; rejected because it would fragment the voting experience.

