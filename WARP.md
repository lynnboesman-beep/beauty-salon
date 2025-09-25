# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15 salon management application with TypeScript that integrates Supabase for backend services and Stripe for payments. The app features a customer-facing booking system and an admin dashboard for managing appointments, services, and staff.

## Key Technologies & Architecture

- **Next.js 15** with App Router (src-based structure)
- **TypeScript** with strict mode enabled
- **Supabase** for authentication, database, and file storage
- **Stripe** for payment processing
- **CSS Modules** for component-specific styling
- **React 19** with modern hooks and features

## Common Development Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Building & Production
npm run build        # Build for production
npm start           # Start production server

# Linting
npm run lint        # Run ESLint

# Database Type Generation
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard (protected)
│   ├── booking/           # Multi-step booking flow
│   ├── login/             # Authentication page
│   ├── api/               # API routes for payments and bookings
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── Header.tsx         # Navigation with role-based visibility
│   └── PaymentForm.tsx    # Stripe payment integration
└── lib/                   # Utility libraries
    ├── supabase.ts        # Supabase client configuration
    ├── stripe.ts          # Stripe client setup
    ├── database.types.ts  # Auto-generated Supabase types
    └── utils/             # Server utilities
```

## Authentication & Authorization

- **Supabase Auth** handles user authentication
- **Role-based access**: Admin users are identified via the `staff` table with `role = 'admin'`
- **Protected routes**: Admin pages check authentication and redirect to `/login` if unauthorized
- **Header component** conditionally shows admin links based on user role

## Database Schema

The application uses these main Supabase tables:
- `services` - Service offerings with pricing and images
- `staff` - Staff members with roles and authentication
- `clients` - Customer information
- `appointments` - Booking records with payment references

**Important**: The `services` table includes an `image_url` column for storing service images via Supabase Storage.

## Payment Flow

1. **Booking Details**: Customer enters service, staff, date/time preferences
2. **Payment Intent**: Creates Stripe PaymentIntent via `/api/create-payment-intent`
3. **Payment Processing**: Stripe Elements handles secure card processing
4. **Booking Confirmation**: After successful payment, creates appointment via `/api/confirm-booking`

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Development Setup Requirements

1. **Supabase Database**: Run SQL migrations in `supabase/` folder
2. **Storage Setup**: Configure `service-images` bucket for file uploads
3. **Stripe Account**: Set up payment processing with test keys
4. **Type Generation**: Regenerate database types after schema changes

## Key Development Patterns

- **CSS Modules**: Each component has a corresponding `.module.css` file
- **TypeScript Strict**: Full type safety with Supabase-generated types
- **Client Components**: Most components use `'use client'` directive for interactivity
- **Error Handling**: Consistent error states and user feedback across forms
- **Server Actions**: API routes handle secure operations (payments, bookings)

## File Upload Architecture

Service images are uploaded to Supabase Storage:
- **Bucket**: `service-images` (public read access)
- **Policies**: Authenticated users can upload/delete, public can read
- **Integration**: Images are referenced by URL in the `services.image_url` column

## Payment Security

- **No booking without payment**: Appointments are only created after successful Stripe payment
- **Payment verification**: Server validates payment status before creating database records
- **Stripe handles PCI compliance**: No sensitive payment data stored locally