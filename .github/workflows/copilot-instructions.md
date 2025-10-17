
# 🧠 Copilot Instructions for Spendly (Angular 20+ Expense Tracker)

---


## 🚀 Project Overview

Spendly is a modern, modular, mobile-first expense tracking web app built with Angular 20. Key features and architecture:

- ✅ Standalone Components (Angular 20)
- ✅ Angular Signals for reactive state
- ✅ Angular Material dialogs and custom theming (`src/theme/custom-theme.scss`, `app-variables.scss`, `app-variables-dark.scss`)
- ✅ Feature-based modular architecture (core, features, shared, layouts)
- ✅ Routing with `loadComponent` and `loadChildren`, organized by layouts (`AppLayoutComponent`, `FullscreenLayoutComponent`)
- ✅ Route protection with `authGuard`, `groupGuard`, and `loginGuard`
- ✅ Signal-based or Reactive Forms
- ✅ API endpoints and services centralized in `core/constants/api-endpoints.ts` and `core/services/`
- ✅ Automated testing, linting, formatting, and CI/CD via GitHub Actions

This context ensures Copilot and developers have the best guidance for code suggestions and workflow.

---

---

## 🌍 Language, Commit Convention & Best Practices

- All Copilot answers and assistant responses will be in **Spanish** for clarity and workflow.
- All generated code, commit messages, and code comments must be in **English** and follow modern conventions (e.g., Conventional Commits: `feat:`, `fix:`, `refactor:`).
- Example commit messages:
  - `feat: add expense group form`
  - `fix: handle login error`
  - `refactor: migrate dialog to standalone`
- Prefer standalone components and signals for reactive state.
- Use lazy loading and guards for protected routes.
- Keep modular structure: core/, features/, shared/, layouts/.
- Use lint, format, and test scripts before committing.
- Document relevant changes in README.md and copilot-instructions.md.

---

## 🏢 Project Structure & Architecture

Spendly uses a modular, feature-based architecture for scalability and maintainability:

```txt
src/
├── app/
│   ├── core/         # Global services, guards, interceptors, models, constants
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── models/
│   │   └── constants/
│   ├── features/     # Domain modules (auth, expenses, groups, account)
│   │   ├── auth/
│   │   ├── expenses/
│   │   ├── groups/
│   │   └── account/
│   ├── layouts/      # App shell and FullscreenLayout
│   ├── shared/      # UI components, pipes, helpers, styles, utils
│   │   ├── components/
│   │   ├── data/
│   │   ├── helpers/
│   │   ├── pipes/
│   │   ├── styles/
│   │   ├── ui/
│   │   └── utils/
│   ├── routes/       # Main routing (app.routes.ts)
│   ├── config/       # Global configuration
│   └── app.component.*
├── theme/            # SCSS theming (variables, mixins, palettes)
├── environments/     # Dev/prod configs
├── assets/           # Images, icons, i18n
├── styles.scss       # Global styles
└── main.ts           # Entry point
```

**Key Patterns:**
- Standalone components and signals for reactive state
- Lazy loading and guards for protected routes
- Shared UI and logic in shared/
- Feature modules for domain logic

---

## 🔗 Routing & Layouts

- Public routes (login/register) use `FullscreenLayoutComponent`.
- Protected routes use `AppLayoutComponent` and `authGuard`.
- Routing is lazy-loaded and standalone-based:

```typescript
{
  path: 'groups',
  canActivate: [authGuard],
  loadChildren: () => import('@features/groups/routes').then(m => m.GROUP_ROUTES)
}
```

---

## 🧱 Dialogs & Forms

- Dialogs use Angular Material (`MatDialog`, `MAT_DIALOG_DATA`, `MatDialogRef`).
- Prefer signals-based forms for reactivity.
- Create reusable form components (e.g. category-selector, currency-selector).
- Form logic should be self-contained and reactive.

---

## 🧪 Testing & CI/CD

- Unit tests: `yarn test` (Karma/Jasmine)
- Watch mode: `yarn test:watch`
- Lint: `yarn lint`, auto-fix: `yarn lint:fix`
- Format: `yarn format:check`, `yarn format:fix`
- CI/CD: GitHub Actions (`.github/workflows/ci.yml`)

---

## 🔌 Backend Integration

- API calls via services in `core/services/`
- Endpoints defined in `core/constants/api-endpoints.ts`
- Auth token managed via interceptor
- Backend errors transformed before showing to users

---

## 🚀 Overview

Spendly is a modular, mobile-first expense tracker built with Angular 20, standalone components, signals, and a clean, feature-based architecture.

---

## 🏗️ Copilot Tips for Angular 20+

- **Standalone Components**: Ask Copilot to generate standalone components using Angular 20.
  - Example: "Generate a standalone category selector component with Angular Material."
- **Angular Signals**: Request examples of signal() and computed for reactive state.
  - Example: "How do I use signal() and computed() to manage expense form state?"
- **Lazy Routing**: Ask for lazy routes using loadComponent/loadChildren.
  - Example: "Add a lazy route for the groups module with authGuard."
- **Material Dialogs**: Request examples of dialogs with MAT_DIALOG_DATA and MatDialogRef.
- **Reactive Forms and Signals**: Ask for forms with reactive logic and reusable components.
- **Refactoring**: Request refactoring of services, components, or moving logic to shared/core/features.
- **Testing**: Ask for unit test examples for services, guards, or components.

---

## ⚡ Useful Prompts for Copilot

- "Generate an Angular guard to protect group routes."
- "Add lazy loading to the expenses route."
- "Refactor the Snackbar service to use signals."
- "Suggest unit tests for the login component."
- "Add a pipe to format amounts in ARS/USD."

---

## 🛠️ Workflow & Scripts

- `yarn start`         - Angular dev server
- `yarn build`         - Production build
- `yarn start:prod`    - Serve build with `serve` on port 8080
- `yarn lint`          - Lint with ESLint
- `yarn lint:fix`      - Auto-fix lint
- `yarn format:check`  - Check formatting with Prettier
- `yarn format:fix`    - Format with Prettier
- `yarn test`          - Run tests (Karma/Jasmine)
- `yarn test:watch`    - Watch mode tests
- `yarn check:types`   - TypeScript type check
- `yarn genc <Name>`   - Generate standalone component (see scripts/generate-component.js)

---

## 📚 Resources
- [Angular Signals](https://angular.dev/reference/signals)
- [Angular Standalone Components](https://angular.dev/guide/standalone-components)
- [Angular Material](https://material.angular.io/)
- [GitHub Copilot Docs](https://docs.github.com/en/copilot)

---

**Use Copilot as your real copilot to accelerate development and maintain quality in Spendly.**
