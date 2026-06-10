# Quickstart: Admin Voting Fixes

## Prerequisites

- Admin access to the election application.
- At least one role and one candidate available for setup testing.

## Validation Scenarios

### 1) Admin setup

1. Open the admin page as an authenticated administrator.
2. Create a new role.
3. Create at least one candidate for that role.
4. Confirm the new data appears in the admin interface immediately.

### 2) Vote-page gating

1. Keep the election in the not-started state.
2. Open `/vote` directly in a browser.
3. Confirm the page shows a disabled or not-started state and does not allow voting.
4. Start the election as an admin.
5. Refresh `/vote` and confirm the ballot becomes available.

### 3) Candidate card layout

1. Configure a role with five active candidates.
2. Open `/vote` on a desktop-sized browser window.
3. Confirm the candidate cards wrap cleanly and remain readable.
4. Repeat on a narrower viewport and confirm there is no clipping or overlap.

### Expected Outcome

- Roles and candidates can be created by admins.
- The vote page stays blocked until the election opens.
- Role cards remain readable with five candidates and still behave sensibly if a role has additional candidates.
