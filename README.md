# Trackwise — Smart Full-Stack Expense Tracker

Trackwise is a high-performance, full-stack budget management application designed for precision and security. It empowers users to take control of their finances through real-time tracking, intelligent budgeting, and deep data visualization — and integrates directly with Splito so your share of a split bill is logged automatically.

**Live Application:** [trackyourbudgetwise.netlify.app](https://trackyourbudgetwise.netlify.app/)

---

## Key Features

### Dashboard
- At-a-glance snapshot of income, total expenses, and net savings for the current month
- Monthly progress cards for each budget category
- Quick-add expense button directly from the dashboard

### Expense Tracking
- Add, edit, and delete expenses with amount, category, date, and description
- 9 built-in categories: **Groceries, Dining, Transport, Housing, Subscriptions, Health, Personal Care, Entertainment, Miscellaneous**
- Filter and search transactions by date range, category, or keyword
- Paginated transaction history with sort options

### Intelligent Budgeting
- Set a monthly spending limit per category
- Automated alerts: **80% warning** when approaching a limit, **over-budget alert** when exceeded
- Budget vs. actual bar chart per category

### Data Visualization
- Interactive **Pie chart** — spending distribution by category
- Interactive **Bar chart** — monthly income vs. expenses trend
- Powered by Chart.js with responsive layouts

### Financial Reporting
- Export transaction history to **PDF** (formatted report) or **CSV/Excel**
- Date-range filter before exporting
- Multi-currency support with localized number formatting

### AI-Powered Insights & Assistant (Gemini)
- **AI Spending Insights** (Dashboard) — a one-click, AI-generated summary of the selected month's spending: biggest category, month-over-month trend per category, and any category that's over or near its budget. Budget status and trend percentages are computed in code and handed to the model as facts rather than left for it to calculate, so the numbers stay accurate.
- **Assistant** (`/assistant`) — a chat interface for free-form questions about your spending over the trailing 6 months (e.g. *"How much did I spend on Dining last month?"*, *"Which category has grown the most?"*, *"What was my biggest single purchase?"*). Answers are grounded strictly in your own aggregated and itemized transaction data; questions outside that 6-month window get an honest "I don't have that data" instead of a guess.
- Both features are powered by the Gemini API (`gemini-2.5-flash`) and require a `GEMINI_API_KEY` — see [Local Development](#local-development) and [Deployment](#deployment-netlify) below.
- **Usage limits:** since this repo is public and registration has no verification step, each user gets **3 insight generations and 5 assistant messages per day**, tracked server-side (`AiUsage` table) and refunded automatically if a call fails before completing. Chat messages and AI responses are also capped at 1,000 characters. The UI shows remaining quota up front (e.g. "2 of 3 left today") and disables the relevant button once exhausted, rather than surfacing the cap only as a surprise error.

### Authentication & Security
- Email + password sign-up and login
- JWT-secured API (tokens expire; refresh on re-login)
- Bcrypt password hashing
- Strict CORS — API only accepts requests from verified origins
- All queries scoped to the authenticated user (no cross-user data leakage)

---

## Splito Integration (API Key)

Splito is a companion bill-splitting app. When your group scans receipts and splits them, Splito can push each person's share directly into Trackwise as an expense — no double-entry.

### How to connect

1. **Generate an API key in Trackwise:**
   - Go to **Settings → API Keys** in the Trackwise UI
   - Click **Generate New Key**
   - Copy the key — it starts with `tw_live_` followed by 24 random bytes
   - **This is the only time the full key is shown.** Trackwise stores only the SHA-256 hash; the raw key cannot be retrieved later
   - Optionally give the key a label (e.g. "Splito")

2. **Paste the key in Splito:**
   - In Splito, go to **Settings → Trackwise**
   - Paste the `tw_live_...` key and tap **Connect**
   - Splito validates the key against Trackwise and stores it

3. **Push expenses from Splito:**
   - After splitting a bill in Splito, go to the event's **Totals tab**
   - Tap **📊 Log My Share to Trackwise**
   - Select yourself from the people list
   - Review the per-bill categories (auto-detected from store names; adjust if needed)
   - Tap **Log** — one Trackwise expense is created per bill, each with:
     - The **actual receipt date** (extracted from the receipt by OCR, not the scan date)
     - The correct **category** (Dining, Groceries, etc.)
     - The exact **amount** you owe for that bill (your proportional share of items + tax − discounts)
     - Description: `<StoreName> — Splito`

### How authentication works

- Splito sends `Authorization: ApiKey tw_live_...` with each request
- Trackwise hashes the incoming key with SHA-256 and compares it to stored hashes
- If a match is found, the expense is created under that user's account
- Revoking a key in Trackwise immediately blocks all further pushes from that key

### API endpoints used by Splito

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/integrations/validate` | Verify key is valid; returns `{ userName, currency }` |
| `POST` | `/expenses` | Create one expense; body: `{ amount, itemName, category, date }` |

---

## Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS 4.0 (utility-first)
- **State:** React Context API + custom hooks
- **Charts:** Chart.js
- **Notifications:** React Hot Toast

### Backend (Serverless)
- **Runtime:** Node.js + Express
- **Compute:** Netlify Serverless Functions (AWS Lambda)
- **Database:** Prisma Postgres (managed PostgreSQL via db.prisma.io)
- **ORM:** Prisma (type-safe queries, automatic migrations)
- **Auth:** JWT + Bcrypt
- **AI:** Google Gemini API (`gemini-2.5-flash`) for spending insights and the chat assistant

---

## Security Details

| Concern | Implementation |
|---|---|
| Password storage | Bcrypt with salt rounds — never stored as plaintext |
| API authentication | JWT for user sessions; `ApiKey` scheme for integrations |
| API key storage | Only the SHA-256 hash stored — raw key shown once and gone |
| SQL injection | Prisma ORM uses parameterized queries by design |
| IDOR | Every DB query filters by `userId` from the JWT claim |
| CORS | Allowlist of known origins; wildcard origins rejected |
| Logging | Sensitive fields (passwords, tokens) stripped before any log output |

---

## Local Development

### 1. Clone the repository
```bash
git clone https://github.com/rishichintala/Trackwise.git
cd Trackwise
```

### 2. Configure environment variables
Create a `.env` file in the root directory (see `.env.example` for the full list):
```env
DATABASE_URL="your-postgresql-connection-url"
JWT_SECRET="your-32-char-or-longer-secret"
RESEND_API_KEY="your-resend-api-key"        # transactional email (password reset)
RESEND_FROM_EMAIL="Trackwise <noreply@yourdomain.com>"
FRONTEND_URL="http://localhost:5173"        # used in reset-password email links
GEMINI_API_KEY="your-gemini-api-key"        # AI spending insights + assistant (server-side only)
```

### 3. Install dependencies and sync the database
```bash
npm install
npx prisma db push --schema=server/prisma/schema.prisma
```

### 4. Run the application

Frontend (in one terminal):
```bash
npm run dev
```

Backend (in another terminal):
```bash
cd server
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3000`.

---

## Deployment (Netlify)

1. Connect the repo to Netlify
2. Add the following in **Site configuration → Environment variables**:
   - `DATABASE_URL`, `JWT_SECRET`
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `FRONTEND_URL` (password reset emails)
   - `GEMINI_API_KEY` (AI spending insights + assistant — server-side only, never exposed to the browser)
3. Deploy — Prisma migrations run automatically on first request
4. The live URL (`https://trackyourbudgetwise.netlify.app`) is what Splito uses as `TRACKWISE_API_URL`

---

## Database Schema (key tables)

| Table | Purpose |
|---|---|
| `User` | Auth fields + hashed password |
| `ApiKey` | Integration keys — stores label, SHA-256 hash, `userId`, `createdAt` |
| `Expense` | amount, category, date, description, `userId` |
| `Budget` | monthly limit per category, `userId` |
| `AiUsage` | daily insights/chat call counts per user, used to enforce the AI usage limits above |

---

## Project Structure

```
src/                  # React frontend
  components/         # Dashboard, ExpenseList, Charts, BudgetCard, Settings, ...
  context/            # AuthContext, ExpenseContext
  hooks/              # useExpenses, useBudgets, useApiKeys
  utils/              # formatCurrency, exportPDF, exportCSV
server/
  index.ts            # Express app + Netlify function entry
  routes/
    expenses.ts       # CRUD for expenses
    budgets.ts        # CRUD for budget limits
    integrations.ts   # /validate + /expenses (used by Splito)
    auth.ts           # login, register, JWT
    apiKeys.ts        # generate, list, revoke API keys
  prisma/
    schema.prisma     # Database schema
    migrations/       # Migration history
```

---

## Support & Contribution

Trackwise is an ongoing project. If you find it useful:
- Star the repo on GitHub
- Report bugs or suggest features via Issues

Built with ❤️ by **Sai Rishith Chintala** and **Kavya Vemuri**.
