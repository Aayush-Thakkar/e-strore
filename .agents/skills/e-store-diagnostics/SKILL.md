---
name: e-store-diagnostics
description: Complete diagnostic map, subsystem architecture, and troubleshooting runbook for the Anandam E-Store codebase. Use when debugging errors, adding features, or identifying where components, data flows, and state live.
---

# Anandam E-Store: Technical Architecture & Diagnostic Runbook

This skill is the central reference and troubleshooting guide for the **Anandam E-Store** project. When something is broken or malfunctioning, consult this guide to pinpoint the root cause, identify the affected files, and apply the correct fix.

---

## 1. System Architecture & Tech Stack

```
                                  USER BROWSER
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           ▼                            ▼                           ▼
      Home / Catalog            Product Detail Page           Admin Atelier
    [src/app/page.tsx]        [src/app/saree/[id]/]        [src/app/admin/]
           │                            │                           │
           ▼                            ▼                           ▼
     SareeCard.tsx              ImageWithFallback            CRUD Modal & Canvas
           │                            │                      WebP Compressor
           └─────────────┬──────────────┘                           │
                         ▼                                          │
                  InquiryModal.tsx                                  │
              (WhatsApp Link Generator)                             │
                         │                                          │
                         └──────────────────┬───────────────────────┘
                                            ▼
                               [src/lib/saree-service.ts]
                         (Unified Service Layer & Dual-Mode Fallback)
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
          When Supabase configured                    When Offline / Not configured
             [src/lib/supabase.ts]                      [src/lib/mock-data.ts]
           • PostgreSQL Database                       • LocalStorage keys:
             - public.sarees                             - anandam_sarees_store_v2
             - public.inquiries                          - anandam_inquiries_store_v2
           • Storage Bucket: saree-images              • Initial fallback items
```

### Core Technologies & Constraints
* **Framework:** Next.js 16.4.3 (App Router).
  > **Crucial:** Build and dev commands must use the `--webpack` flag (`next dev --webpack` / `next build --webpack`) due to `@tailwindcss/postcss` bundler integration.
* **UI Engine:** React 19.3.0. Dynamic route parameters must be unwrapped asynchronously with `use(params)`.
* **Styling:** Tailwind CSS v4. Styles are loaded via `@import "tailwindcss";` and `@source` paths in `src/app/globals.css`.
* **Backend:** Supabase (`@supabase/supabase-js`) with transparent `localStorage` fallback.
* **Storage & Optimization:** In-browser HTML5 Canvas compressor converts photos to high-quality `.webp` before upload.
* **Hosting:** Netlify via `@netlify/plugin-nextjs`.

---

## 2. Codebase Map & Subsystems

### Subsystem 1: Storefront & Browsing
* **`src/app/page.tsx`**: Main catalogue page. Handles search query filtering, category tabs (`Saree`, `Suit`, `Lehenga`, `Indo-Western`), sorting (price, newest, featured), and inquiry modal trigger.
* **`src/components/SareeCard.tsx`**: Single product card showing primary photo, title, fabric, price/discount, quantity counter stepper, and "Direct WhatsApp Inquiry" button.
* **`src/components/Header.tsx`**: Luxury burgundy & gold header with brand monogram and category taglines.
* **`src/components/Footer.tsx`**: Silk Mark authenticity badges, store location, and WhatsApp concierge trigger.

### Subsystem 2: Single Product View
* **`src/app/saree/[id]/page.tsx`**: Dynamic product detail page. Supports lookup by either UUID or human-readable slug. Features image gallery switcher (primary and secondary photos), full fabric specifications, related category pieces, and direct WhatsApp inquiry flow.

### Subsystem 3: Ordering & WhatsApp Concierge
* **`src/components/InquiryModal.tsx`**: Customer inquiry modal. Collects customer name, 10-digit mobile number, address, and notes.
  * Formats pre-filled message: `*Namaste Anandam Sarees* 🙏...`
  * Links to `https://wa.me/918982776402?text=...`
  * Logs inquiry to Supabase `inquiries` table and local fallback via `submitInquiry()`.

### Subsystem 4: Data Layer & Supabase Integration
* **`src/lib/supabase.ts`**: Initializes Supabase client. Normalizes URL (strips `/rest/v1` or trailing slashes) and sets `isSupabaseConfigured` flag.
* **`src/lib/saree-service.ts`**: The core API service layer:
  * `fetchAllSarees()`: Fetches from Supabase `sarees` table, falls back to `localStorage` or `INITIAL_SAREES`.
  * `fetchSareeById(idOrSlug)`: Looks up product by UUID or slug in database, then fallback.
  * `createSaree()`, `updateSaree()`, `deleteSaree()`: Handles CRUD and storage cleanup.
  * `uploadSareeImage(file)`: Compresses image with `compressImage()`, uploads to Supabase `saree-images` bucket.
  * `submitInquiry()`, `fetchInquiries()`, `updateInquiryStatus()`: Manages lead submissions.
* **`src/lib/mock-data.ts`**: Default boutique seed data (`INITIAL_SAREES`) and `PRODUCT_CATEGORIES`.
* **`supabase-schema.sql`**: Complete database schema, RLS policies, and storage bucket setup script.

### Subsystem 5: Image Pipeline & Fallback
* **`src/lib/image-compressor.ts`**: HTML5 Canvas bicubic interpolation. Scales images down (max 1400x1800, 82% quality) into WebP blobs, reducing 10–25MB raw camera uploads to ~150KB.
* **`src/components/ImageWithFallback.tsx`**: Protects UI against broken or deleted image URLs by automatically rendering a fallback stock saree photo on error.
* **`next.config.ts`**: Disables server image optimization (`unoptimized: true`) and allows wildcard HTTPS image domains.

### Subsystem 6: Admin Management Atelier
* **`src/app/admin/login/page.tsx`**: Admin login page. Authenticates via Supabase Auth `signInWithPassword` or local demo fallback.
* **`src/app/admin/page.tsx`**: Admin portal. Features:
  * Catalogue statistics (Total products, signature featured pieces).
  * Add / Edit product modal with deferred photo upload (photos staged locally until final submit).
  * 250-word description constraint validation.
  * Delete product with automatic Supabase storage cleanup via `deleteStorageImages()`.

---

## 3. "Where to Look When Something Breaks" (Failure Triage Matrix)

| Failure Symptom | Primary File to Inspect | Secondary Files | Typical Root Cause & Fix |
| :--- | :--- | :--- | :--- |
| **New products or edits don't persist / Reverting to initial items** | `src/lib/saree-service.ts` (lines 123–214) | `src/lib/supabase.ts`, `.env.local` | `isSupabaseConfigured` evaluated to `false`. Ensure `.env.local` has valid `NEXT_PUBLIC_SUPABASE_URL` (`https://...`) and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| **Image upload fails in Admin panel ("Failed to upload photo")** | `src/lib/saree-service.ts` (lines 350–395) | `supabase-schema.sql` (lines 83–109) | Storage bucket `saree-images` does not exist or lacks public INSERT policy. Run Section 4 of `supabase-schema.sql` in Supabase SQL Editor. |
| **Product images broken / 404 image icons** | `src/components/ImageWithFallback.tsx` | `next.config.ts`, `src/lib/saree-service.ts` | Remote domain blocked or image file was deleted from bucket. Check `ImageWithFallback` for error handling and `next.config.ts` remotePatterns. |
| **WhatsApp order button does not open or sends to wrong number** | `src/components/InquiryModal.tsx` (lines 28–30, 92) | `src/components/Footer.tsx` (line 6) | Verify phone number formatting in `InquiryModal.tsx`. Must be digits only (`918982776402`) without `+`, spaces, or parentheses. |
| **Admin login loop / Cannot access `/admin`** | `src/app/admin/login/page.tsx` (lines 18–35, 66–98) | `src/app/admin/page.tsx` (lines 101–131) | Session verification issue. If using local demo mode, check `localStorage.getItem("anandam_admin_auth")`. For Supabase Auth, verify user exists in Supabase Auth Users table. |
| **Product detail page crashes or 404s** | `src/app/saree/[id]/page.tsx` (lines 27–58) | `src/lib/saree-service.ts` (lines 148–170) | Next.js 16 async params: verify `use(params)` is present. Check whether the URL contains an id or slug, and verify `fetchSareeById` resolves it. |
| **Tailwind styles missing or build errors** | `src/app/globals.css` (lines 1–4) | `package.json` (lines 5–10) | Tailwind CSS v4 requires `@import "tailwindcss";` and `@source` paths. Next.js must be run with `--webpack` flag (`next dev --webpack`, `next build --webpack`). |
| **LocalStorage quota exceeded error** | `src/lib/saree-service.ts` (lines 23–45) | Browser LocalStorage | Local storage exceeded 5MB when storing base64 strings. `saveLocalSarees()` automatically sanitizes large `data:` URLs to prevent crash. |
| **Netlify deployment build failure** | `netlify.toml` | `.env.local` / Netlify Dashboard | Ensure `@netlify/plugin-nextjs` is present in `netlify.toml` and environment variables are set in Netlify site settings. |

---

## 4. Key Diagnostic Commands

```bash
# Test production build and TypeScript compilation
npm run build

# Run development server with Webpack
npm run dev

# Run ESLint validation
npm run lint

# Check git status and uncommitted changes
git status
```
