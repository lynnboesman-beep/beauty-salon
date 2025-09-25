-- Enhanced Services Schema Migration
-- Run this SQL in your Supabase SQL Editor

-- 1. Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add category_id to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Create foreign key relationship
ALTER TABLE public.services 
ADD CONSTRAINT fk_services_category 
FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE SET NULL;

-- 4. Create staff_specializations table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.staff_specializations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL,
  service_id UUID NOT NULL,
  experience_level VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, expert
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

-- 5. Add foreign keys for staff_specializations
ALTER TABLE public.staff_specializations 
ADD CONSTRAINT fk_staff_specializations_staff 
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_staff_specializations_service 
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

-- 6. Insert sample service categories
INSERT INTO public.service_categories (name, description, image_url) VALUES
('Hairstyles', 'Professional hair cutting, styling, and treatments for all hair types', null),
('Hair Coloring', 'Hair coloring, highlights, balayage, and color treatments', null),
('Manicures', 'Nail care, manicures, and nail art services', null),
('Pedicures', 'Foot care, pedicures, and nail treatments', null),
('Facials', 'Skincare treatments, facials, and beauty treatments', null),
('Eyebrows & Lashes', 'Eyebrow shaping, tinting, and eyelash treatments', null)
ON CONFLICT DO NOTHING;

-- 7. Add comments to tables for documentation
COMMENT ON TABLE public.service_categories IS 'Main service categories (Hairstyles, Manicures, etc.)';
COMMENT ON TABLE public.staff_specializations IS 'Which staff members can perform which specific services';

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_staff_specializations_staff_id ON public.staff_specializations(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_specializations_service_id ON public.staff_specializations(service_id);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_specializations ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
CREATE POLICY "Service categories are viewable by everyone" ON public.service_categories
FOR SELECT USING (true);

CREATE POLICY "Staff specializations are viewable by everyone" ON public.staff_specializations
FOR SELECT USING (true);

-- Only authenticated users can manage specializations (for admin panel)
CREATE POLICY "Staff specializations are manageable by authenticated users" ON public.staff_specializations
FOR ALL USING (auth.role() = 'authenticated');