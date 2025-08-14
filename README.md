# Spendly - Expense Tracker Angular App

**Spendly** is a modern, modular and mobile-first web application to manage **group and personal expenses**, inspired by Splitwise.  
Built with **Angular 20**, **standalone components**, **Signals**, and a clean architecture ready for production-grade projects.

![CI Pipeline](https://github.com/federicomoron/expense-tracker-app/actions/workflows/ci.yml/badge.svg)

## ✨ Features

- Authentication with Google (login/register) and route guards.
- Create and manage expense groups (Family, Personal, Trips).
- Add expenses with currency, category, and split-type selectors.
- Reusable dynamic dialog components for form inputs.
- Multi-currency support per expense (group-level coming soon).
- Fully responsive, mobile-first design.
- Light/Dark theme toggle _(WIP)_
- Modular and clean architecture with core, features, shared, layouts.
- Configurable theming via SCSS and Angular Material.
- Build served locally with `serve` package for production simulation.
- Automated linting, formatting, testing, and CI/CD pipeline.

## 🌐 Tech Stack

- Angular 20+ (standalone components + Signals)
- Angular Material (custom theming)
- TypeScript
- RxJS
- SCSS (theme-based)
- ESLint + Prettier
- Husky + lint-staged + commitlint
- GitHub Actions for CI/CD

## 🏢 Project Structure

```txt
src/
├── app/
│ ├── core/            # Interceptors, services, guards, models
│ │ ├── services/      # HTTP + logic services
│ │ └── interceptors/  # Auth interceptor
│ ├── features/        # Domain features (auth, groups, expenses)
│ │ └── groups/        # Create, list and manage expense groups
│ ├── layouts/         # Application and fullscreen layouts
│ ├── shared/          # UI components, Material module, styles
│ │ ├── components/    # Reusable UI components
│ │ ├── directives/    # Custom directives
│ │ ├── pipes/         # Shared pipes
│ │ └── material.module.ts
│ ├── app.routes.ts    # Routing configuration
│ ├── app.config.ts    # App-level providers and config
│ └── app.component.ts # Root component
├── theme/             # SCSS theming (variables, mixins, palettes)
├── environments/      # Dev/prod environment configs
├── assets/            # Images, icons, fonts
├── styles.scss        # Global styles
└── main.ts            # Entry point
```

## 🚀 Getting Started

1. Clone the repository:
   git clone https://github.com/federicomoron/expense-tracker-app.git
   cd expense-tracker-app

2. Install dependencies:
   yarn install

3. Run the app locally:
   yarn start
   - Open http://localhost:4200 in your browser.

## 🔧 Available Scripts

- yarn lint - Lint code with ESLint
- yarn lint:fix - Auto-fix lint errors
- yarn format - Format code with Prettier
- yarn format:check - Check code formatting
- yarn test - Run tests (Karma/Jasmine)
- yarn build - Build production bundle
- yarn start - Run dev server

## ✨ Author

**Federico Morón**

📧 [federicomoron8@gmail.com](mailto:federicomoron8@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/federicomoron/)
