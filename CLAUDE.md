# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Spendly** — Angular 20 expense-tracker app (Splitwise-style: group and personal expenses). Standalone components, Signals, mobile-first, Angular Material. Deployed on Vercel; API is a separate backend (`API_URL` env var).

## Commands

Package manager is **Yarn** (not npm).

- `yarn start` — dev server (generates `environment.ts` from `.env.development` first, then `ng serve`)
- `yarn build` — production build (generates `environment.prod.ts` from `.env.production`/CI env vars first)
- `yarn start:prod` — serve the production build locally via `serve` on port 8080
- `yarn test` / `yarn test:watch` — Karma/Jasmine tests
  - Single test file: pass a filter via Karma, e.g. `yarn test --include='**/expenses.service.spec.ts'`
- `yarn check:types` — `tsc --noEmit`
- `yarn lint` / `yarn lint:fix` — ESLint (flat config, `eslint.config.js`)
- `yarn format:check` / `yarn format:fix` — Prettier
- `yarn genc <Name>` — generate a standalone component via `scripts/generate-component.js`

Husky + lint-staged + commitlint run on commit; commits follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`, etc. — check `git log` for exact scope style, e.g. `perf(scope): message`).

## Environment variables

Runtime config (`API_URL`, feature flags) is **not** hardcoded — `scripts/generate-env.js` reads `.env.development`/`.env.production` (merged with `process.env`, so CI/Vercel vars override local files) and writes `src/environments/environment(.prod).ts` before every serve/build/test. Access values in code via `EnvironmentService` (`env.apiUrl`, `env.get('KEY')`), never by importing `environment.ts` directly in feature code. Full details: `docs/ENVIRONMENT.md`.

## Architecture

Path aliases (see `tsconfig.json`) are the source of truth for module boundaries — always import via alias, not relative paths across top-level folders:

```
@config/*      src/app/config/*        Angular app config, DI providers, i18n/auth initializers
@core/*        src/app/core/*          cross-cutting: guards, interceptors, models, constants, services
@services/*    src/app/core/services/*
@constants/*   src/app/core/constants/*
@models/*      src/app/core/models/*
@features/*    src/app/features/*      domain modules: auth, expenses, groups, account
@layouts/*     src/app/layouts/*       AppLayoutComponent (header+footer), FullscreenLayoutComponent
@shared/*      src/app/shared/*        reusable ui/components/pipes/helpers/utils, not domain-specific
@routes/*      src/app/routes/*        app.routes.ts (top-level route table)
@environments/* src/environments/*     generated files, do not hand-edit
```

- **Bootstrap is standalone**, not NgModule-based: `main.ts` calls `bootstrapApplication(AppComponent, appConfig)`. `app.module.ts`/`app-routing.module.ts` still exist in the tree but are legacy/unused vestiges — do not add routes or providers there; extend `app.routes.ts` and `app.config.ts` instead.
- **Routing** (`src/app/routes/app.routes.ts`) is fully lazy-loaded per route via `loadComponent`/`loadChildren`, and mixes two layout shells at the top level: routes needing the full chrome nest under `AppLayoutComponent`, routes needing a bare fullscreen shell (group creation, group totals, expense form/detail) nest under `FullscreenLayoutComponent`. Route guards (`authGuard`, `groupGuard`, `loginGuard` in `@core/guards`) are applied via `canActivate`/`canActivateChild` at the layout or route-group level, not per-leaf-component.
- **Feature modules** under `@features/*` (auth, expenses, groups, account) each own their routes file (e.g. `groups.routes.ts`) and internal `components/` subfolder for feature-scoped UI; cross-feature reusable UI belongs in `@shared`, not duplicated per feature.
- **Services are `providedIn: 'root'`** singletons using `inject()` (not constructor injection). HTTP calls go through a shared `HttpService` wrapper (`@services/http.service.ts`) rather than `HttpClient` directly, so error handling/interceptors stay centralized (`api-error.interceptor.ts`, `auth-token.interceptor.ts`).
- **State**: Signals are the default reactive primitive (see `GroupContextService`, computed signals in list/totals components) rather than component-level RxJS subjects; RxJS is still used for HTTP streams and interop.
- **i18n**: `@ngx-translate` with JSON files under `assets/i18n/`, initialized via `APP_INITIALIZER` (`i18nInitializer`) so translations are loaded before the app renders; language persisted in `localStorage` (`lang` key).
- **Theming**: SCSS-based Angular Material theming under `src/theme/`, applied pre-bootstrap via `applyTheme()` in `main.ts` (avoids a flash of unstyled/wrong theme).
- **PWA**: `provideServiceWorker`, config in `ngsw-config.json`; install-prompt handling lives in `PwaInstallService`.

## Conventions

- New components should be standalone and use Signals for local reactive state; generate them with `yarn genc` to match existing conventions.
- Directive selectors must use the `app` prefix, camelCase (enforced by ESLint `@angular-eslint/directive-selector`).
- Import order is enforced by `eslint-plugin-import` (builtin → external → internal → parent → sibling → index, alphabetized, blank line between groups).
- `no-floating-promises` and `eqeqeq` are ESLint errors — always `await`/handle promises and use `===`.

## Working with this repo (Claude Code workflow)

This is a solo project also used as a portfolio piece for interviews — favor current Angular idioms (standalone, Signals, `inject()`) and clean architecture over shortcuts.

**End-of-task commit proposal**: When the user signals they're done reviewing/testing (e.g. "todo listo", "listo", "todo correcto", "ok, todo bien", or an equivalent phrase), first confirm with the user before acting (e.g. "¿Confirmás que analice los cambios y te pase los mensajes de commit con los archivos correspondientes a cada uno?"). If they confirm:

1. Review all pending changes (`git status`, `git diff` working tree and staged).
2. Verify the changes are coherent with the task discussed in the conversation (not just that they compile).
3. Group modified files into logical, separate commits (don't bundle unrelated changes into one commit).
4. For each proposed commit, list the files included and a Conventional Commits message matching the project's existing style (check `git log` for exact phrasing/scope conventions).
5. **Do not run the commits** — only present the proposal; the user reviews and commits by hand.

If something looks incorrect, incomplete, or inconsistent with the task during this review, flag it before proposing commits.
