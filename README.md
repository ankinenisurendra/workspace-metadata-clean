# Workspace Metadata Catalog Process

Fabric-authenticated React + Vite app for workspace metadata governance.

## Getting started

```bash
# Provision the Fabric backend and start the local dev server
npm run dev
```

Open [https://flat-isle-a544735f64-centralus.webapp.fabricapps.net/) to view the app.

## Project structure

```text
├── rayfin/
│   ├── rayfin.yml          # Fabric service configuration (auth, SQL data, static hosting)
│   └── data/               # Rayfin SQL entity schema and authenticated permissions
├── src/
│   ├── main.tsx            # Entry point + Rayfin client bootstrap
│   ├── App.tsx             # Routes and auth gate
│   ├── hooks/
│   │   └── AuthContext.tsx # React context wrapping the auth helpers
│   ├── components/
│   │   └── AuthPage.tsx    # Sign-in UI
│   ├── pages/
│   │   └── HomePage.tsx    # Post-auth landing page
│   └── services/
│       ├── IAuthService.ts        # Auth service contract + AuthUser type
│       ├── MockAuthService.ts     # Local-dev impl (email/password)
│       ├── RayfinAuthService.ts   # Production impl (Fabric brokered auth)
│       ├── rayfinClient.ts        # Typed Rayfin client singleton
│       └── bootstrap.ts           # Reads env, picks the right auth service
└── package.json
```

## Rayfin and Lakehouse persistence

Submitting metadata creates a `WorkspaceMetadataSubmission` record in the Rayfin
app's Fabric SQL Database. The API only permits authenticated users to create
records for their own identity. This is an append-only submission history; it
does not write directly to a Lakehouse. When the signed-in user opens the app,
it loads their saved submissions from Rayfin and restores each workspace from
its latest submission, so the status persists across refreshes.

To make submissions available in a Lakehouse:

1. Deploy the app so Rayfin provisions its SQL Database and applies the entity
   schema. The Fabric data app's SQL Database child item contains the source.
2. In Fabric Data Factory, create a connection to that SQL Database using its
   connection details from the Fabric portal. Keep credentials in the Fabric
   connection, never in frontend code or source control.
3. Create a pipeline that copies `WorkspaceMetadataSubmission` rows into a
   staging table named `WorkspaceMetadataSubmissions` in the `LH_SampleData`
   Lakehouse. Configure the pipeline to refresh this staging snapshot when it
   runs; the source table is the submission history.
4. Add a Fabric notebook activity after the copy to merge the latest staged
   submission per `workspaceId` into a curated `WorkspaceMetadata` table.
   This keeps one current row per workspace while retaining the full submission
   history in the staging table.

The app does not create, schedule, or run this Fabric pipeline. The pipeline
must be created in Fabric and run after the Rayfin backend has been deployed.

The workspaces currently listed in `HomePage.tsx` are preview fixtures with
placeholder IDs. Replace them with the real Fabric workspace inventory before
using the app for production metadata updates.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Provision or reuse the Fabric backend and start local frontend/Functions code |
| `npm run build` | Production build |
| `npm run build:fabric` | Build for Fabric deployment (entrypoint for `rayfin up staticapp deploy`) |
| `npm run lint` | Lint with ESLint |
| `npm run test` | Run unit tests with Vitest |
| `npm run rayfin:up` | Deploy app to Fabric (no local dev server) |
