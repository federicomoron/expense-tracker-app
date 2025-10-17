# Spendly - Expense Tracker Angular 20+ App

**Spendly** is a modern, modular, mobile-first web application to manage **group and personal expenses**, inspired by Splitwise. Built with **Angular 20**, standalone components, Signals, and a clean architecture.

![CI Pipeline](https://github.com/federicomoron/expense-tracker-app/actions/workflows/ci.yml/badge.svg)

---

## ✨ Features

- Google authentication (login/register) and route guards.
- Create and manage expense groups (Family, Personal, Trips).
- Add expenses with currency, category, and split-type selectors.
- Reusable dialog components for forms (Angular Material).
- Multi-currency per expense (group-level coming soon).
- Fully responsive, mobile-first design.
- Light/Dark theme toggle _(WIP)_.
- Modular architecture: core, features, shared, layouts.
- Configurable theming via SCSS and Angular Material.
- Production build served locally with `serve`.
- Automated linting, formatting, testing, and CI/CD pipeline.

---

## 🌐 Tech Stack

- Angular 20+ (standalone components + Signals)
- Angular Material (custom theme)
- TypeScript
- RxJS
- Modular SCSS
- ESLint + Prettier
- Husky + lint-staged + commitlint
- GitHub Actions (CI/CD)

---

## 🏢 Project Structure

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

---

## 🚀 Installation & Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/federicomoron/expense-tracker-app.git
   cd expense-tracker-app
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Run the app in development mode:

   ```bash
   yarn start
   # Open http://localhost:4200 in your browser
   ```

4. Production build and local simulation:
   ```bash
   yarn build
   yarn start:prod
   # Open http://localhost:8080
   ```

---

## 🔧 Available Scripts

- `yarn start` - Angular dev server
- `yarn build` - Production build
- `yarn start:prod` - Serve build with `serve` on port 8080
- `yarn lint` - Lint with ESLint
- `yarn lint:fix` - Auto-fix lint
- `yarn format:check` - Check formatting with Prettier
- `yarn format:fix` - Format with Prettier
- `yarn test` - Run tests (Karma/Jasmine)
- `yarn test:watch` - Watch mode tests
- `yarn check:types` - TypeScript type check
- `yarn genc <Name>` - Generate standalone component (see scripts/generate-component.js)

---

## 🧑‍💻 Best Practices

- Use standalone components and signals for reactive state.
- Prefer lazy loading and guards for protected routes.
- Keep modular structure (core, features, shared, layouts).
- Use lint, format, and test scripts before committing.
- Use commit conventions: `feat:`, `fix:`, `refactor:`.
- Document relevant changes in this README and copilot-instructions.md.

---

## 🧩 Useful Resources

- [Angular Signals](https://angular.dev/reference/signals)
- [Angular Standalone Components](https://angular.dev/guide/standalone-components)
- [Angular Material](https://material.angular.io/)
- [GitHub Copilot Docs](https://docs.github.com/en/copilot)

---

## ✨ Author

**Federico Morón**

📧 [federicomoron8@gmail.com](mailto:federicomoron8@gmail.com)
🔗 [LinkedIn](https://www.linkedin.com/in/federicomoron/)
