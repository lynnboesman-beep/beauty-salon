# Complete Setup Instructions: Stripe Payment + Image Upload

## 🎯 **What You Need to Do**

### **Step 1: Database Migration (REQUIRED)**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Open SQL Editor** for your salon project
3. **Run these SQL commands one by one**:

```sql
-- 1. Add image_url column to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Add comment to the column
COMMENT ON COLUMN public.services.image_url IS 'URL of the service image stored in Supabase Storage';
```

### **Step 2: Set Up Supabase Storage**

Run this SQL to create the storage bucket and policies:

```sql
-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to service images
CREATE POLICY "Public read access for service images" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

-- Policy to allow authenticated users to upload service images
CREATE POLICY "Authenticated users can upload service images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete service images
CREATE POLICY "Authenticated users can delete service images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);
```

### **Step 3: Set Up Stripe Account**

1. **Create a Stripe Account**: https://stripe.com/
2. **Get your API keys** from the Stripe Dashboard:
   - Go to **Developers** > **API Keys**
   - Copy your **Publishable key** and **Secret key** (use TEST keys for now)
3. **Update your `.env.local` file** with real Stripe keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_existing_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_supabase_key

# Stripe Configuration (REPLACE WITH YOUR REAL KEYS)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Step 4: Update Database Types (REQUIRED)**

After running the database migration, you need to regenerate TypeScript types:

**Option A - Using Supabase CLI (Recommended):**
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

**Option B - Manual from Dashboard:**
1. Go to Supabase Dashboard > **Settings** > **API**
2. Scroll to **Generated Types**
3. Copy the TypeScript code
4. Replace content of `src/lib/database.types.ts`

### **Step 5: Test the Application**

```bash
npm run build
```

If the build succeeds, you can test:

```bash
npm run dev
```

## 🚀 **Features Now Available**

### **For Admins:**
- ✅ **Add services with images** (required)
- ✅ **View service images** in admin panel
- ✅ **Delete services** (automatically removes images)

### **For Customers:**
- ✅ **View services with beautiful images**
- ✅ **3-step booking process**:
  1. Enter details (name, service, staff, date, time)
  2. **Pay with Stripe** (credit/debit card)
  3. **Confirmation** (booking only created after successful payment)

### **Payment Security:**
- ✅ **No booking without payment**
- ✅ **Stripe handles all payment processing**
- ✅ **Payment verification before booking creation**
- ✅ **Payment ID stored with appointment**

## 🔧 **Troubleshooting**

### **Build Errors:**
- **"image_url does not exist"**: Run the database migration first
- **"Stripe not found"**: Check your `.env.local` file has correct Stripe keys
- **"Storage bucket not found"**: Create the storage bucket via SQL

### **Image Upload Issues:**
- Check storage bucket exists and is public
- Verify storage policies are set correctly
- Ensure file is under 5MB and is an image format

### **Payment Issues:**
- Use Stripe test card: `4242 4242 4242 4242`
- Check Stripe keys are correct in `.env.local`
- Verify webhook endpoint if using webhooks

## 🎨 **Next Steps**

After basic setup works:
1. **Add real Stripe keys** for production
2. **Style the payment form** to match your brand
3. **Add email confirmations** for bookings
4. **Set up Stripe webhooks** for payment tracking
5. **Add more service management features**

---

**Need Help?** All the code is ready, you just need to run the database migrations and add your Stripe keys!