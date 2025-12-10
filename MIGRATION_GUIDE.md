# Migration Guide: Multiple Admins per Gaam

This document describes the changes made to support multiple admins per gaam (game).

## Overview

The system has been updated from a one-to-one relationship (one admin per gaam) to a many-to-many relationship (multiple admins can be assigned to one gaam). This allows any assigned admin to approve user requests for their gaam.

## Changes Made

### 1. Database Schema Changes

**Prisma Schema (`prisma/schema.prisma`):**
- Removed `adminId` and `admin` fields from `Gaam` model
- Created new `GaamAdmin` join table model to support many-to-many relationship
- Updated `User.gaamsManaged` relation to use `GaamAdmin[]` instead of `Gaam[]`

### 2. Migration SQL

**File: `prisma/migrations/migrate_to_multiple_admins.sql`**

This migration:
1. Creates the `GaamAdmin` join table
2. Migrates existing data from `Gaam.adminId` to `GaamAdmin` table
3. Drops the `adminId` column from `Gaam` table

**To run the migration:**
```bash
# Option 1: Using Prisma Migrate (Recommended)
npx prisma migrate dev --name migrate_to_multiple_admins

# Option 2: Run SQL directly
psql -d your_database -f prisma/migrations/migrate_to_multiple_admins.sql
```

### 3. API Route Updates

**`app/api/admins/[id]/gaam/route.ts`:**
- Changed from accepting single `gaamId` to accepting array `gaamIds`
- Updated to use `GaamAdmin` join table for assignments
- Removed check that prevented multiple admins per gaam

**`app/api/registrations/[id]/route.ts`:**
- Updated authorization check to verify admin is in the `GaamAdmin` table for the gaam
- Changed from checking `gaam.adminId` to querying `GaamAdmin` table

**`app/api/registrations/route.ts`:**
- Updated filtering logic to use `GaamAdmin` join table instead of `Gaam.adminId`

**`app/api/gaams/route.ts`:**
- Updated GET to return multiple admins per gaam
- Updated POST to accept array of `adminIds` instead of single `adminId`
- Maintains backward compatibility by including `admin` field (first admin) for existing code

### 4. Frontend Updates

**`app/admin/admins/page.tsx`:**
- Changed from single select dropdown to checkbox-based multi-select
- Updated state management to handle arrays of gaam IDs
- Updated UI to display all assigned gaams (not just the first one)
- Updated API calls to send `gaamIds` array instead of single `gaamId`

### 5. Seed File Updates

**`prisma/seed.ts`:**
- Updated to use `GaamAdmin` table for assigning admins to gaams
- Removed direct `adminId` assignment on `Gaam` creation

## How to Apply Changes

### Step 1: Update Prisma Schema
The schema has already been updated. Generate Prisma client:
```bash
npx prisma generate
```

### Step 2: Run Migration
```bash
# Using Prisma Migrate (creates migration automatically)
npx prisma migrate dev --name migrate_to_multiple_admins

# OR run the SQL file directly if you prefer
psql -d your_database -f prisma/migrations/migrate_to_multiple_admins.sql
```

### Step 3: Verify Migration
After running the migration, verify:
- `GaamAdmin` table exists
- Existing admin-gaam relationships were migrated
- `adminId` column was removed from `Gaam` table

### Step 4: Test the Changes
1. Create multiple admins
2. Assign multiple admins to the same gaam
3. Verify that any assigned admin can approve requests for that gaam
4. Test the admin assignment UI to ensure multiple selections work

## Breaking Changes

### API Changes
- `PUT /api/admins/[id]/gaam` now expects `{ gaamIds: string[] }` instead of `{ gaamId: string }`
- `POST /api/gaams` now accepts `{ adminIds: string[] }` instead of `{ adminId: string }` (optional, backward compatible)

### Database Changes
- `Gaam.adminId` column no longer exists
- New `GaamAdmin` table must exist

## Backward Compatibility

The API routes maintain some backward compatibility:
- `GET /api/gaams` still returns an `admin` field (first admin) for compatibility
- The `admins` array is also included for new code

## Notes

- All existing admin-gaam assignments are preserved during migration
- The migration is idempotent (can be run multiple times safely)
- Foreign key constraints ensure data integrity
- Cascade deletes are configured for cleanup


