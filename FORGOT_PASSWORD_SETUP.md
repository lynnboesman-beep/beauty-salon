# 🔐 Forgot Password Setup Guide

## 📋 Supabase Configuration Required

To make the forgot password feature work properly, you need to configure the allowed redirect URLs in your Supabase project dashboard.

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: **gxyfclhxdbnogkvrtvvc** (Beauty Salon project)

### Step 2: Configure Redirect URLs

1. In your project dashboard, navigate to:
   **Authentication** → **URL Configuration**

2. In the **"Redirect URLs"** field, add these URLs (one per line):

```
http://localhost:3000/reset-password
https://yourbeautyourpriority.vercel.app/reset-password
```

3. Click **Save**

### Step 3: Test the Flow

#### Development Testing:
1. Run your dev server: `npm run dev`
2. Go to: http://localhost:3000/debug-auth (to verify URLs)
3. Go to: http://localhost:3000/login
4. Click "Forgot your password?"
5. Enter a valid email address
6. Check your email for the reset link
7. Click the reset link - should redirect to: http://localhost:3000/reset-password

#### Production Testing:
1. Deploy your changes to Vercel
2. Go to: https://yourbeautyourpriority.vercel.app/login
3. Click "Forgot your password?"
4. Enter a valid email address
5. Check your email for the reset link
6. Click the reset link - should redirect to: https://yourbeautyourpriority.vercel.app/reset-password

## 🔍 Troubleshooting

### If the email link doesn't work:

1. **Check Supabase Configuration:**
   - Verify both URLs are added to the Redirect URLs field
   - Make sure there are no typos in the URLs
   - Ensure you clicked "Save" after adding the URLs

2. **Check Email:**
   - Look in your spam/junk folder
   - Make sure you're using a real email address
   - Wait a few minutes for the email to arrive

3. **Check Console Errors:**
   - Open browser developer tools (F12)
   - Look for any JavaScript errors when clicking the reset link

4. **Verify Environment:**
   - Make sure your `.env.local` file has the correct Supabase credentials
   - Restart your development server after making changes

### Expected Email Flow:

```
User enters email → Supabase sends email → User clicks link in email → 
Redirects to /reset-password with tokens → User enters new password → 
Password updated → Redirect to login with success message
```

## 📧 Email Template (Optional)

If you want to customize the reset password email:

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Select "Reset Password" template
3. Customize the email content as needed
4. Make sure the confirmation link remains: `{{ .ConfirmationURL }}`

## 🚀 Deployment Notes

- The production URL is automatically used when `NODE_ENV=production`
- Vercel automatically sets this environment variable in production
- No additional configuration needed for deployment

## ✅ Security Features

- Email links expire after 1 hour
- Tokens are single-use only
- User is automatically signed out after password reset
- All requests go through Supabase's secure authentication system

---

## 📞 Support

If you encounter issues:
1. Check the debug page: `/debug-auth`
2. Verify your Supabase project settings
3. Test with a real email address
4. Check browser console for errors

Your Supabase project URL: `https://gxyfclhxdbnogkvrtvvc.supabase.co`
Your production domain: `https://yourbeautyourpriority.vercel.app`