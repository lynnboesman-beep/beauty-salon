# Update Database Types After Migration

After running the SQL migrations, you need to regenerate the TypeScript types.

## Method 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

## Method 2: Manual Download from Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Settings** > **API**
3. Scroll down to **Generated Types**
4. Copy the TypeScript types
5. Replace the content of `src/lib/database.types.ts` with the new types

## What the Migration Adds

The migration adds:
- `image_url` field to the `services` table (TEXT, nullable)
- Storage bucket `service-images` for storing service images
- Proper RLS policies for image upload/access

## Verify the Migration

After running the migration, verify in your Supabase dashboard:
1. **Database** > **Tables** > `services` should have an `image_url` column
2. **Storage** should have a `service-images` bucket
3. **Authentication** > **Policies** should show the storage policies