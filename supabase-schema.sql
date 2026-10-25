-- ==============================================================================
-- ANANDAM SAREES - PRODUCTION SUPABASE SETUP (DATABASE + STORAGE BUCKET)
-- Copy and run this script in:
-- Supabase Project -> SQL Editor -> New Query -> Paste & Click 'Run'
-- ==============================================================================

-- 1. Create Sarees/Products Table (Saree, Suit, Lehenga, Indo-Western)
CREATE TABLE IF NOT EXISTS public.sarees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    original_price NUMERIC(10, 2),
    type TEXT NOT NULL,
    image_url TEXT NOT NULL,
    secondary_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    fabric TEXT,
    length TEXT DEFAULT 'Standard ethnic wear dimensions',
    blouse_included BOOLEAN DEFAULT true,
    color TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sarees_type ON public.sarees(type);
CREATE INDEX IF NOT EXISTS idx_sarees_price ON public.sarees(price);
CREATE INDEX IF NOT EXISTS idx_sarees_featured ON public.sarees(featured);
CREATE INDEX IF NOT EXISTS idx_sarees_created_at ON public.sarees(created_at DESC);

-- 2. Create Inquiries Table (for WhatsApp orders & CRM)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saree_id UUID REFERENCES public.sarees(id) ON DELETE SET NULL,
    saree_name TEXT NOT NULL,
    saree_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- ==============================================================================
-- 3. ENABLE ROW LEVEL SECURITY & PERMISSIONS
-- ==============================================================================
ALTER TABLE public.sarees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Sarees Policies:
DROP POLICY IF EXISTS "Public can view all sarees" ON public.sarees;
CREATE POLICY "Public can view all sarees" ON public.sarees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert on sarees" ON public.sarees;
CREATE POLICY "Allow insert on sarees" ON public.sarees FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on sarees" ON public.sarees;
CREATE POLICY "Allow update on sarees" ON public.sarees FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete on sarees" ON public.sarees;
CREATE POLICY "Allow delete on sarees" ON public.sarees FOR DELETE USING (true);

-- Inquiries Policies:
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow view inquiries" ON public.inquiries;
CREATE POLICY "Allow view inquiries" ON public.inquiries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update inquiries" ON public.inquiries;
CREATE POLICY "Allow update inquiries" ON public.inquiries FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete inquiries" ON public.inquiries;
CREATE POLICY "Allow delete inquiries" ON public.inquiries FOR DELETE USING (true);

-- ==============================================================================
-- 4. CREATE SUPABASE STORAGE BUCKET: 'saree-images'
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('saree-images', 'saree-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies:
DROP POLICY IF EXISTS "Public Access to Saree Images" ON storage.objects;
CREATE POLICY "Public Access to Saree Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'saree-images');

DROP POLICY IF EXISTS "Allow upload to saree images" ON storage.objects;
CREATE POLICY "Allow upload to saree images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'saree-images');

DROP POLICY IF EXISTS "Allow update saree images" ON storage.objects;
CREATE POLICY "Allow update saree images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'saree-images');

DROP POLICY IF EXISTS "Allow delete saree images" ON storage.objects;
CREATE POLICY "Allow delete saree images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'saree-images');
