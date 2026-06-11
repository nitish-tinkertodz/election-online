# Implementation Plan: Admin Voting Fixes

**Branch**: `002-admin-voting-fixes` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-admin-voting-fixes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Restore administrator control over role and candidate creation, keep the vote page disabled until the election is explicitly opened, and make role cards readable when a role has up to five candidates displayed in a wrapped layout.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js App Router, React, Node.js, Zod, Tailwind CSS

**Storage**: Atomic JSON file storage and local filesystem candidate photos on the host machine, browser session cookie for anonymous voting progress tracking

**Testing**: Vitest, React Testing Library, Playwright

**Target Platform**: One Node.js host machine serving modern desktop and mobile browsers over the local network

**Project Type**: Web application

**Performance Goals**: The vote page should remain responsive during normal school election traffic, with visible election-state gating and readable candidate layouts on common devices

**Constraints**: Server-side authorization for admin-only pages and actions; `/vote` remains public but must not accept votes while the election is not open; admin setup changes remain restricted once the election is open; the ballot layout must remain readable for roles with five or more candidates

**Scale/Scope**: Single-school deployment with modest concurrency, a single active election, and roles that may contain multiple candidates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No active project-specific constitution rules are defined in the current template, so there are no enforceable gate violations to record.

## Project Structure

### Documentation (this feature)

```text
specs/002-admin-voting-fixes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── admin/
├── vote/
├── results/
└── api/
    ├── auth/
    ├── roles/
    ├── candidates/
    ├── election/
    ├── votes/
    ├── results/
    └── branding/

components/
├── admin/
├── vote/
├── results/
└── shared/

lib/
├── auth/
├── db/
├── election/
├── results/
├── storage/
└── validation/

db/
├── migrations/
└── seed/

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Keep the feature within the existing Next.js App Router application, extending the admin, vote, and shared domain modules that already own election setup, election status gating, and ballot rendering.

## Complexity Tracking

No constitution exceptions are required for the current plan.
