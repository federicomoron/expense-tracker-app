# 🧠 Copilot Instructions for Spendly (Angular 20+ Expense Tracker)

## 🚀 Project Overview

Spendly is a modern, modular, mobile-first expense tracking web app built with Angular 20 using:

- ✅ Standalone Components
- ✅ Angular Signals for reactive state
- ✅ Angular Material (custom theming in `src/theme/custom-theme.scss`)
- ✅ Feature-based architecture
- ✅ Fully lazy-loaded routing with `loadComponent` / `loadChildren`
- ✅ Protected routes with `authGuard`
- ✅ Signal-based or Reactive Forms
- ✅ CI via GitHub Actions

---

## 📁 Project Structure

src/
├── app/
│ ├── core/ # Global services, guards, interceptors, models, constants
│ │ ├── services/
│ │ ├── guards/
│ │ ├── interceptors/
│ │ ├── models/
│ │ └── constants/
│ ├── features/ # Feature modules (auth, expenses, groups, etc.)
│ │ ├── auth/
│ │ ├── expenses/
│ │ └── groups/
│ ├── layouts/ # App shell layout (with sidenav) and FullscreenLayout
│ ├── shared/ # UI components, custom pipes, inputs, selectors
│ └── app.routes.ts # Main routing file with loadChildren and canActivate
├── assets/ # Static assets
├── environments/ # Environment files
├── theme/ # Custom Angular Material theming

---

## 🔐 Routing & Layouts

- Public routes (login/register) use `FullscreenLayoutComponent`.
- Protected routes use `AppLayoutComponent` and `authGuard`.
- Routing is lazy-loaded and standalone-based:

```ts
{
  path: 'groups',
  canActivate: [authGuard],
  loadChildren: () => import('@features/groups/routes').then(m => m.GROUP_ROUTES)
}

```

## 🧱 Dialogs

Dialogs use Angular Material:

- Use MAT_DIALOG_DATA to inject data.
- Use MatDialogRef to close dialogs and return results.

## ⚙️ State & Forms

- Use Angular Signals (signal(), computed()) for reactive state.
- Prefer signals-based forms.
- If using FormGroup, maintain a reactive logic flow.
- Create reusable form components:
  e.g. category-selector, currency-selector.

Guidelines:

- Avoid document.querySelector or direct DOM access.
- Forms must be isolated in dedicated components (\*FormComponent).
- Form logic should stay self-contained and reactive.

## 🧩 UI & UX Patterns

- UI built with Angular Material.
- Use shared components from shared/.
- Snackbar service handles toast notifications (via SnackbarService).
- Show user errors cleanly (e.g. login failed, group not created).
- Layouts use mat-sidenav-container with responsive behavior.

## 🧪 Development Workflow

```txt
yarn install       # Install dependencies
yarn start         # Start dev server (http://localhost:4200)
yarn build         # Build production
yarn test          # Run unit tests
yarn lint          # Run ESLint
yarn lint:fix      # Fix ESLint errors
yarn format        # Format code with Prettier
yarn format:check  # Check formatting
```

CI runs on push via GitHub Actions: .github/workflows/ci.yml.

## 📏 Code Style & Conventions

- SCSS with BEM-like naming
- Single quotes (') for strings
- Max line length: 120
- Commit style: Conventional Commits:

```txt
  feat: add group form
  fix: login error handling
  refactor: move dialog to standalone
```

- Path aliases:
  @core → src/app/core
  @features → src/app/features
  @shared → src/app/shared

## 🔌 Backend Integration

- API via services in core/services/
- Endpoints defined in core/constants/api-endpoints.ts
- Auth token is managed automatically via interceptor
- Backend errors transformed before showing to users

## ✅ Copilot Code Examples

- Lazy Route (Groups)
  src/app/app.routes.ts → loadChildren(...)
- Dialog Example
  features/expenses/components/paid-by-dialog/
- Signals Usage
  features/groups/groups.component.ts → signal(), computed()
- Custom Selector
  shared/components/category-selector/

## 💡 AI & Copilot Guidelines

- Always generate standalone components
- Use Angular Signals (signal, computed) for reactive state
- Reuse shared modules, selectors and dialogs from shared/
- Follow existing form and error handling patterns
- For new features, create:
  - A folder in features/
  - A routes.ts file
  - A form component
  - A service in core/services/ if backend is needed
- Avoid imperative DOM manipulation; use Angular idioms
- Respect folder boundaries: core/, features/, shared/
- Match existing naming and folder conventions
- Follow conventional commits and project code style
- Refer to README.md for commands and developer workflow
