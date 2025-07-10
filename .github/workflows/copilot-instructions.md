# Copilot Instructions for Expense Tracker App

## Project Overview

- **Framework:** Angular 19+ using standalone components, signals, and RxJS.
- **UI:** Angular Material with custom theming (`src/theme/custom-theme.scss`).
- **Architecture:** Modular feature-based structure with clear separation between:
  - `core/`: services, models, guards, interceptors, constants.
  - `features/`: domain modules (auth, expenses, groups).
  - `shared/`: reusable UI components, helpers, styles.
  - `layouts/`: app shell and fullscreen layouts.

## Key Directories

- `src/app/core/` – global services, guards, interceptors, constants, models.
- `src/app/features/` – feature modules (auth, expenses, groups).
- `src/app/shared/` – reusable UI components, helpers, styles.
- `src/app/layouts/` – app shell and fullscreen layouts.
- `src/app/app.routes.ts` – central route definitions, lazy loading via `loadChildren` and `loadComponent`.

## Routing & Layouts

- Authenticated routes use `authGuard` and `AppLayoutComponent`.
- Routes are lazy-loaded with standalone components using `loadChildren` and `loadComponent`.
- Dialogs (e.g., expense/group forms) use Angular Material dialogs with full-screen or custom styles (`@shared/styles/dialog-common.scss`).
- Avoid direct DOM manipulation; use Angular router and idiomatic patterns.

## UI Patterns & State Management

- Use standalone components everywhere; import dependencies directly in `@Component`.
- Dialogs use Angular Material dialogs; always close via `MatDialogRef` and pass data with `MAT_DIALOG_DATA`.
- State management uses Angular Signals (`signal`, `computed`) for reactivity and performance.
- Modular selectors (category, currency, split-type) are reusable components inside forms.
- Follow reactive forms or signals-based forms patterns consistently.

## Developer Workflows

- Install dependencies: `yarn install`
- Start local server: `yarn start` (http://localhost:4200)
- Build: `yarn build`
- Test: `yarn test` (Karma/Jasmine)
- Lint: `yarn lint` (ESLint + Prettier enforced)
- Auto-fix lint: `yarn lint:fix`
- Format code: `yarn format`
- Check formatting: `yarn format:check`
- CI runs lint, build, tests on push/PR via GitHub Actions (`.github/workflows/ci.yml`).

## Code Conventions

- SCSS for all styles; theming and variables in `src/theme/`.
- Use path aliases (`@core`, `@features`, `@shared`) for imports.
- Use single quotes for strings.
- Max line length 120 characters.
- Error handling shows user-facing messages via `SnackbarService`.
- Commit messages follow conventional commits (`feat:`, `fix:`, `refactor:`).

## Integrations

- All backend communication through services in `core/services/`.
- API endpoints declared in `core/constants/api-endpoints.ts`.
- Environment configs under `environments/`.
- Static assets inside `assets/`.

## Examples & References

- Lazy-loaded route example in `app.routes.ts`.
- Dialog pattern example: `features/expenses/components/paid-by-dialog/paid-by-dialog.component.ts`.
- Signal usage example: `features/groups/groups.component.ts`.

## Tips for AI Agents

- Prefer creating new standalone components for UI features.
- Reuse shared modules/components where possible.
- Follow existing dialog, selector, and error handling patterns.
- Use Angular signals (`signal`, `computed`) for reactive state.
- Avoid imperative DOM manipulation; rely on Angular idioms and router.
- Follow commit conventions and code style consistently.
- Refer to `README.md` for commands and developer workflows.
