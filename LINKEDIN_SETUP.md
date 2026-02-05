# MIRACH Social Manager - LinkedIn Setup Guide

## 🚀 Getting Started

### 1. Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Run the schema (already created if you ran schema.sql)
-- Now add storage bucket for images:

-- Create storage bucket for media
insert into storage.buckets (id, name, public) 
values ('media', 'media', true);

-- Allow public access to media bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'media' );

create policy "Authenticated Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'media' );
```

### 2. LinkedIn App Setup

1. Go to https://developer.linkedin.com/
2. Create a new app
3. Add `w_member_social` and `openid` `profile` to OAuth scopes
4. Add redirect URL: `http://localhost:3000/api/auth/linkedin/callback`
5. Copy Client ID and Client Secret

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ueqkwveszntzfqsbvxsj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Connect LinkedIn

1. Start the app: `npm run dev`
2. Go to http://localhost:3000
3. Click "Connect LinkedIn"
4. Authorize the app
5. The token is stored in a cookie (for now)

**IMPORTANT:** The token expires in 2 months. You'll need to reconnect periodically.

### 5. Post to LinkedIn

1. Create a post in the dashboard
2. Click "Approve"
3. Click "Post to LinkedIn"
4. Check your LinkedIn - it should be live!

## 📸 Image Upload

- Click "Add Images" when creating a post
- Max 5 images, 5MB each
- Images are uploaded to Supabase Storage
- Currently, LinkedIn posting with images requires additional setup (see LinkedIn Asset API)

## 🔧 Troubleshooting

**"LinkedIn not connected" error:**
- Make sure you've clicked "Connect LinkedIn" and authorized
- Check that your LinkedIn app has the correct redirect URL

**"Failed to post" error:**
- Check browser console for detailed error
- Make sure your access token hasn't expired
- Verify you have `w_member_social` scope in your LinkedIn app

**Images not uploading:**
- Check Supabase Storage bucket 'media' exists
- Check file size is under 5MB
- Check file is an image (jpg, png, gif)

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Update LinkedIn app redirect URL to production URL
5. Deploy!

## 📋 Next Features

- [ ] Schedule posts for future
- [ ] Add Instagram/Facebook APIs
- [ ] Analytics dashboard
- [ ] Multiple user accounts
- [ ] Auto-refresh LinkedIn token

## 🛠️ For Production

Store LinkedIn tokens in database instead of cookies:

```sql
-- Add to schema:
create table linkedin_tokens (
  id uuid default gen_random_uuid() primary key,
  access_token text not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```
