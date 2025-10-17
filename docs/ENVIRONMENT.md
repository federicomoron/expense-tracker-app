# Environment variables and build integration

## Overview

This project uses simple .env files to configure runtime/build-time variables (API URL, feature flags, etc.). We generate Angular `src/environments/environment.ts` files at build/serve/test time using `scripts/generate-env.js`. This avoids hardcoding sensitive URLs or other constants in the repository.

## Files

- `.env.development` - local development variables (not committed)
- `.env.production` - local production/test variables (not committed)
- `src/environments/environment.ts` - generated at build time for development
- `src/environments/environment.prod.ts` - generated at build time for production

## Structure

Each env file is simple KEY=VALUE pairs. Prefer plain names (example: `API_URL`). For backward compatibility the generator also accepts variables prefixed with `VITE_` (e.g. `VITE_API_URL`) and will normalize them to the plain key.

Example `.env.development`:

```
API_URL=http://localhost:8081/api
FEATURE_FLAG_X=true
```

Example `.env.production`:

```
API_URL=https://spend-track-api-1.onrender.com/api
```

## How it works

1. Before running `ng serve`, `ng build`, or `ng test`, we run `node ./scripts/generate-env.js [development|production]` which:
   - loads `.env.development` or `.env.production` from project root
   - merges with `process.env` (CI / Vercel environment variables override .env)
   - strips `VITE_` prefix (if present) and writes values into `src/environments/environment(.prod).ts`
2. The Angular code imports `src/environments/environment` at runtime and reads variables from there (see `EnvironmentService`).

## Using in code

Import the `EnvironmentService` and call `env.apiUrl` or `env.get('API_URL')`.

## Vercel integration

1. In Vercel dashboard, set project Environment Variables (for both Preview and Production) with the same names you use locally (e.g. `VITE_API_URL` or `API_URL`).
2. Vercel will expose those values in `process.env` during build. Our generator reads `process.env` and will therefore pick them up and generate proper `environment.prod.ts`.
3. No runtime replacement is needed because Angular bundles the generated `environment.prod.ts` into the built app.

## Yarn vs npm

This repo uses Yarn in development. The scripts were added to `package.json` and work with `yarn` as well. Examples:

Development (yarn):

```
yarn start
```

Build (yarn):

```
yarn build
```

## CI / Vercel

When configuring Vercel, use `yarn build` as the build command (or keep Vercel's default if it runs `yarn build`). The `yarn build` command will execute the generator first (via `node ./scripts/generate-env.js production`) and then run the Angular production build.

## Notes and caveats

- Since Angular bundles the environment values at build time, variables are not secret on the client. Only use public-facing configuration here (API endpoints, feature flags). Secrets must remain on server-side.
- Ensure `.env.*` files are ignored by git (this repo already lists them in `.gitignore`).
- If you want runtime-configurable values (changeable after deployment), consider shipping a small `/config.json` endpoint and fetching it at app bootstrap instead.

## Next steps

- Optionally, add CI steps to set `NODE_ENV=production` and run the generator before build.
- Add small unit tests for `scripts/generate-env.js` if desired.

# Environment variables and build integration

## Overview

This project uses simple .env files to configure runtime/build-time variables (API URL, feature flags, etc.). We generate Angular `src/environments/environment.ts` files at build/serve/test time using `scripts/generate-env.js`. This avoids hardcoding sensitive URLs or other constants in the repository.

## Files

- `.env.development` - local development variables (not committed)
- `.env.production` - local production/test variables (not committed)
- `src/environments/environment.ts` - generated at build time for development
- `src/environments/environment.prod.ts` - generated at build time for production

## Structure

Each env file is simple KEY=VALUE pairs. Keys may be prefixed with `VITE_` (from earlier Vite experimentation) or plain. The generator normalizes both so you can use either.

Example `.env.development`:

VITE_API_URL=http://localhost:8081/api
FEATURE_FLAG_X=true

Example `.env.production`:

VITE_API_URL=https://spend-track-api-1.onrender.com/api

## How it works

1. Before running `ng serve`, `ng build`, or `ng test`, we run `node ./scripts/generate-env.js [development|production]` which:
   - loads `.env.development` or `.env.production` from project root
   - merges with `process.env` (CI / Vercel environment variables override .env)
   - strips `VITE_` prefix (if present) and writes values into `src/environments/environment(.prod).ts`
2. The Angular code imports `src/environments/environment` at runtime and reads variables from there (see `EnvironmentService`).

## Using in code

Import the `EnvironmentService` and call `env.apiUrl` or `env.get('API_URL')`.

## Vercel integration

1. In Vercel dashboard, set project Environment Variables (for both Preview and Production) with the same names you use locally (e.g. `VITE_API_URL` or `API_URL`).
2. Vercel will expose those values in `process.env` during build. Our generator reads `process.env` and will therefore pick them up and generate proper `environment.prod.ts`.
3. No runtime replacement is needed because Angular bundles the generated `environment.prod.ts` into the built app.

## Notes and caveats

- Since Angular bundles the environment values at build time, variables are not secret on the client. Only use public-facing configuration here (API endpoints, feature flags). Secrets must remain on server-side.
- Ensure `.env.*` files are ignored by git (this repo already lists them in `.gitignore`).
- If you want runtime-configurable values (changeable after deployment), consider shipping a small `/config.json` endpoint and fetching it at app bootstrap instead.

## Next steps

- Optionally, add CI steps to set `NODE_ENV=production` and run the generator before build.
- Add small unit tests for `scripts/generate-env.js` if desired.
