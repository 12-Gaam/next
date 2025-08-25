#!/bin/bash

echo "🌍 Setting up complete location database for 12Gaam..."

echo "📊 Step 1: Generating Prisma client..."
npm run db:generate

echo "🔄 Step 2: Pushing database schema changes..."
npm run db:push

echo "🌱 Step 3: Seeding all countries, states, and cities..."
npm run db:seed-locations

echo "✅ Location setup completed!"
echo ""
echo "📊 You can now view your data with:"
echo "   npm run db:studio"
echo ""
echo "🚀 Start your app with:"
echo "   npm run dev"
