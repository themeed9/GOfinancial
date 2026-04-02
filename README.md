# GO Financial

A modern personal finance tracking application built with React and Express.

## Features

- Budget tracking (expenses, revenue, savings)
- Multi-currency support
- Weekly spending charts
- Category-based organization
- Data export (JSON, Excel)
- Data import/export backup
- Yearly and monthly views
- Onboarding flow

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Express.js, TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Database**: PostgreSQL with Drizzle ORM (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilities
│   │   ├── pages/       # Page components
│   │   └── store/       # Zustand store
├── server/           # Express backend
└── shared/           # Shared types and schemas
```

## API Endpoints

- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/export/excel` - Export to Excel

## License

MIT
