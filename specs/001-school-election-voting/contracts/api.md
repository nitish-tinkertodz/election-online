# API Contract: School Election Voting System

## Authentication

- Admin routes require a server-validated admin session.
- Voting uses an anonymous browser-session cookie that identifies the current browser only.
- Protected page and mutation checks must happen on the server before sensitive data is returned.

## Roles

### `GET /api/roles`

- **Auth**: Administrator
- **Returns**: ordered role list

### `POST /api/roles`

- **Auth**: Administrator
- **Body**: `name`, `description`, `display_order`, `status`
- **Returns**: created role record

### `GET /api/roles/{roleId}`

- **Auth**: Administrator
- **Returns**: one role record

### `PUT /api/roles/{roleId}`

- **Auth**: Administrator
- **Body**: `name`, `description`, `display_order`, `status`
- **Returns**: updated role record

### `DELETE /api/roles/{roleId}`

- **Auth**: Administrator
- **Rules**: reject deletion if votes already reference the role

## Candidates

### `GET /api/candidates`

- **Auth**: Administrator
- **Returns**: candidate list grouped or filterable by role

### `POST /api/candidates`

- **Auth**: Administrator
- **Body**: `name`, `class_name`, `role_id`, `status`, `photo_url`
- **Returns**: created candidate record

### `GET /api/candidates/{candidateId}`

- **Auth**: Administrator
- **Returns**: one candidate record

### `PUT /api/candidates/{candidateId}`

- **Auth**: Administrator
- **Body**: `name`, `class_name`, `role_id`, `status`, `photo_url`
- **Returns**: updated candidate record

### `DELETE /api/candidates/{candidateId}`

- **Auth**: Administrator
- **Rules**: preserve historical vote integrity

### `POST /api/candidates/{candidateId}/photo`

- **Auth**: Administrator
- **Body**: image file upload
- **Rules**: file type and size validation required

### `DELETE /api/candidates/{candidateId}/photo`

- **Auth**: Administrator
- **Returns**: removed photo association

## Election

### `GET /api/election/status`

- **Auth**: public or administrator
- **Returns**: current election status and timestamps

### `POST /api/election/open`

- **Auth**: Administrator
- **Rules**: valid only from `NOT_STARTED`

### `POST /api/election/close`

- **Auth**: Administrator
- **Rules**: valid only from `OPEN`; must atomically close and generate final results
- **Returns**: closed status plus final summary

## Voting

### `POST /api/votes`

- **Auth**: anonymous browser session
- **Body**: `role_id`, `candidate_id`
- **Rules**:
  - election must be `OPEN`
  - role must exist and be active
  - candidate must exist and be active
  - candidate must belong to the submitted role
  - the same browser session cannot submit more than one vote for the same role
- **Returns**: success confirmation, completed role identifier, and next-step feedback

## Results

### `GET /api/results`

- **Auth**: Administrator
- **Returns**: pending status before closure, official frozen results after `CLOSED`
- **Rules**: no voter identity data may be exposed

## Branding

### `GET /api/branding`

- **Auth**: public or administrator
- **Returns**: school name, logo, and display settings

### `PUT /api/branding`

- **Auth**: Administrator
- **Body**: school display name, logo reference, and approved display settings
- **Returns**: persisted branding values
