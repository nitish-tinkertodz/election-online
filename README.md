# election-online

Local-network school election application.

## Run

On a clean Windows host, double-click:

```text
scripts\install-prerequisites.cmd
```

The installer requests Administrator access, installs Node.js LTS when needed,
persists Node.js and npm in the Windows system PATH, installs locked npm
dependencies, verifies the production build, allows inbound TCP port 3000 on
Private networks, and starts the application. Internet access is required
during installation. A detailed log is written to
`.local-dev/install-prerequisites.log`.

For later starts, double-click `scripts\start-election.cmd`. It locates
Node.js directly and does not depend on the terminal having refreshed PATH.
The installer also broadcasts the Windows environment change so newly opened
PowerShell and Command Prompt windows receive the updated PATH.

Open the admin page on the host machine at `http://localhost:3000/admin`.
On voter machines, open `http://<host-machine-ip>:3000/vote`.

Election data and uploaded candidate photos are stored under `.local-dev/` on
the host machine. Keep the host process running throughout voting.
