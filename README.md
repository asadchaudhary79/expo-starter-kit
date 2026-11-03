# Expo Auth Starter

Production-shaped Expo Router authentication starter with an Express + Better Auth API, PostgreSQL/Drizzle, Resend email, and a light mobile UI that mirrors a typical consumer app.

**Repository:** [github.com/asadchaudhary79/expo-starter-kit](https://github.com/asadchaudhary79/expo-starter-kit)

**Jump to:** [Quick start](#quick-start) · [App flow](#app-flow) · [Screens & tabs](#screens--tabs) · [API](#api) · [Environment](#environment) · [Native providers](#native-providers) · [Customize](#customization-map) · [Commands](#commands) · [Docs](#documentation)

---

## Included

- Splash welcome screen → Get started → sign-in
- Email/password registration, verification, sign-in, sign-out, and two-step recovery
- Native Google sign-in (Android/iOS) and Sign in with Apple (iOS)
- Secure Better Auth sessions with protected Expo Router groups
- Unique-username onboarding with optional biometric App Lock
- Standard tabs after sign-in: **Home · Search · Calendar · Activity · Profile**
- Edit profile (name, username, photo picker UI)
- Push & local notifications (Expo Notifications + Express token store / send)
- Account deletion with password or recent-session confirmation
- Public + protected sample APIs on a separate Express backend
- Database-backed rate limiting, health checks, and tests

---

## Stack

| Area | Choice |
|---|---|
| App & routing | Expo 56, React Native, TypeScript, Expo Router |
| Auth | Better Auth (+ Expo client) |
| API | Express (`backend/`) |
| Database | PostgreSQL / Neon + Drizzle |
| Email | Resend |
| Client state | TanStack Query |
| Native identity | Nitro Google Sign-In, Expo Apple Authentication |
| App lock | Expo Local Authentication |
| Photos | Expo Image Picker (profile UI) |

Google, Apple, biometrics, and image picker need a **dev client / native build**. Expo Go is not enough for the full starter.

---

## Prerequisites

- Node.js LTS + npm
- PostgreSQL (local or Neon)
- Resend account (email verification / recovery)
- Xcode (iOS) and/or Android Studio (optional for native)
- Optional Google Cloud + Apple Developer accounts

---

## Quick start

### 1. Clone and install

```sh
git clone https://github.com/asadchaudhary79/expo-starter-kit.git
cd expo-starter-kit
npm install
npm install --prefix backend
```

### 2. App identity

Edit `app-identity.json` before OAuth clients or store builds:

```json
{
  "name": "Expo Auth Starter",
  "slug": "expo-auth-starter",
  "scheme": "expoauthstarter",
  "iosBundleIdentifier": "com.example.expoauthstarter",
  "androidPackage": "com.example.expoauthstarter"
}
```

### 3. Environment

```sh
cp .env.example .env
cp backend/.env.example backend/.env
```

| File | Purpose |
|---|---|
| `.env` | Public Expo values only (`EXPO_PUBLIC_*`) |
| `backend/.env` | Database, Better Auth secret, Resend, Google secret |

Generate a secret:

```sh
npx auth secret
```

Paste it into `backend/.env` as `BETTER_AUTH_SECRET`.

### 4. Database

Set `DATABASE_URL` in `backend/.env`, then:

```sh
npm run db:migrate
```

### 5. Run API + app

```sh
# Terminal 1 — Express API (default http://localhost:3000)
npm run api:dev

# Terminal 2 — Expo
npm start
# or
npm run web
npm run ios
npm run android
```

### 6. Smoke check

1. Open `http://localhost:3000/api/health` — DB should be reachable.
2. App opens on **Splash** → tap **Get started** → **Sign in**.
3. Register (password ≥ 15 chars) → verify email OTP → pick username.
4. Land on Home with the five tabs.

---

## App flow

```text
App start
  → restore session + app-lock preference
  → signed out: /splash → Get started → /sign-in (auth stack)
  → signed in, incomplete: /complete-profile
  → signed in, ready: tabs at /
  → session unreachable: retry screen (cookie kept)
```

Sign-out returns to `/splash`.

---

## Screens & tabs

### Signed out

| Route | Purpose |
|---|---|
| `/splash` | Welcome / splash (button opens sign-in) |
| `/sign-in` | Email/password + social |
| `/sign-up` | Registration |
| `/verify-email` | 6-digit email OTP |
| `/forgot-password` / `/reset-password` | Recovery |
| `/public` | Public tip (no session) |

### Signed in

| Route / tab | Purpose |
|---|---|
| `/` (Home) | Dashboard, quick links, profile card |
| `/search` | Find starter pages |
| `/calendar` | Month grid + sample day events |
| `/activity` | Notifications + activity from protected APIs |
| `/profile` | Account settings |
| `/edit-profile` | Name, username, photo picker |
| `/notifications` | Permission, local schedules, Expo push register/send |
| `/notification/[id]` | Deep link opened from notification `data.url` |
| `/biometric-lock` | Device App Lock |
| `/delete-account` | Permanent deletion |
| `/complete-profile` | First-time username onboarding |

Reusable UI lives in `src/components/ui` (not a separate “UI Kit” demo page).

---

## Project layout

```text
src/app/           Expo Router routes & guards
src/features/      Screens & feature logic (auth, home, calendar, …)
src/components/ui/ Shared UI primitives
src/lib/           Client API, auth client, toasts
src/theme/         Light theme tokens
backend/           Express + Better Auth + Drizzle + Resend
docs/              Architecture, providers, production
```

See [Architecture](docs/architecture.md) for route groups and how to add protected features.

---

## API

Base URL: `EXPO_PUBLIC_API_URL` (dev default `http://localhost:3000`).

| Endpoint | Access |
|---|---|
| `GET /api/health` | Public readiness |
| `/api/auth/*` | Better Auth |
| `GET /api/public/status` | Public |
| `GET /api/public/tip` | Public |
| `GET /api/public/announcements` | Public |
| `GET /api/public/plans` | Public |
| `GET /api/protected/profile` | Session + onboarding |
| `PATCH /api/protected/profile` | Update name / username |
| `GET /api/protected/workspace` | Session + onboarding |
| `GET /api/protected/activity` | Session + onboarding |
| `GET /api/protected/notifications` | Session + onboarding |
| `PATCH /api/onboarding` | Unique username completion |
| `POST /api/push/register` | Store Expo push token for the signed-in user |
| `DELETE /api/push/unregister` | Disable a stored push token |
| `POST /api/push/send` | Send a test Expo push to this user’s tokens |
| `GET /api/push/results` | List Mark-as-read / background results (Postgres) |
| `POST /api/push/results` | Save a Mark-as-read / background result |

Public controllers: `backend/src/controllers/public.controller.ts`  
Protected controllers: `backend/src/controllers/protected.controller.ts`  
Profile update: `backend/src/controllers/profile.controller.ts`  
Push: `backend/src/controllers/push.controller.ts`

### Notifications notes

1. Rebuild the native app after adding the `expo-notifications` plugin (dev client required).
2. Set `extra.eas.projectId` (EAS project) so `getExpoPushTokenAsync` works.
3. Run `npm run db:migrate` to create the `push_token` and `notification_result` tables (Postgres — no SQLite).
4. Optional server env: `EXPO_ACCESS_TOKEN` for Expo Push API auth.
5. Profile → **Notifications** opens the lab screen (local + remote).

Protected routes return `401` / `403` when the session or onboarding is missing, with `private, no-store` caching.

---

## Environment

| Variable | Where | Required |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | App `.env` | Yes |
| `EXPO_PUBLIC_APP_ENV` | App `.env` | Yes (`development` / `staging` / `production`) |
| `DATABASE_URL` | `backend/.env` | Yes |
| `BETTER_AUTH_SECRET` | `backend/.env` | Yes |
| `BETTER_AUTH_URL` | `backend/.env` | Yes (API public URL) |
| `EMAIL_FROM`, `RESEND_API_KEY` | `backend/.env` | Yes |
| `AUTH_TRUSTED_ORIGINS` | `backend/.env` | Extra browser origins (e.g. Expo web) |
| `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` | Both | Optional Google |
| `GOOGLE_CLIENT_SECRET` | `backend/.env` | Optional Google |
| `APPLE_TEAM_ID` | Build env | Optional signing |

Never put database or Resend secrets in the Expo `.env`.

---

## Native providers

### Google

Create Web, iOS, and Android OAuth clients in one Google Cloud project. Set all client IDs in both env files and `GOOGLE_CLIENT_SECRET` on the server.

### Apple

Enable **Sign in with Apple** for the exact iOS bundle ID. Native ID-token flow does not need a Service ID or `.p8` for basic sign-in.

Full steps: [Provider setup](docs/providers.md).

---

## Customization map

| Goal | Start here |
|---|---|
| Name, scheme, bundle IDs | `app-identity.json` |
| Password rules | `src/constants/auth-policy.ts` |
| Username / onboarding | `src/features/onboarding`, `backend/src/modules/onboarding` |
| Colors / typography | `src/theme` |
| Tab bar look | `src/components/ui/app-tab-bar.tsx` |
| Splash copy | `src/features/auth/screens/splash.tsx` |
| Notifications / push | `src/features/notifications`, `backend/src/modules/push` |
| Add protected screen + API | [Architecture](docs/architecture.md#adding-a-protected-feature) |
| Swap Resend / DB / ORM | [Production](docs/production.md) |
| Remove Google / Apple / biometrics | [Providers](docs/providers.md), [Architecture](docs/architecture.md#optional-capabilities) |

---

## Commands

| Command | Purpose |
|---|---|
| `npm run api:dev` | Express API with reload |
| `npm start` | Expo (dev client) |
| `npm run web` | Expo web |
| `npm run ios` / `npm run android` | Native run |
| `npm run check` | Typecheck + lint + tests |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:generate` | Generate migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run auth:schema` | Regenerate Better Auth schema |
| `npm run audit:client` | Scan client bundle for server secrets |

```sh
npm run check
```

---

## Before production

- HTTPS origins and unique secrets from a secret manager
- Verified Resend domain and reviewed migrations
- Trusted proxy / rate-limit configuration
- Physical-device auth testing
- Google Play account-deletion URL and Apple revocation when shipping social deletion

Details: [Production](docs/production.md).

---

## Documentation

- [Architecture](docs/architecture.md)
- [Provider setup](docs/providers.md)
- [Production](docs/production.md)

---

## License

Private starter — use and adapt for your products. Update `app-identity.json` and secrets before publishing store builds.
