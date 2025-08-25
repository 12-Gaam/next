#!/bin/bash

echo "🚀 Setting up 12Gaam Database..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your database configuration:"
    echo ""
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/12gaam_db\""
    echo "NEXTAUTH_SECRET=\"your-secret-key-here\""
    echo "NEXTAUTH_URL=\"http://localhost:3000\""
    echo ""
    exit 1
fi

echo "✅ Environment file found"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Push schema to database
echo "🗄️  Pushing database schema..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Database schema pushed successfully"
else
    echo "❌ Failed to push database schema"
    echo "Please check your database connection in .env.local"
    exit 1
fi

# Seed the database
echo "🌱 Seeding database with initial data..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "Default admin account:"
echo "Username: admin"
echo "Password: Admin@123"
echo ""
echo "You can now start the development server with:"
echo "npm run dev"
echo ""
echo "Or build for production with:"
echo "npm run build"

