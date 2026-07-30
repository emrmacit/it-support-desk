# Role & Context
You are an expert Senior Full-Stack Engineer and Security Specialist. We are building an Internal IT Support & Ticketing Web Application (MVP). The core objective is to replace chaotic email threads with a structured, secure, and fast internal ticketing system.

## Tech Stack (Modern, Secure, Scalable)
- **Framework:** Next.js 14+ (App Router) - Production-ready, SSR/ISR capabilities, built-in security features.
- **Language:** TypeScript (Strict mode)
- **Database:** PostgreSQL (via Prisma ORM or Supabase) - Relational data integrity for tickets/users.
- **Authentication:** Auth-js (NextAuth) or Supabase Auth - Secure, JWT/Session based, role-based access control (RBAC).
- **Styling:** Tailwind CSS + Shadcn/ui (Radix Primitives) - Accessible, highly optimized, utility-first UI.
- **State/Data Fetching:** TanStack Query (React Query) or Next.js Server Actions with optimistic updates.

---

## 🛠 Architectural Rules & Standards

### 1. Security First (Ref: security.md alignment)
- **Role-Based Access Control (RBAC):** Define strictly two roles: `EMPLOYEE` and `IT_STAFF`. Protect routes via middleware (`/dashboard/it/*` vs `/dashboard/employee/*`).
- **Input Validation:** Use `Zod` for all form submissions and API payloads to prevent XSS and SQL Injection.
- **CSRF & Rate Limiting:** Utilize Next.js built-in CSRF protection for Server Actions. Implement rate-limiting on ticket creation endpoints (max 5 requests per minute per user).
- **Data Isolation:** Ensure users can only query/view their own tickets, while `IT_STAFF` can query all tickets.
- **Sanitization:** Sanitize rich text or text inputs before rendering to prevent XSS.

### 2. Optimization & Performance (Ref: optimization.md alignment)
- **Database Indexing:** Index foreign keys (`userId`, `status`, `category`) for fast lookups as the system scales.
- **Server Components:** Use Next.js Server Components (RSC) by default for data fetching to reduce client-side JS bundle size.
- **Debouncing & Pagination:** Implement cursor-based pagination for the IT dashboard ticket list.
- **Optimistic Updates:** When an IT staff member changes a ticket status, update the UI optimistically before the network request finishes.

### 3. Design System (Ref: design.md alignment)
- **Theme:** Clean, professional corporate dashboard look. Dark/Light mode support via `next-themes`.
- **Colors:** Neutral slates for backgrounds, vibrant Indigo/Blue for primary actions, and distinct status colors (Open: Emerald, In Progress: Amber, Closed: Slate).
- **UX:** Zero layout shifts (CLS minimized), accessible modal dialogues using Radix, and clear loading skeletons (`loading.tsx`).

---

## 📋 MVP Feature Requirements & User Flows

### Flow 1: Employee (Talep Sahibi)
1. **Authentication:** Log in securely.
2. **Create Ticket:** Open a ticket with fields: `Title`, `Description`, `Category` (Hardware, Software, Network, Access), and `Priority` (Low, Medium, High). 
3. **Ticket History:** View a clean list of *their own* submitted tickets with live status updates (Created -> In Progress -> Resolved / Closed).

### Flow 2: IT Staff (Destek Ekibi)
1. **Global Dashboard:** View all active tickets across the company, sortable by date, category, and priority.
2. **Status Management:** Dropdown to change ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`).
3. **Internal Logs (Optional for MVP):** A simple comment thread inside the ticket for resolution notes.

---

## 🗂 Target Folder Structure (Next.js App Router)

src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── dashboard/
│   │   ├── employee/
│   │   │   ├── page.tsx          # Employee ticket list
│   │   │   └── create/page.tsx   # New ticket form
│   │   ├── it/
│   │   │   ├── page.tsx          # IT admin console
│   │   │   └── ticket/[id]/page.tsx # Ticket detail & status update
│   │   └── layout.tsx            # Sidebar navigation & Theme Provider
│   ├── api/                      # Edge cases or webhooks (if not using Server Actions)
│   ├── layout.tsx
│   └── page.tsx                  # Redirects to login or dashboard
├── components/
│   ├── ui/                       # Shadcn components (Button, Input, Badge, Select)
│   ├── ticket-form.tsx
│   ├── ticket-table.tsx
│   └── status-badge.tsx
├── lib/
│   ├── db.ts                     # Prisma/Database client
│   └── validations.ts            # Zod schemas (ticketSchema, authSchema)
└── middleware.ts                 # Route protection & RBAC