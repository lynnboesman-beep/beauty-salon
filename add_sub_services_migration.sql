-- ======================================
-- MIGRATION: Add Sub-Services System
-- ======================================
-- This script adds sub-services functionality to the salon booking system
-- Run this in your Supabase SQL editor

-- Step 1: Create sub_services table
CREATE TABLE sub_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    image_url TEXT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create staff_sub_services junction table (many-to-many)
CREATE TABLE staff_sub_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    sub_service_id UUID NOT NULL REFERENCES sub_services(id) ON DELETE CASCADE,
    experience_level TEXT DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_id, sub_service_id) -- Prevent duplicate assignments
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_sub_services_service_id ON sub_services(service_id);
CREATE INDEX idx_sub_services_active ON sub_services(is_active);
CREATE INDEX idx_staff_sub_services_staff_id ON staff_sub_services(staff_id);
CREATE INDEX idx_staff_sub_services_sub_service_id ON staff_sub_services(sub_service_id);

-- Step 4: Add Row Level Security (RLS) policies
ALTER TABLE sub_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_sub_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sub_services
CREATE POLICY "Sub-services are viewable by everyone" ON sub_services
    FOR SELECT USING (true);

CREATE POLICY "Sub-services are editable by authenticated users" ON sub_services
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for staff_sub_services
CREATE POLICY "Staff sub-services are viewable by everyone" ON staff_sub_services
    FOR SELECT USING (true);

CREATE POLICY "Staff sub-services are editable by authenticated users" ON staff_sub_services
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 5: Create storage bucket for sub-service images
-- Note: You need to run this in the Supabase dashboard > Storage section
-- or via the Supabase client, not in SQL editor:
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sub-service-images', 'sub-service-images', true);
*/

-- Step 6: Set up storage policies for sub-service images bucket
-- Note: Run these after creating the bucket
/*
CREATE POLICY "Sub-service images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'sub-service-images');

CREATE POLICY "Authenticated users can upload sub-service images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'sub-service-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update sub-service images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'sub-service-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete sub-service images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'sub-service-images' 
        AND auth.role() = 'authenticated'
    );
*/

-- ======================================
-- VERIFICATION QUERIES
-- ======================================
-- Run these to verify the migration worked:

-- 1. Check that sub_services table exists
-- \d sub_services

-- 2. Check that staff_sub_services table exists  
-- \d staff_sub_services

-- 3. List all tables
-- \dt

-- 4. Check indexes
-- \di

-- ======================================
-- SAMPLE DATA (OPTIONAL)
-- ======================================
-- Uncomment and modify to add sample data:
/*
-- Insert a sample sub-service (replace service_id with actual ID)
INSERT INTO sub_services (name, description, price, duration_minutes, service_id)
VALUES 
    ('Beard Trim', 'Professional beard trimming and shaping', 25.00, 20, 'your-service-id-here'),
    ('Hair Wash', 'Relaxing hair wash with premium products', 15.00, 15, 'your-service-id-here');

-- Assign staff to sub-services (replace with actual IDs)  
INSERT INTO staff_sub_services (staff_id, sub_service_id, experience_level)
VALUES 
    ('your-staff-id-here', 'your-sub-service-id-here', 'expert');
*/

-- ======================================
-- ROLLBACK (IF NEEDED)
-- ======================================
-- If you need to rollback this migration, run:
/*
-- Drop tables in reverse order (due to foreign key constraints)
DROP TABLE IF EXISTS staff_sub_services;
DROP TABLE IF EXISTS sub_services;

-- Remove storage bucket (via Supabase dashboard or client)
-- DELETE FROM storage.buckets WHERE id = 'sub-service-images';
*/