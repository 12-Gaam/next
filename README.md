# 12gaam - Community Contact Management System

A modern web application for managing community relationships, registrations, and family profiles. Built with Next.js 14, Prisma, and PostgreSQL.

## 🚀 Features

- **Role-based Access**: Super admin, gaam admins, and member accounts
- **Registration Workflow**: Public registration with automatic credential email + gaam verification
- **Family Profile Management**: Members manage full household information once approved
- **Gaam Assignments**: Requests routed to the assigned gaam admin automatically
- **Contact Management**: Comprehensive multi-step form with education, profession, and family details
- **Master Data**: Country, state, education, and profession catalogs with admin CRUD
- **Responsive Design**: Tailwind CSS + Ant Design hybrid UI

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Ant Design, Lucide Icons
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Credentials provider)
- **Forms & Validation**: React Hook Form + Zod

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL instance
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd 12gaam
```

### 2. Install Dependencies
```bash
yarn
# or
npm install
```

### 3. Environment Setup
Copy `env.example` to `.env.local` and fill in the values:
```bash
cp env.example .env.local
```
Required variables:
- `DATABASE_URL`, `DIRECT_URL`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (Gmail SMTP supported)

### 4. Database Setup
```bash
yarn prisma migrate dev
yarn prisma db seed
```
(Use `npm run` if you prefer npm.)

### 5. Run Development Server
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema (Prisma)

- `User` — Includes full name, email, username, role, status, gaam relation
- `Gaam` — 12 villages with optional admin assignments
- `Contact` — Member family profile linked to a user
- `ContactChild`, `ContactSibling` — Family details
- `CountryMaster`, `StateMaster`, `CityMaster`
- `EducationMaster`, `ProfessionMaster`

## 🔐 Authentication & Roles

- **Super Admin**: Global access, manage gaams & master data  
  - Default: `superadmin@12gaam.com / Admin@123`
- **Gaam Admin**: Approve registrations assigned to their gaam  
  - Default: `limbasi.admin@12gaam.com / Admin@123`
- **Member**: Registers via `/join`, waits for approval, then manages their family profile.

## 📱 API Endpoints (Highlights)

- `POST /api/registrations` — Public registration + email credentials
- `GET /api/registrations` — Admin review queue
- `PATCH /api/registrations/:id` — Approve/Reject requests
- `POST/GET /api/contacts` — Member profile CRUD (POST creates/PUT updates)
- `GET /api/contacts?ownership=me` — Logged-in member profile fetch
- `GET /api/gaams` — Gaam list for registration
- `POST /api/countries|states|educations|professions` — Super admin master data management

## 🎨 UI Components

- **ContactForm**: Multi-step form with validation
- **AdminDashboard**: Modern admin interface
- **ContactList**: Searchable contact management
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Network Hosting
```bash
HOSTNAME=0.0.0.0 npm run dev
```

## 📁 Project Structure

```
12gaam/
├── app/                    # Next.js app directory
│   ├── admin/              # Admin + verification screens
│   ├── api/                # API endpoints
│   ├── auth/               # Legacy auth pages
│   ├── dashboard/          # Member dashboard
│   └── join/               # Combined login/registration landing
├── components/             # React components
├── lib/                    # Auth, prisma, email, helpers
├── prisma/                 # Prisma schema + seeders
├── types/                  # TypeScript definitions
└── public/                 # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Notes

- Existing Supabase SQL scripts are retained for reference, but the application now uses Prisma migrations by default.
- Registration email delivery relies on the Gmail SMTP credentials configured in `.env.local`.

