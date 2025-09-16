# Buyer Lead Intake App

A mini full-stack application for managing buyer leads. Capture, view, and manage leads efficiently with robust validation, search/filter, and CSV import/export functionality.

---

## 🚀 Features

- **Create Lead**: Add new buyer leads via a user-friendly form with client- and server-side validation powered by **Zod**.
- **View & Edit**: Dedicated lead detail pages to edit all fields and view detailed change history.
- **Lead History**: Automatic audit trail that logs every update to leads in a separate history table.
- **List & Search**: Main dashboard with server-side pagination, sorting, and URL-synced filters.
- **CSV Export**: Export filtered lead lists to CSV.
- **CSV Import**: Bulk import up to 200 leads from CSV with row-by-row validation and transactional saves.

---

## 🛠️ Tech Stack

| Layer       | Technology                      |
|-------------|--------------------------------|
| Framework   | Next.js (App Router)            |
| Language    | TypeScript                     |
| Database    | SQLite (local development)      |
| ORM         | Prisma (+ migrations)           |
| Validation  | Zod                            |
| Styling     | Tailwind CSS                   |

---

## 🎨 Design Notes

### Server vs. Client Components
- **Server Components:**  
  Used for `/buyers` list and dynamic `/buyers/[id]` pages — enabling direct, secure DB queries with fast initial loads.

- **Server Actions:**  
  All form submissions (create, update, import) handled via Next.js Server Actions — no separate API layer needed.

- **Client Components:**  
  Interactive components like `NewBuyerForm`, `SearchAndFilters`, and `ExportButton` run on the client.

### Validation Strategy
- **Double Validation:**  
  Using **Zod** on both client and server to ensure instant user feedback plus secure server-side validation before DB writes.

### Ownership & Safety
- Each lead is tied to an `ownerId`.
- Update actions include ownership checks to prevent unauthorized edits.
- Concurrency control using timestamps prevents conflicting updates.

---

## ✅ What’s Done

| Feature                      | Status | Notes                                       |
|-----------------------------|--------|---------------------------------------------|
| Data Model                  | ✅     | Buyers and buyer_history Prisma models      |
| Create / Read / Update      | ✅     | Full CRUD implemented                        |
| Search / Filter / Pagination | ✅     | Server-side, URL synced                      |
| CSV Import                 | ✅     | Row validation, transactional DB saves     |
| CSV Export                 | ✅     | Respects current filters                     |
| Authentication (Mock)      | ✅     | Placeholder `ownerId` used                    |
| Unit Tests                 | ✅     | Basic validation test included               |

---

## 📦 Getting Started

1. Clone the repo  
   ```bash
   git clone https://github.com/devkartik773/BUYER_LEAD.git
   cd BUYER_LEAD

2. Setup Environment Variables
Create a .env file in the root directory and add the following variables. You can get these from your Supabase project dashboard.

DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

3. Install Dependencies
Bash

npm install
# or
pnpm install

4. Run Database Migrations
This will create the necessary buyers and buyer_history tables in your database.

Bash

npm run db:migrate

5. Start the Development Server
Bash

npm run dev

# Project Screenshots

### Home Page
![Screenshot 1](./Screenshot%202025-09-15%20082910.png)

### Form Page
![Screenshot 2](./Screenshot%202025-09-15%20083010.png)

### DashBoard
![Screenshot 3](./Screenshot%202025-09-15%20083046.png)

### Import
![Screenshot 4](./Screenshot%202025-09-15%20083129.png)
