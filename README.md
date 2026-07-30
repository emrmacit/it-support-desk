# IT Support Desk

A modern, full-stack Internal IT Support & Ticket Management Application built with Next.js 15. This system allows employees to easily create and track IT support tickets, while providing IT staff with a dedicated dashboard to manage, prioritize, and resolve issues efficiently.

## 🚀 Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Employees and IT Staff.
- **Ticket Management:** Create, view, update, delete, and resolve support tickets.
- **Status Tracking:** Filter and track tickets by status (Open, In Progress, Resolved).
- **Communication:** Commenting system on tickets for seamless communication between staff and employees.
- **Modern UI/UX:** Responsive, dark-mode ready interface built with Tailwind CSS and Radix UI primitives.
- **Secure Authentication:** Credential-based secure login using NextAuth.js.

## 💻 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Hosted on [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) (Lucide Icons, Radix UI)

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/emrmacit/it-support-desk.git
   cd it-support-desk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Copy the `.env.example` file to `.env` and fill in your Supabase connection strings and Auth secret:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the Database:**
   Push the Prisma schema to your PostgreSQL database and seed it with initial demo data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Demo Credentials

After running the database seed, you can log in using the following accounts:

**Employee Accounts:**
- Email: `employee@company.com` | Password: `password123`
- Email: `employee2@company.com` | Password: `password123`

**IT Staff Account:**
- Email: `it@company.com` | Password: `password123`

## ☁️ Deployment

This project is optimized for deployment on [Vercel](https://vercel.com). When deploying, ensure you configure the following Environment Variables in your Vercel project settings:
- `DATABASE_URL` (Supabase IPv4 Pooler URL)
- `DIRECT_URL` (Supabase IPv4 Pooler Direct URL)
- `NEXTAUTH_SECRET` (A strong random string)

*(Note: Do not set `NEXTAUTH_URL` on Vercel as it is handled automatically.)*
