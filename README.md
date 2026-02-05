# MIRACH Social Manager

A custom social media management tool built for MIRACH POS.

## Features

- Content calendar
- Approval workflow (draft → approve → post)
- LinkedIn integration (more platforms coming)
- Simple analytics tracking

## Setup

1. Run the SQL schema in Supabase:
   ```sql
   -- Copy contents of supabase/schema.sql into Supabase SQL Editor
   ```

2. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   # Fill in your credentials
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run locally:
   ```bash
   npm run dev
   ```

5. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Environment Variables

See `.env.local.example` for required variables.

## Project Structure

```
/src
  /app           # Next.js app router
  /components    # React components
  /lib           # Utility functions
/supabase
  schema.sql     # Database schema
```
