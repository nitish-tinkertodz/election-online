# election-online

Local-network school election application.

## Run

```powershell
npm install
npm run dev -- --hostname 0.0.0.0
```

Open the admin page on the host machine at `http://localhost:3000/admin`.
On voter machines, open `http://<host-machine-ip>:3000/vote`.

Election data and uploaded candidate photos are stored under `.local-dev/` on
the host machine. Keep the host process running throughout voting.
