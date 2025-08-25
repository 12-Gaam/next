# 12gaam - Community Contact Management System

A modern web application for managing community contacts with a beautiful UI and robust backend powered by Next.js and Supabase.

## 🚀 Features

- **User Management**: Admin-only authentication system
- **Contact Management**: Comprehensive contact forms with family details
- **Location System**: Cascading dropdowns for Country → State → City
- **Education & Profession**: Master data management with "Other" options
- **Social Media Integration**: Multiple social platform links
- **Responsive Design**: Modern UI built with Tailwind CSS and Ant Design
- **Real-time Database**: Powered by Supabase with PostgreSQL

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Ant Design
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React hooks and context

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd 12gaam
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup
1. Go to [Supabase Dashboard](https://supabase.com)
2. Create a new project
3. Run the SQL schema from `supabase-schema.sql` in the SQL Editor
4. Run the seed data from `supabase-seed.sql`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The application uses the following main tables:
- `users` - User authentication and roles
- `contacts` - Main contact information
- `contact_children` - Children details
- `contact_siblings` - Sibling information
- `country_master`, `state_master`, `city_master` - Location data
- `education_master`, `profession_master` - Master data

## 🔐 Authentication

- **Admin Access**: `/admin` - Username: `admin`, Password: `Admin@123`
- **Public Access**: Main contact form is accessible without authentication
- **Protected Routes**: Admin dashboard and contact management

## 📱 API Endpoints

- `POST /api/contacts` - Create new contact
- `GET /api/contacts` - Fetch contacts (with search)
- `GET /api/countries` - Get all countries
- `GET /api/states` - Get states by country
- `GET /api/cities` - Get cities by state
- `GET /api/educations` - Get education levels
- `GET /api/professions` - Get professions

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
│   ├── admin/            # Admin routes
│   ├── api/              # API endpoints
│   ├── auth/             # Authentication pages
│   └── dashboard/        # User dashboard
├── components/            # React components
├── lib/                  # Utility functions
├── prisma/               # Database schema (legacy)
├── types/                # TypeScript definitions
└── public/               # Static assets
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

## 🔄 Migration Notes

This project has been migrated from:
- **Prisma + SQLite** → **Supabase + PostgreSQL**
- **Local database** → **Cloud database**
- **File-based storage** → **Cloud storage**

All existing functionality has been preserved during the migration.

