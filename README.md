# 💸 Trackwise - Smart Full-Stack Expense Tracker

Trackwise is a high-performance, full-stack budget management application designed for precision and security. It empowers users to take control of their finances through real-time tracking, intelligent budgeting, and deep data visualization.

**Live Application:** [trackyourbudgetwise.netlify.app](https://trackyourbudgetwise.netlify.app/)

---

## 🚀 Key Features

- 🔐 **Robust Authentication**: Secure sign-up and login powered by JWT (JSON Web Tokens) and Bcrypt password hashing.
- 📊 **Dynamic Dashboard**: A comprehensive snapshot of your financial health, including income, expenses, and savings.
- ⚖️ **Intelligent Budgeting**: Set category-specific limits with automated alerts (80% threshold and over-budget warnings).
- 📉 **Rich Data Visualization**: Analyze spending habits with interactive Pie and Bar charts powered by Chart.js.
- 📱 **Mobile-First Design**: A completely revamped responsive UI with dedicated mobile interactions and navigation.
- 📑 **Financial Reporting**: Export your transaction history to **PDF** or **CSV/Excel** for offline review.
- 🌍 **Global Support**: Multi-currency support and localized date filtering.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) with Vite
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) (Modern, utility-first design)
- **State Management**: React Context API + Custom Hooks
- **Visuals**: [Chart.js](https://www.chartjs.org/) for analytics
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/) for real-time feedback

### Backend (Serverless Architecture)
- **Environment**: Node.js & Express
- **Compute**: Netlify Serverless Functions (AWS Lambda bridge)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/)
- **ORM**: [Prisma](https://www.prisma.io/) for type-safe database queries
- **Security**: JWT for identity, Bcrypt for hashing, and strict CORS policies

---

## 🛡️ Security & Hardening

Trackwise is built with production security as a priority:
- **One-Way Hashing**: Passwords are never stored as plaintext; they are hashed with a complexity salt.
- **Sanitized Logging**: Sensitive user data is automatically stripped from server and function logs.
- **Strict CORS**: The API only accepts requests from verified production and development origins.
- **IDOR Protection**: All database queries are strictly scoped to the authenticated `userId`.
- **Parametrized Queries**: Prisma ORM prevents SQL Injection by design.

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/rishichintala/Trackwise.git
cd Trackwise
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-32-char-secret"
```

### 3. Install & Sync Database
```bash
npm install
npx prisma db push --schema=server/prisma/schema.prisma
```

### 4. Run the Application
In one terminal (Frontend):
```bash
npm run dev
```
In another terminal (Backend):
```bash
cd server
npm run dev
```

---

## Support & Contribution

Trackwise is an ongoing project. If you find it useful:
- ⭐️ Give the project a star on GitHub!
- 🐛 Report bugs or suggest features via Issues.

## Credits

Built with ❤️ by **Sai Rishith Chintala** and **Kavya Vemuri**.

