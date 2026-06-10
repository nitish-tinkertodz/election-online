# Quickstart: Class Leader Election Scoping

## Prerequisites

- Existing local development environment for the web app
- Database migrations applied to include class and division scoping fields
- At least one school-wide role and one class-leader role configured
- At least one class, one optional division, and candidate records with class/division values for the class-leader role

## Validation Flow

1. Create a normal school-wide role and confirm it behaves as a standard ballot item.
2. Create a role and mark it as a class-leader role.
3. Add candidates to the class-leader role and fill in class and division values for those candidates.
4. Open the election in `SCHOOL` mode and confirm only school-wide roles appear on the vote page.
5. Open the election in `CLASS` mode and confirm only class-leader roles appear on the vote page.
6. Confirm class-leader candidate entries remain separate from the school-wide ballot and cannot be mixed into the wrong ballot type.
7. Start and close the class-level election and verify the same election lifecycle controls work as expected.

## Expected Outcomes

- School-wide ballots show only school-wide roles.
- Class-level ballots show only class-leader roles.
- Candidate class and division values stay attached to class-leader registration.
- Opening and closing the class-level election works without mixing it into the school-wide ballot.

## References

- See [data-model.md](./data-model.md) for entity relationships and validation rules.
- See [contracts/class-leader-election-api.md](./contracts/class-leader-election-api.md) for behavior expectations.
