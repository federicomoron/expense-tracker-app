# Copilot Instructions for Expense Tracker App

## Project Overview

- **Framework:** Angular 19+ (standalone components, signals, RxJS)
- **UI:** Angular Material with custom theming (`src/theme/custom-theme.scss`)
- **Architecture:** Modular feature-based structure, with clear separation between `core` (services, models, guards), `features` (domain modules), `shared` (reusable UI components, helpers), and `layouts` (shell/fullscreen).

## Key Directories

- `src/app/core/`: Global services, guards, interceptors, constants, models.
- `src/app/features/`: Feature modules (auth, expenses, groups).
- `src/app/shared/`: Reusable UI components, helpers, and styles.
- `src/app/layouts/`: App shell and fullscreen layouts.
- `src/app/app.routes.ts`: Central route definitions, lazy loading via `loadChildren` and `loadComponent`.

## Routing & Layouts

- Authenticated routes use `authGuard` and `AppLayoutComponent`.
- Dialogs (e.g., expense/group forms) often use `FullscreenLayoutComponent` for modal-like flows.
- Feature modules are lazy-loaded for scalability.

## UI Patterns

- **Standalone Components:** Most components are standalone; import dependencies directly in `@Component`.
- **Dialogs:** Use Angular Material dialogs, often with full-screen or custom styles (`@shared/styles/dialog-common.scss`).
- **Signals:** State management uses Angular signals (`signal`, `computed`) for reactivity.
- **Selectors/Dialogs:** Expense forms use modular selectors (category, currency, split-type) as reusable components.

## Developer Workflows

- **Install dependencies:** `yarn install`
- **Start local server:** `yarn start` (runs at `http://localhost:4200`)
- **Build:** `yarn build`
- **Test:** `yarn test` (Karma/Jasmine)
- **Lint:** `yarn lint` (ESLint + Prettier enforced)
- **Auto-fix:** `yarn lint:fix`
- **Format:** `yarn format`
- **Check formatting:** `yarn format:check`
- **CI:** GitHub Actions pipeline in `.github/workflows/ci.yml` runs lint, build, and tests on push/PR.

## Conventions

- **SCSS:** All styles use SCSS; theming via `theme/` and global variables.
- **Imports:** Use path aliases (`@core`, `@features`, `@shared`, etc.) for maintainability.
- **Error Handling:** User-facing errors are shown via `SnackbarService`.
- **Dialogs:** Always close dialogs via `MatDialogRef`; pass data via `MAT_DIALOG_DATA`.
- **Routing:** Use Angular's router for navigation; avoid direct DOM manipulation.

## Integrations

- **API:** All backend communication via services in `core/services/`, using endpoints from `core/constants/api-endpoints.ts`.
- **Environment Configs:** Use `environments/` for dev/prod settings.
- **Assets:** Static files in `assets/`.

## Examples

- **Lazy-loaded route:** See `app.routes.ts` for `loadChildren` usage.
- **Dialog pattern:** See `features/expenses/components/paid-by-dialog/paid-by-dialog.component.ts`.
- **Signal usage:** See `features/groups/groups.component.ts` for state and computed properties.

## Tips for AI Agents

- Prefer creating new standalone components for UI features.
- Reuse shared modules/components where possible.
- Follow existing patterns for dialogs, selectors, and error handling.
- Refer to `README.md` for setup commands and workflows.
