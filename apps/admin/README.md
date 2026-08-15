# Findr Admin

Next.js administration UI for editing Findr store layouts.

## Configuration

Create `.env.local` with the Firebase web configuration and a server-only API
origin:

```dotenv
BACKEND_URL=http://localhost:8890
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Browser requests use the same-origin `/api/v1` Route Handler. `BACKEND_URL` is
read only by the Next.js server and is never bundled into browser JavaScript.

## Commands

```bash
npm run dev --workspace=admin
npm run lint --workspace=admin
npm run test --workspace=admin
npm run build --workspace=admin
```

## Container deployment

The production image is built from the repository root because the admin uses
the `@findr/types` workspace package:

```bash
docker build -f apps/admin/Dockerfile -t findr-admin .
```

`NEXT_PUBLIC_FIREBASE_*` values are embedded during `next build` and therefore
must be supplied as Docker build arguments. `BACKEND_URL` remains server-only
and is supplied to the running container; k3s sets it to the internal
`http://findr-api` Service.
