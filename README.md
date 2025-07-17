# Expense Tracker App

A modern and modular web application to track personal and group expenses, built with Angular using a standalone architecture and designed with mobile-first principles. Ideal for managing your daily, shared, or travel expenses with a clean and responsive UI.

![Angular CI Pipeline](https://github.com/federicomoron/expense-tracker-app/actions/workflows/ci.yml/badge.svg)

## ✨ Features

- Auth simulation with routing guards and layout separation
- Create and manage expense groups (e.g., Family, Personal, Trips)
- Add expenses with currency, category, and split-type selectors
- Reusable and dynamic dialog components for form-based inputs
- Multi-currency group support (coming soon)
- Fully responsive and mobile-first design using Angular Material
- Shared layouts for authenticated vs unauthenticated flows
- Clean architecture with feature-based and core-based structure
- Configurable theme using SCSS variables and Angular Material theming

## 🌐 Tech Stack

- Angular (standalone components + signals)
- Angular Material (custom theme)
- TypeScript
- RxJS (Reactive Programming)
- SCSS (modular and theme-based)
- ESLint + Prettier (code formatting & quality)
- Husky + lint-staged + commitlint (Git hooks)
- GitHub Actions (CI/CD pipeline)

## 🏢 Project Structure

```txt
src/
├── app/
│   ├── core/                  # Global services, interceptors, guards, constants, models
│   │   ├── constants/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── models/
│   │   └── services/
│   ├── features/              # Feature-based modules
│   │   ├── auth/              # Login and register views
│   │   ├── expenses/          # Expense module (selectors, dialogs, forms)
│   │   └── groups/            # Group module (form, detail, listing)
│   ├── layouts/               # App layout (shell) and fullscreen layout
│   ├── shared/                # Reusable UI components, helpers, styles
│   │   ├── components/
│   │   ├── helpers/
│   │   └── styles/
│   ├── app.routes.ts          # Global route definitions
│   ├── app.config.ts          # Standalone providers and router setup
│   └── app.component.ts       # Root shell component
├── environments/              # Environment-specific configs (dev, prod)
├── assets/                    # Static files (icons, images, etc.)
├── theme/                     # Theme configuration (SCSS variables and overrides)
├── styles.scss                # Global styles
└── main.ts                    # Standalone bootstrap entry
```

🚀 Getting Started

1. Clone the repository:
   git clone https://github.com/federicomoron/expense-tracker-app.git
   cd expense-tracker-app

2. Install dependencies:
   yarn install

3. Run the app locally:
   yarn start
   - Open http://localhost:4200 in your browser.

🔧 Available Scripts

# Lint the code

yarn lint

# Lint and auto-fix

yarn lint:fix

# Format code with Prettier

yarn format

# Check formatting only

yarn format:check

## ✨ Author

**Federico Morón**

📧 [federicomoron8@gmail.com](mailto:federicomoron8@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/federicomoron/)
