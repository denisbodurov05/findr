# Findr k3s deployment

The API, PostgreSQL, and admin UI run in the `findr` namespace. The API and
admin are exposed on separate hosts so that the admin's same-origin `/api/v1`
Route Handler can proxy requests to the internal `findr-api` Service while the
mobile app can call the public API host directly.

## Cluster prerequisites

- k3s with Traefik enabled
- TLS certificates named `findr-api-tls` and `findr-admin-tls` in `findr`
- DNS records for the API and admin hosts
- A GitHub Actions runner on the cluster network with the labels
  `self-hosted`, `linux`, and `k3s`
- `kubectl` installed on that runner with a least-privilege production context

The checked-in ingress hosts are safe placeholders. The deployment workflow
replaces them in-memory with the `API_HOST` and `ADMIN_HOST` GitHub environment
variables before applying the resources.

## Layout

Each deployable component owns its Kubernetes resources and Kustomization:

```text
infra/k3s/
├── namespace.yaml
├── kustomization.yaml
├── api/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
├── admin/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
└── postgres/
    ├── statefulset.yaml
    ├── service.yaml
    └── kustomization.yaml
```

The root `kustomization.yaml` composes all three component directories.

## GitHub production environment

Create a GitHub Actions environment named `production` and configure:

Secrets:

- `DB_PASSWORD`: PostgreSQL application/database password
- `GHCR_PULL_TOKEN`: classic PAT or equivalent credential with `read:packages`
- `EXPO_TOKEN`: Expo access token used by the mobile release job

Variables:

- `GHCR_USERNAME`: account that owns `GHCR_PULL_TOKEN` (defaults to repository owner)
- `FIREBASE_PROJECT_ID`: Firebase project verified by the API
- `FIREBASE_API_KEY`: shared Firebase browser API key
- `FIREBASE_AUTH_DOMAIN`: shared Firebase authentication domain
- `FIREBASE_STORAGE_BUCKET`: shared Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: shared Firebase messaging sender ID
- `FIREBASE_ADMIN_APP_ID`: Firebase web app ID used by the admin panel
- `FIREBASE_MOBILE_APP_ID`: Firebase app ID used by the Expo application
- `FIREBASE_MEASUREMENT_ID`: optional Firebase Analytics measurement ID
- `API_HOST`: public API hostname, for example `api.findr.example.com`
- `ADMIN_HOST`: public admin hostname, for example `admin.findr.example.com`
- `EAS_PROJECT_ID`: Expo project's EAS UUID

The Firebase web values are public build configuration rather than credentials;
keep authorization rules in Firebase and the API. The database password,
registry token, and Expo token must remain secrets.

The mobile release job maps these shared values into the `EXPO_PUBLIC_*` names
in its temporary `github-release` EAS profile. It uses
`FIREBASE_MOBILE_APP_ID` for `EXPO_PUBLIC_FIREBASE_APP_ID` and expands
`API_HOST` into the HTTPS `EXPO_PUBLIC_HOST` URL. The resulting profile is sent
to the remote EAS builder, so the values do not need to be duplicated in the
Expo dashboard.

## TLS

The ingresses require these Secrets:

```bash
kubectl -n findr create secret tls findr-api-tls \
  --cert=api-fullchain.pem \
  --key=api-private-key.pem

kubectl -n findr create secret tls findr-admin-tls \
  --cert=admin-fullchain.pem \
  --key=admin-private-key.pem
```

They can instead be managed by cert-manager; do not commit certificate keys.

## Manual bootstrap

The workflow normally creates the runtime and GHCR pull secrets. For a manual
bootstrap, create the namespace and equivalent secrets before applying the
kustomization:

```bash
kubectl apply -f namespace.yaml

kubectl -n findr create secret generic findr-secrets \
  --from-literal=db-password='<database password>' \
  --from-literal=firebase-project-id='<Firebase project ID>'

kubectl -n findr create secret docker-registry ghcr-pull \
  --docker-server=ghcr.io \
  --docker-username='<GitHub username>' \
  --docker-password='<token with read:packages>'

kubectl apply -k .
```

The PostgreSQL StatefulSet keeps its data in a persistent volume. Reapplying
the manifests or deploying a new API image does not recreate that volume.
After PostgreSQL has initialized that volume, changing `DB_PASSWORD` in GitHub
does not change the password stored inside PostgreSQL. Rotate the database user
password in PostgreSQL and the GitHub secret as one coordinated operation.
