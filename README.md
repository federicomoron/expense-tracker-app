# Expense Tracker App

A simple and modern web application to track personal and group expenses, built with Angular and designed with mobile-first principles in mind. Ideal for tracking your daily, group, or travel expenses with an easy-to-use, clean interface.

✨ Features

- Create and manage expense groups (e.g., Family, Personal, Trips)
- Add daily expenses with automatic category detection
- Monthly summaries by category (e.g., "Food", "Utilities")
- Group-level multi-currency support (coming soon)
- Responsive and mobile-first UI
- Clean, minimal design with Angular Material
- Simulated login with future plans for Google Sign-In integration
- Detailed expense report and history

🌐 Tech Stack

- Angular (standalone components + signals)
- Angular Material (UI components)
- TypeScript
- RxJS (Reactive Programming)
- SCSS (for styling)

🏢 Project Architecture

src/
├── app/
│ ├── core/ # Core services, interceptors, global configurations
│ ├── shared/ # Reusable components and modules (e.g., buttons, headers)
│ ├── features/ # Feature modules (e.g., groups, expenses)
│ ├── assets/ # Static assets (images, icons, etc.)
│ ├── app.config.ts # Angular configuration
│ └── app.module.ts # Root module
└── environments/ # Environment-specific configurations (e.g., dev, prod)

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
