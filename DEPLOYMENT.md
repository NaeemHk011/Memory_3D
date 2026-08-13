# Memory3D Crystal Shop — Deployment Guide

---

## Overview

| Part | Tech | Hosted On |
|---|---|---|
| Frontend | React + Vite | cPanel `public_html` or Vercel/Netlify |
| Backend | PHP | cPanel (any shared hosting) |

---

## Step 1 — Build the Frontend

On your local machine:

```bash
# 1. Create production .env file
cp .env.example .env

# 2. Set the PHP backend URL (where you'll upload the backend folder)
# Edit .env:
VITE_API_URL=https://yourdomain.com/memory3d-api

# Optional: if deploying inside a subfolder, set the frontend base too
# Example for public_html/shop/:
VITE_APP_BASE=/shop/

# 3. Install dependencies (first time only)
npm install

# 4. Build
npm run build
```

This creates a `dist/` folder — these are the files to upload.

---

## Step 2 — Upload Frontend to cPanel

### Option A — Root domain (recommended)

1. Open **cPanel → File Manager → public_html**
2. Delete existing files (backup first if needed)
3. Upload all contents of the `dist/` folder into `public_html/`
4. The frontend build now includes a `.htaccess` rewrite file, so upload the full `dist/` contents as-is.

> This keeps client-side routing working on page refresh.

### Option B — Subdomain (e.g. shop.yourdomain.com)

1. Create subdomain in cPanel pointing to a folder (e.g. `public_html/shop/`)
2. Upload `dist/` contents into that folder
3. Set `VITE_APP_BASE=/shop/` before building so asset and router paths resolve correctly
4. Upload the full `dist/` contents, including the generated `.htaccess`

---

## Step 3 — Upload PHP Backend to cPanel

The `backend/` folder goes into a **separate directory** — NOT inside `public_html`.

1. Create a folder in cPanel File Manager: `public_html/memory3d-api/`
2. Upload these files maintaining the folder structure:

```
public_html/memory3d-api/
├── .htaccess          ← contains credentials + security rules
├── config.php         ← utility functions
└── ghl/
    └── submit.php     ← order submission handler
```

> You can rename `memory3d-api` to anything — just match it in `VITE_API_URL`.

---

## Step 4 — Set Credentials in .htaccess

Edit `backend/.htaccess` with your live credentials before uploading:

```apache
Options -Indexes
RewriteEngine On

# Pass Authorization header to PHP
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

# ── GHL + ImgBB credentials ──────────────────────────────
SetEnv GHL_PRIVATE_TOKEN   your_ghl_private_token_here
SetEnv GHL_LOCATION_ID     your_location_id_here
SetEnv GHL_PIPELINE_ID     your_pipeline_id_here
SetEnv GHL_STAGE_ID        your_stage_id_here
SetEnv IMGBB_API_KEY       your_imgbb_key_here

# Block direct access to config.php
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>
```

### Where to find these values:

| Variable | Where to get it |
|---|---|
| `GHL_PRIVATE_TOKEN` | GHL → Settings → Private Integrations → your integration token |
| `GHL_LOCATION_ID` | GHL → Settings → Business Info → Location ID |
| `GHL_PIPELINE_ID` | GHL → Opportunities → your pipeline → copy ID from URL |
| `GHL_STAGE_ID` | GHL API or pipeline settings page |
| `IMGBB_API_KEY` | [imgbb.com/api](https://imgbb.com/api) → free account → API key |

---

## Step 5 — Verify PHP is Working

Test the endpoint directly in your browser or Postman:

```
POST https://yourdomain.com/memory3d-api/ghl/submit.php
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@test.com",
  "phone": "+1234567890",
  "cartItems": [{ "shapeLabel": "Rectangle Tall", "sizeLabel": "Medium", "price": 100, "addons": [] }],
  "totalPrice": 100
}
```

**Expected response:**
```json
{ "success": true }
```

**Common errors:**

| Error | Fix |
|---|---|
| `Server misconfigured: missing GHL env variables` | Check `.htaccess` SetEnv values are correct |
| `Failed to create GHL contact` | Check `GHL_PRIVATE_TOKEN` and `GHL_LOCATION_ID` |
| `No response from server` | PHP folder path doesn't match `VITE_API_URL` |
| 403 on `config.php` | That's correct — it's blocked by `.htaccess` |
| CORS error in browser | Make sure `backend/.htaccess` is uploaded |

---

## Step 6 — Final Checklist

```
[ ] dist/ uploaded to public_html
[ ] frontend `.htaccess` uploaded with dist files
[ ] backend/ uploaded to public_html/memory3d-api/
[ ] backend/.htaccess has correct GHL + ImgBB credentials
[ ] VITE_API_URL in .env matches the backend folder URL
[ ] VITE_APP_BASE is `/` for root deploy or matches the subfolder path
[ ] Test order goes through → GHL shows new contact + opportunity
[ ] Test order from a different email → GHL creates a NEW separate contact
```

---

## Local Development

```bash
npm run dev
```

Set `.env` for local:
```
VITE_API_URL=http://localhost/memory3d-api
```

Run PHP locally with XAMPP:
- Place `backend/` folder in `C:/xampp/htdocs/memory3d-api/`
- Start Apache in XAMPP Control Panel
- Visit `http://localhost/memory3d-api/ghl/submit.php`

---

## Project Structure (for reference)

```
Memory3D/
├── src/                    ← React source code
│   ├── routes/             ← pages (shop, checkout, cart, etc.)
│   ├── components/         ← UI components
│   ├── data/products.ts    ← all crystal shapes + pricing
│   └── assets/crystals/    ← crystal frame PNGs
├── backend/                ← PHP backend (upload to cPanel)
│   ├── .htaccess
│   ├── config.php
│   └── ghl/submit.php
├── dist/                   ← built frontend (after npm run build)
├── .env                    ← local env vars (never commit)
└── .env.example            ← template
```
