![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.1-brightgreen?logo=spring) ![React Native](https://img.shields.io/badge/React%20Native-0.74.2-blue?logo=react)

# Findr

Findr is an Nx monorepo for an in-store product search and route optimization app.

## Workspace Structure

```txt
apps/
  mobile/    Expo React Native shopper app
  api/       Spring Boot API and route engine
libs/        Shared libraries as the rebuild grows
infra/       Local/deployment infrastructure
```

## Required Installations

1. PostgreSQL 16
2. Java 17
3. Maven
4. Node.js

## Starting PostgreSQL

To start the API, initialize a database named `hackathon`.

```sh
sudo -u postgres psql 
CREATE DATABASE hackathon; 
```

## Install Dependencies

```sh
npm install
```

## Nx Commands

List projects:

```sh
npx nx show projects
```

Run the mobile app:

```sh
npx nx start mobile
```

Run the API:

```sh
npx nx serve api
```

Typecheck the mobile app:

```sh
npx nx run mobile:typecheck
```

Build the API:

```sh
npx nx build api
```

## Configuration

API database and Firebase settings are read from environment variables with local defaults in
`apps/api/src/main/resources/application.yml`.

```yaml
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/findr
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
FIREBASE_PROJECT_ID=your-firebase-project-id
```

Mobile API and Firebase client settings live in `apps/mobile/.env`. Use
`apps/mobile/.env.example` as the template.

```env
EXPO_PUBLIC_HOST=http://{ip}:{port}
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```
