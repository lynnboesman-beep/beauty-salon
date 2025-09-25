-- ======================================
-- MIGRATION: Remove Categories System
-- ======================================
-- This script safely removes all category-related tables and columns
-- Run this in your Supabase SQL editor or database management tool

-- Step 1: Drop the foreign key constraint first
ALTER TABLE services DROP CONSTRAINT IF EXISTS fk_services_category;

-- Step 2: Remove the category_id column from services table
ALTER TABLE services DROP COLUMN IF EXISTS category_id;

-- Step 3: Drop the service_categories table entirely  
DROP TABLE IF EXISTS service_categories;

-- Step 4: Verify the changes (Optional - for checking)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'services' AND table_schema = 'public';

-- ======================================
-- VERIFICATION QUERIES
-- ======================================
-- Run these to verify the migration worked:

-- 1. Check that services table no longer has category_id
-- \d services

-- 2. Check that service_categories table no longer exists
-- \d service_categories

-- 3. List all tables to confirm removal
-- \dt

-- ======================================
-- ROLLBACK (IF NEEDED)
-- ======================================
-- If you need to rollback this migration, run:
/*
-- Recreate service_categories table
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id back to services table
ALTER TABLE services ADD COLUMN category_id UUID;

-- Recreate foreign key constraint
ALTER TABLE services 
ADD CONSTRAINT fk_services_category 
FOREIGN KEY (category_id) REFERENCES service_categories(id);
*/