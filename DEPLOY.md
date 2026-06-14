# Deploy Project Ascend to Vercel + Supabase (Free)

You are deploying a React 19 + Vite 6 app called "Project Ascend" — an RPG self-improvement tracker. It's already built and running locally. The backend is Supabase. The frontend needs to go on Vercel.

---

## Step 1: Supabase Backend Check

Before deploying the frontend, make sure Supabase is ready:

### 1a. Run the schema
- Go to Supabase Dashboard → SQL Editor
- Copy everything from `supabase/schema.sql` in this repo
- Paste and run it

### 1b. Enable Google OAuth
- Supabase → Authentication → Providers → Google
- Toggle ON
- Enter your Google Cloud OAuth client ID and secret (create one at https://console.cloud.google.com/apis/credentials if you haven't)

### 1c. Get your API keys
- Supabase → Settings → API
- Note these two values for Step 3:
  - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
  - **anon public key** (starts with `eyJhb...`)

---

## Step 2: Push to GitHub (if not already)

The repo is at `c:\Users\faysa\Downloads\project-ff\`. If it's not already a git repo:

```bash
cd c:\Users\faysa\Downloads\project-ff
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/project-ff.git
git push -u origin main
```

Make sure `.env.local` is in `.gitignore` (contains your Supabase keys — never commit these).

---

## Step 3: Deploy Frontend on Vercel

### 3a. Sign up
- Go to https://vercel.com
- Sign in with GitHub (free tier)

### 3b. Import project
- Click "New Project"
- Select the `project-ff` repo from GitHub
- Vercel auto-detects Vite — no config changes needed

### 3c. Add Environment Variables
Under "Environment Variables", add these two:

| Key                      | Value                                |
|--------------------------|--------------------------------------|
| `VITE_SUPABASE_URL`      | `https://xxxxxxxxxxxx.supabase.co`   |
| `VITE_SUPABASE_ANON_KEY` | `eyJhb...` (your Supabase anon key)  |

Make sure both are set for ALL environments (Production, Preview, Development).

### 3d. Deploy
- Click "Deploy"
- Wait ~30 seconds
- You'll get a URL like `https://project-ff.vercel.app`

### 3e. Verify
- Open the Vercel URL
- Test: Sign in with Google (should work)
- Test: Ghost Protocol (offline mode, works without auth)

---

## Step 4: Fix OAuth Redirect

- Go to Supabase → Authentication → URL Configuration
- Add your Vercel URL: `https://project-ff.vercel.app`
- Also add `https://project-ff.vercel.app/**` as a wildcard
- Save

Now Google sign-in works on the deployed site.

---

## Step 5: Invite Friends

Share the URL: `https://project-ff.vercel.app`

Each friend:
1. Clicks "Sign in with Google" — their own Google account
2. Or clicks "Ghost Protocol" — plays offline, no account needed
3. Gets their own profile, quests, streaks, everything

### Optional: Custom Domain
- Buy a domain on Namecheap/Cloudflare (~$10/year)
- Vercel → Settings → Domains → Add domain
- Follow the DNS instructions (takes ~5 minutes)

---

## Free Tier Limits (Are we safe?)

| Service | Free Limit | Reality |
|---------|-----------|---------|
| Vercel | 100GB bandwidth/month | 3-5 friends = maybe 2GB. Safe. |
| Supabase | 500MB database, 50K monthly users | You'll use ~5MB. Safe. |
| Both | Unlimited projects on free tier | ✅ |

You won't hit any limits with a handful of friends.

---

## If Something Breaks

### "Service Worker registration failed"
- Expected on Vercel dev domains. Ignore.
- Works once you add a custom domain with HTTPS.

### "Failed to fetch" or blank screen
- Check env vars on Vercel (Step 3c). Missing Supabase keys = broken.
- Check Vercel deploy logs for build errors.

### Google sign-in doesn't work
- Did you add the Vercel URL to Supabase allowed redirects? (Step 4)
- Is Google OAuth enabled in Supabase? (Step 1b)

---

## App Tech Stack (for reference)

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Framer Motion
- **Backend**: Supabase (Postgres + Auth + Realtime)
- **PWA**: service worker at `public/sw.js`, manifest at `public/manifest.json`
- **Entry point**: `src/main.tsx` → `src/App.tsx`
- **TypeScript**: strict mode, `tsc --noEmit` must pass before deploy
