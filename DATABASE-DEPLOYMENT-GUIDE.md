# Shared Web and Mobile Database Deployment Guide

This guide explains how to make the web app and Android APK use the same live employee accounts and application records, using Vercel for hosting and a hosted PostgreSQL database.

It is written for this repository as it exists today. The current project is an Expo SDK 57 / Expo Router application; it is not yet connected to a production database.

> **Important:** The APK and website should not connect directly to PostgreSQL. They should both call an HTTPS API. The API is the only component that has database credentials and decides which account may read or change each record.

## 1. The target architecture

```text
Browser
  Expo web app
       \
        \ HTTPS
         v
      Vercel API  <--- server-only DATABASE_URL
         |
         | SQL over TLS
         v
   Hosted PostgreSQL
         ^
         | SQL over TLS
      Vercel API
         ^
         | HTTPS
  Android APK
  Expo / React Native app
```

There is **one logical production database**, not a web database and a mobile database:

- The browser loads the Expo web build from Vercel.
- The APK is built with Expo Application Services (EAS).
- Both clients send requests to the same stable API URL, for example `https://api.example.com`.
- Vercel API functions connect to the same hosted PostgreSQL database.
- The API derives the signed-in account from its authenticated session and scopes every data operation to that account.

For resilience and safe testing, also provision a separate development or staging database. That is an environment copy, not a second production database.

## 2. Current repository behavior

The following repository details affect the migration:

| Area | Current implementation | What must change for production |
|---|---|---|
| Authentication server | [`server/auth-server.mjs`](./server/auth-server.mjs) starts a long-running Node HTTP server and opens a local SQLite database using the schema in [`server/schema.sql`](./server/schema.sql). | Convert the HTTP handlers into request-based Vercel Node.js Functions, and query PostgreSQL asynchronously. Do not start a long-running server or open a local SQLite file inside a function. |
| Local account seeding | [`server/setup-database.mjs`](./server/setup-database.mjs) creates/updates accounts in SQLite. | Make a separate one-time PostgreSQL migration/seed script. Do not run schema creation or account seeding as part of every API request. |
| Client API URL | [`src/contexts/auth-context.tsx`](./src/contexts/auth-context.tsx) uses `EXPO_PUBLIC_AUTH_API_URL` and falls back to local URLs. | Set the production API URL when building the site and APK. Remove or fail closed on production localhost fallbacks. |
| Application records | [`src/contexts/demo-submissions-context.tsx`](./src/contexts/demo-submissions-context.tsx) reads and writes one `rcs-demo-submissions` key in `AsyncStorage`; it includes shared, mutable sample data. | Load and modify account-owned records through API endpoints. Optionally cache per-account data locally, but do not treat that cache as the source of truth. |
| Demo accounts | [`server/auth-shared.mjs`](./server/auth-shared.mjs) defines seven demo users. | Seed them once into the hosted development/staging database. Use the existing display names and company mapping. Never make the shared short demo password a real employee password. |
| Web output | [`app.json`](./app.json) sets Expo web output to `static`. | Export and deploy the web build; separately deploy the API and database connection. |
| Deployment config | There is currently no `eas.json` or `vercel.json`. `.gitignore` currently ignores both names. | If you add either file, remove its ignore entry and commit the file so deployments use the intended build configuration. |

### Existing local records will not automatically move

Records currently in browser/device `AsyncStorage` are on that particular browser or device. They are not in SQLite and cannot be discovered by Vercel or the hosted database. The records are also stored under one shared key on each installation, so changing account on that installation can show the same local data.

For a demo deployment, the safest path is usually to seed fresh sample applications on the server separately for each demo account and clear/ignore the old local cache. If any locally created records must be preserved, export them from the specific browser/device first and import them with an explicit owner account. Do not upload local storage contents blindly.

## 3. Choose the hosting layout

### Recommended for this project: separate Vercel web and API projects

Use two Vercel projects connected to the same Git repository, or to separate web/API repositories:

1. **Web project** builds the existing Expo web app (`npx expo export --platform web`, output `dist`).
2. **API project** is a small Node.js backend project that contains Vercel Function entry points and server-only database code. Give it an API domain such as `api.example.com`.
3. Provision the PostgreSQL resource through the [Vercel Marketplace storage integrations](https://vercel.com/docs/marketplace-storage), then connect it to the **API project only**.
4. Configure the Expo web build and the EAS production build with `EXPO_PUBLIC_AUTH_API_URL=https://api.example.com`.

This separation makes it clear which project is allowed to read `DATABASE_URL`. The web and APK bundles receive only the public API address.

The API project can live in a `backend/` directory in this repository. When importing the repository into Vercel, configure the API Vercel project’s **Root Directory** to that directory. Keep the Expo app’s root directory at the repository root for the web project. A separate repository for the API is also fine.

Suggested API project layout:

```text
backend/
  package.json               # backend dependencies; use "type": "module" for ESM
  api/
    healthz.ts
    auth/
      login.ts
      me.ts
      logout.ts
    applications/
      index.ts
      [id]/
        cancel.ts
    dashboard/
      application-summary.ts
  lib/
    database.ts
    authentication.ts
    validation.ts
  migrations/
    001_initial_schema.sql
  scripts/
    migrate.mjs
    seed-demo-users.mjs
  .env.local                 # local server secrets; ignored by Git
```

With Vercel’s Node.js file-based function routing, those files expose paths such as `/api/auth/login` and `/api/applications`. Give the backend project its own `package.json`, declare `@neondatabase/serverless` there, and run local migrations/seeding from that backend package. The `api/` handlers can export supported request methods (for example `GET` and `POST`); they should not call `server.listen()`. Vercel also supports a shared router such as Hono if you later want related routes handled by fewer functions.

### A note on Vercel functions

Vercel functions are request/response handlers, not a Node server that remains running. Refactor the routes in `server/auth-server.mjs` to Vercel Function handlers. Keep database access in shared server-only modules. Vercel’s [Node.js Functions documentation](https://vercel.com/docs/functions/runtimes/node-js) covers supported function entry points and request handlers.

Avoid deploying the current `node:http` server as-is. It calls `server.listen()`, opens SQLite at process startup, and assumes a persistent server process. Those assumptions are inappropriate for request-based serverless functions.

## 4. Provision a hosted PostgreSQL database

The Vercel Marketplace supports database providers such as Neon, Supabase, and AWS Aurora PostgreSQL. This guide uses Neon in examples; the same architecture works with another managed PostgreSQL provider.

1. Create the Vercel API project first.
2. In Vercel, open the Marketplace and install a PostgreSQL integration. Choose a provider, plan, project/resource name, and a region available near your users.
3. Connect the database resource to the **API Vercel project**. Do not connect it to the Expo web project unless that project also owns server-side API functions.
4. Create separate development/staging and production database resources or provider-managed branches.
5. Keep the API Functions in a region supported by your provider and near the database. Check the provider and Vercel region lists before choosing; network distance affects database request latency.
6. Confirm the provider uses TLS for database connections and provides a pooled/serverless connection option.
7. Save a backup/restore plan and find the provider’s backup retention and point-in-time recovery settings before storing real employee records.

Vercel Marketplace storage integrations can inject connection variables into the connected Vercel project. Neon’s [serverless driver](https://neon.com/docs/serverless/serverless-driver) supports Node/serverless environments and queries PostgreSQL over HTTP or WebSockets.

### One-time local connection test

Keep the connection string only in a server-side local file such as `backend/.env.local`. It must not be in the Expo app’s `.env` file.

```dotenv
# backend/.env.local -- server only; never commit
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Add a server-side health check that performs a small database query, such as `SELECT 1`, and returns only `{ "ok": true }`. Never return the connection string or database error details to clients.

## 5. Design the PostgreSQL ownership model

Use a relational model. Every employee-owned application row must carry the authenticated employee account ID. The client must never be allowed to choose or override that owner.

An initial schema can use the following shape (adjust lengths and constraints with the implementation):

```sql
CREATE TABLE companies (
  slug text PRIMARY KEY,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE employee_accounts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_slug text NOT NULL REFERENCES companies(slug),
  username text NOT NULL,
  display_name text NOT NULL,
  employee_type text NOT NULL
    CHECK (employee_type IN ('employee', 'merchandiser', 'guard', 'subcontractor')),
  password_salt bytea NOT NULL,
  password_hash bytea NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX employee_accounts_username_lower_idx
  ON employee_accounts (lower(username));

CREATE TABLE auth_sessions (
  token_hash char(64) PRIMARY KEY,
  account_id bigint NOT NULL REFERENCES employee_accounts(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_sessions_account_idx ON auth_sessions(account_id);
CREATE INDEX auth_sessions_expiry_idx ON auth_sessions(expires_at);

CREATE TABLE applications (
  id text PRIMARY KEY,
  account_id bigint NOT NULL REFERENCES employee_accounts(id) ON DELETE CASCADE,
  type text NOT NULL,
  summary text NOT NULL,
  submitted_at date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Approved', 'Disapproved', 'Cancelled')),
  cancellation_reason text,
  details jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX applications_account_date_idx
  ON applications (account_id, submitted_at DESC, created_at DESC);
CREATE INDEX applications_account_type_status_idx
  ON applications (account_id, type, status);
```

`account_id` is the isolation boundary for this app’s employee data. If later adding company-admin screens, separately define company-level authorization; do not let all employees query all accounts just because they share a `company_slug`.

For the current seven demo users, insert their company rows and named accounts into a non-production environment. Hash passwords using the same password-hashing algorithm and parameters as the server. Never store plaintext passwords. Do not run the existing SQLite setup script against the hosted database; write a separate one-off PostgreSQL seeder and make it safe to re-run without creating duplicate users.

## 6. Move authentication into the API

Preserve the current API behavior initially so the Expo client needs minimal routing changes:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Validate username/password, create a server-side session, return an authenticated user payload. |
| `GET` | `/api/auth/me` | Validate the current session and return the authenticated user. |
| `POST` | `/api/auth/logout` | Revoke the current server-side session. |
| `GET` | `/api/healthz` | Check API availability without exposing database or deployment secrets. |

For the first production-capable version, the API can retain the current random bearer-token session pattern:

1. Generate a cryptographically random token on successful login.
2. Return the raw token once to the client over HTTPS.
3. Store only a SHA-256 hash of the token in `auth_sessions`.
4. On protected requests, hash the submitted bearer token, find a non-expired session, and load the account from that session.
5. Never accept `account_id`, `company_slug`, employee name, or role in a client request as proof of identity. Those values are derived from the authenticated session.
6. Revoke the session on logout, account deactivation, and password change; expire it after a documented period.
7. Keep login error messages generic and apply a rate limit using a **shared** limiter/store. The current in-memory `Map` in the local server does not provide a dependable cross-function rate limit.

Use `@neondatabase/serverless` on the server and keep the `DATABASE_URL` out of client code:

```ts
// backend/lib/database.ts -- server-side module only
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required by the API.');
}

export const sql = neon(databaseUrl);
```

This variable must exist only in the Vercel API project and server-local backend environment. Never rename it to `EXPO_PUBLIC_DATABASE_URL`.

### Store sessions appropriately in clients

- **Android:** Store the bearer token in [`expo-secure-store`](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/), not ordinary `AsyncStorage`. If you add the package, install the SDK-compatible version with `npx expo install expo-secure-store`, then rebuild the APK.
- **Web:** Prefer a `Secure`, `HttpOnly` session cookie so JavaScript cannot read the credential. If using cookies across `app.example.com` and `api.example.com`, configure exact-origin CORS with credentials and test the cookie’s `SameSite`/domain behavior in production browsers. Add CSRF protection to cookie-authenticated state changes. Do not reflect arbitrary `Origin` values.
- The current [`src/contexts/auth-context.tsx`](./src/contexts/auth-context.tsx) keeps the token only in React memory; a page/app restart loses the session. Implement session restoration deliberately instead of putting long-lived bearer tokens in browser local storage.

Mobile native requests generally do not rely on browser CORS. CORS is for browsers and must allow the exact production web origin. CORS is not authentication and does not make the API private.

## 7. Move application data to account-scoped API endpoints

Keep the API’s owner derivation server-side:

```text
request
  -> validate session token/cookie
  -> load authenticated account ID
  -> query or modify records for that account ID only
```

Recommended application API:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/applications` | Return only the signed-in account’s records, with optional validated filters. |
| `POST` | `/api/applications` | Create a pending request. Server sets `account_id`, status, ID, and timestamps. |
| `POST` | `/api/applications/:id/cancel` | Cancel a pending request only if it belongs to the current account. |
| `GET` | `/api/dashboard/application-summary` | Return category/status counts for the current account, or derive these from the authorized list. |

Authorization must appear in the SQL itself, not as a UI-only filter:

```sql
-- Read: current_account_id came from the verified session
SELECT id, type, summary, submitted_at, status, cancellation_reason, details
FROM applications
WHERE account_id = $1
ORDER BY submitted_at DESC, created_at DESC;

-- Cancel only a pending row belonging to this account
UPDATE applications
SET status = 'Cancelled',
    cancellation_reason = $2,
    updated_at = now()
WHERE id = $3
  AND account_id = $1
  AND status = 'Pending'
RETURNING id, status, cancellation_reason;
```

Use parameterized queries for all user input. Validate dates, IDs, categories, status filters, and request sizes on the server. Return `404` for an unknown or other-account application rather than disclosing that it exists.

### Keep the dashboard chart consistent

The dashboard currently groups local data by transaction and derives a pending/done split in the UI. Once data is server-backed:

- Derive counts from the same authorized rows returned for the account.
- Define “Done” consistently. In the current UI it means Approved, Disapproved, or Cancelled; Pending remains separate.
- Apply date/category filters server-side or compute against the authorized result set. Never query all users and rely on the client to filter.
- Return zero counts for categories that currently have no requests if the dashboard should keep a stable category list.

## 8. Replace `AsyncStorage` as the source of truth

Update [`src/contexts/demo-submissions-context.tsx`](./src/contexts/demo-submissions-context.tsx) to call the API for list, create, and cancel operations:

1. Wait for authentication/session restoration.
2. Fetch `/api/applications` with the authenticated session.
3. Render the server response as the canonical list.
4. On create/cancel, show loading state, call the API, and use the returned row.
5. Show a clear error and retain the last server data if a request fails. Do not present an unsaved optimistic change as successful.
6. Remove the shared key `rcs-demo-submissions` from the app’s source-of-truth flow. If an offline cache is retained, scope it by immutable account ID, such as `rcs-applications:<accountId>`, and reconcile it with the server.
7. Keep local caches out of account switching and logout flows. Clear sensitive cached data when the account signs out.

For this initial online-first app, require an internet connection for reads/writes and report offline errors clearly. If offline application submission is required later, design a durable upload queue with idempotency keys, conflict handling, and a visible sync state; simply saving requests locally will not sync them.

### Decide how to seed sample application rows

The current `demoApplications` array is bundled into the app and is shared/mutated locally. For a deployed demo, either:

- Seed fictional sample application rows in PostgreSQL for each demo account (each row must have that account’s own `account_id`), or
- Start the demo accounts with no records and let each user create their own.

For independent updates, create separate database rows for each account, even if the initial sample descriptions look similar. Never let one shared seed row be mutable by all seven users.

## 9. Configure environment variables

There are two different kinds of configuration. Keep the separation strict.

### Vercel API project (server-side variables)

Set these in the API project’s Vercel **Settings → Environment Variables**:

| Variable | Example | Secret? | Used by |
|---|---|---:|---|
| `DATABASE_URL` | Provider-issued PostgreSQL connection string | **Yes** | API functions only |
| `AUTH_ALLOWED_ORIGINS` | `https://app.example.com` | No secret, but restrict it | API CORS configuration |
| `NODE_ENV` | Vercel sets this for production | No | Runtime behavior |

Add them separately for Development, Preview, and Production. Use a different database for Preview/Development so a preview deployment cannot modify production records. Vercel environment-variable edits apply to **new deployments**, so redeploy after changing them.

Add a separate variable for the database’s selected provider/region if your connection setup requires it. Do not place a connection string in a Vercel client/build variable.

### Expo app (public, build-time variable)

Set the public API base URL for local Expo development and for production web/mobile bundles:

```dotenv
# Expo app root .env.local -- ignored by Git
EXPO_PUBLIC_AUTH_API_URL=https://api.example.com
```

The project reads this variable statically as `process.env.EXPO_PUBLIC_AUTH_API_URL` in [`src/contexts/auth-context.tsx`](./src/contexts/auth-context.tsx). Use the same production URL for both web and APK.

Expo inlines `EXPO_PUBLIC_` variables into the JavaScript bundle. The URL is not a secret; anyone can inspect the APK and see it. **Never put `DATABASE_URL`, a database password, a private API key, or a signing secret in an `EXPO_PUBLIC_` variable.**

For EAS cloud builds, create `EXPO_PUBLIC_AUTH_API_URL` in the Expo project’s `production` environment and set the production profile’s `"environment": "production"` in `eas.json`. Expo SDK 57’s current [environment-variable guide](https://docs.expo.dev/guides/environment-variables/) and [EAS environment-variable guide](https://docs.expo.dev/eas/environment-variables/) explain build-time variables.

Example `eas.json` for an installable Android APK:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "environment": "development"
    },
    "preview": {
      "distribution": "internal",
      "environment": "preview",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "environment": "production",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

EAS supports APK output when the build profile sets `android.buildType` to `apk`; see [Build APKs with EAS](https://docs.expo.dev/build-reference/apk/). If you prefer Google Play distribution, use the normal AAB build instead.

### Never mix server and app `.env` files

Example separation:

```text
repository root .env.local        EXPO_PUBLIC_AUTH_API_URL only
backend/.env.local                DATABASE_URL and other server-only values
Vercel API project                DATABASE_URL, origin/rate-limit settings
EAS production environment        EXPO_PUBLIC_AUTH_API_URL only
```

The repository ignores `.env*.local`, but still check `git status` before every commit. Do not share `.env.local` values in screenshots, chat, issue descriptions, or logs.

## 10. Deploy in this order

### Phase A: Prepare without real employee data

1. Create a Git branch for the deployment work.
2. Choose a production domain and API domain, such as `app.example.com` and `api.example.com`.
3. Decide whether the demo accounts will remain public test logins. If the site is publicly accessible, assume anyone can use the demo credentials and see/change that demo account’s fictional data.
4. Choose database provider, region, backups, and a separate staging database.
5. Keep production employee data out of the first migration and smoke tests.

### Phase B: Deploy the API and PostgreSQL

1. Provision the PostgreSQL database through Vercel Marketplace or the provider console.
2. Create the API Vercel project. If it shares this repository, set its Root Directory to `backend/`.
3. Add server-side `DATABASE_URL` to the API project’s Development, Preview, and Production environments, each pointing at its correct database.
4. Add the exact production web origin to `AUTH_ALLOWED_ORIGINS`.
5. Implement the API health route, migrations, authentication routes, and account-scoped application routes.
6. Apply schema migrations as a deliberate deployment operation. Use numbered SQL migration files; do not run `CREATE TABLE` on each function invocation.
7. Deploy the API to a preview environment first.
8. Run the API health check. It should return HTTP 200 and a non-sensitive result such as `{"ok":true}`.
9. Run database migration and seed scripts from a trusted local environment or CI job using the appropriate non-production `DATABASE_URL`.
10. Confirm seven demo accounts have the expected names/company slugs and that each password is hashed.
11. Configure rate limiting, request validation, log redaction, database backups, and alerts before real employee data is involved.

### Phase C: Update and deploy the web app

1. Set `EXPO_PUBLIC_AUTH_API_URL` for the web production build.
2. Replace local auth and submission behavior with calls to the deployed API.
3. In the Vercel web project, set the repository root as the project root.
4. Configure the build command as:

   ```text
   npx expo export --platform web
   ```

5. Set the output directory to `dist`. The existing Expo config uses `web.output: "static"`; use the SDK 57 [web publishing guide](https://docs.expo.dev/deploy/web/) for platform-specific details.
6. Deploy a preview, open it in a browser, sign in, create a request, cancel a pending request, and verify a second demo user cannot see those changes.
7. Deploy to the production branch/domain only after the tests below pass.

Expo Router uses file-based routes on both web and native. Test direct page refreshes and deep links in the deployed static web build, not just navigation from the home page. See the [Expo Router guide](https://docs.expo.dev/router/introduction/).

### Phase D: Build and install the APK

1. Add `eas.json` to the app root. **This repository’s `.gitignore` currently ignores `eas.json`; remove that ignore line before adding and committing this file.**
2. Link the project with EAS if it is not already linked. This repository’s `app.json` already has an EAS project ID.
3. Add `EXPO_PUBLIC_AUTH_API_URL=https://api.example.com` to the Expo project’s EAS `production` environment.
4. Ensure the APK profile selects that `production` environment. The API URL is compiled into the APK, so set it before building.
5. Build an APK:

   ```powershell
   npx eas-cli@latest build --platform android --profile production
   ```

6. Download/install the completed APK on a physical Android phone with internet access. Do not use `localhost`, `10.0.2.2`, or your development machine’s LAN address for a production APK.
7. Sign in as one demo account. Create a sample application.
8. Sign in to the web app as that same account and confirm the record appears.
9. Sign in as another demo account on either platform and confirm it cannot view/cancel the first account’s records.
10. Build a new APK whenever the compiled API URL/environment changes. Updating Vercel’s server environment does not rewrite an already-built APK’s JavaScript bundle.

EAS Build produces a remote build artifact; the API and database remain independently deployed services. The APK does not bundle or host the database.

## 11. Development and preview workflow

Use three clearly separated environments:

| Environment | Web URL | API URL | Database |
|---|---|---|---|
| Local development | `http://localhost:8081` | local API or Vercel development API | local/staging DB |
| Preview/testing | Vercel preview URL | preview API | preview DB/branch |
| Production | production web domain | stable API domain | production DB |

Recommended safeguards:

- Do not point Preview at Production.
- Do not use production accounts/passwords in development.
- Make local/preview demo seeds safe to re-run.
- Require explicit confirmation before applying migrations or seeding production.
- Never print passwords, raw session tokens, database URLs, or full sensitive request bodies to logs.
- Record schema changes as migrations and test applying them to an empty database and a recent backup/branch.
- Coordinate API rollout and APK rollout: old APKs may continue using old API contracts until users install an update.

## 12. Security and privacy checklist

Before storing real employee data, confirm all of the following:

- [ ] Database credentials exist only in server-side Vercel variables and trusted server-local environment files.
- [ ] The APK contains only the public HTTPS API URL; inspect a release build/config to verify no database credentials were bundled.
- [ ] HTTPS is used end-to-end. This repository has prototype HTTP integrations; do not send employee credentials or database traffic over plain HTTP.
- [ ] Login uses a strong password hash (the current local server uses `scrypt`) and a shared, durable rate limiter.
- [ ] Demo credentials are not used for employees; remove public demo logins or isolate their data if the app becomes public.
- [ ] Every application SELECT, UPDATE, and DELETE is scoped by server-derived authenticated `account_id`.
- [ ] The API ignores/rejects client-submitted owner IDs and validates all request data.
- [ ] Session tokens are random, hashed at rest, expire, and can be revoked.
- [ ] Native refresh/session credentials use secure device storage; web credentials use a safe cookie/session pattern.
- [ ] CORS allowlists only the production/preview web origins actually required. CORS is not treated as an auth mechanism.
- [ ] Cookie-authenticated writes have CSRF protections.
- [ ] API errors are useful to the client but do not reveal SQL, stack traces, schema, tokens, or secrets.
- [ ] Database backups and restore drills exist; access is limited to the API and authorized operators.
- [ ] Privacy, retention, employee notice/consent, applicable Philippine data-protection obligations, and incident response are reviewed before real employee records are uploaded.
- [ ] The short `demo1234` password remains restricted to fictional demo accounts and a non-production database.

## 13. Acceptance checklist

Do not consider the migration complete until all checks pass:

1. `GET https://api.example.com/api/healthz` returns 200 with no secrets.
2. Valid demo login returns the expected user, company, and a session.
3. Invalid login returns a generic failure and is rate-limited.
4. `GET /api/auth/me` rejects missing, expired, and revoked sessions.
5. A request created from the APK is visible to that same account on web.
6. A request created from web is visible to that same account on the APK.
7. Cancelling a pending request is reflected on both clients after refresh.
8. Account B cannot read or cancel Account A’s request by changing an ID in the URL/body.
9. One account’s dashboard category/status totals do not include another account’s requests.
10. Refreshing web and restarting the APK restore or cleanly request authentication according to the chosen session policy.
11. Taking the API or network offline displays an error instead of reporting a request as saved.
12. A database restore test can recover the data to a known point in time.
13. The production APK points at the stable HTTPS API domain, not a preview deployment or local address.

## 14. Suggested implementation sequence for this repository

Use separate reviewable changes in this order:

1. Add a server-only backend directory and a PostgreSQL connection module.
2. Translate `companies`, `employee_accounts`, and `auth_sessions` from [`server/schema.sql`](./server/schema.sql) into versioned PostgreSQL migrations.
3. Convert login, current-user, logout, and health handling from [`server/auth-server.mjs`](./server/auth-server.mjs) into Vercel Node.js Functions.
4. Add authenticated applications list/create/cancel endpoints with account ownership enforced in SQL.
5. Add a one-time demo-account/sample-data seeder for a non-production database.
6. Update `AuthProvider` to restore and send sessions safely on web and native.
7. Replace `AsyncStorage`-only application mutations in `DemoSubmissionsProvider` with the API as the source of truth.
8. Add account-switching, cross-device, unauthorized-account, error, and offline tests.
9. Deploy a preview API + preview database, and then test the existing web app against it.
10. Set the same production API base URL for the Expo web project and EAS Android build, then deploy the web build and produce/install the APK.

Do not start by exporting or copying the local SQLite database file to Vercel. SQLite files in this repository are intentionally ignored, and a local SQLite file is not a durable shared database for Vercel Functions.

## 15. Official references

Documentation checked for this guide:

- [Expo SDK 57 environment variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo EAS environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo SecureStore for SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/)
- [Expo APK builds](https://docs.expo.dev/build-reference/apk/)
- [Expo web deployment](https://docs.expo.dev/deploy/web/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel Marketplace storage](https://vercel.com/docs/marketplace-storage)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
