# Expense Tracker App

A simple and modern web application to track personal and group expenses, built with Angular and designed with mobile-first principles in mind. Ideal for tracking your daily, group, or travel expenses with an easy-to-use, clean interface.

## ✨ Features

- Create and manage expense groups (e.g., Family, Personal, Trips)
- Add daily expenses with automatic category detection
- Monthly summaries by category (e.g., "Food", "Utilities")
- Group-level multi-currency support (coming soon)
- Responsive and mobile-first UI
- Clean, minimal design with Angular Material
- Simulated login with future plans for Google Sign-In integration
- Detailed expense report and history

## 🌐 Tech Stack

- Angular (standalone components + signals)
- Angular Material (UI components)
- TypeScript
- RxJS (Reactive Programming)
- SCSS (for styling)
- ESLint + Prettier (code quality and formatting)

## 🏢 Project Structure

```txt
src/
├── app/
│   ├── core/                 # Global services, interceptors, guards, constants, models
│   │   ├── services/
│   │   ├── interceptors/
│   │   ├── guards/
│   │   ├── models/
│   │   └── constants/
│   ├── shared/               # Reusable components and UI modules
│   ├── features/             # Feature-based modules (e.g., groups, expenses)
│   ├── app.config.ts         # Angular standalone configuration (providers, routing, etc.)
│   ├── app.routes.ts         # Global route definitions
│   ├── app.component.ts      # Root component (Shell)
│   ├── app-routing.module.ts # (Temporarily included if needed)
│   └── app.module.ts         # [Legacy] not used - standalone architecture
├── environments/             # Environment-specific configs (dev, prod)
├── main.ts                   # App bootstrap with standalone setup
├── styles.scss               # Global styles
└── index.html                # App entry point

🚀 Getting Started

1. Clone the repository:
   git clone https://github.com/your-username/expense-tracker-app.git
   cd expense-tracker-app

2. Install dependencies:
   npm install

3. Run the app locally:
   ng serve

   - Open http://localhost:4200 in your browser.

✨ Author

Federico Morón
```
