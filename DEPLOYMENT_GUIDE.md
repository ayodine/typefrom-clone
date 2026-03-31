# Typeform Clone: Developer & Deployment Guide

This document serves as the memory and blueprint for how this project was built, how it communicates with the database, and how to update it in the future.

## Tech Stack
- **Frontend**: React (Vite SPA)
- **Styling**: Vanilla CSS (`App.css` and `index.css`)
- **Database**: Supabase PostgreSQL
- **Hosting**: Netlify via GitHub CI/CD

---

## The Database (Supabase)

### Row Level Security (RLS)
The most critical part of this application's architecture is the Supabase RLS configuration. Since this is a client-side only React app, we expose the **Publishable `anon` Key** to the world. 

To prevent hackers from changing data, the `form_submissions` table has RLS enabled with very specific rules:
1. The `anon` role is granted `INSERT` and `SELECT` permissions on the table.
2. The RLS policy explicitly allows the `anon` role to `INSERT` new rows.
3. *Crucial fix*: Since the React code does `await supabase...insert().select()`, the database *must* also allow the `anon` role to `SELECT` the row it just created.

If you ever need to recreate the database, the exact bulletproof SQL script is saved in `supabase/create_table.sql`.

---

## How to Make Changes and Update the Live Site

The site is hosted on **Netlify**, which is directly connected to the `ayodine/typefrom-clone` GitHub repository. You do not need to manually build or deploy anything.

**Step-by-step update process:**
1. Open the code locally and make your changes (e.g., editing `src/questions.js` or `src/App.jsx`).
2. Test it locally by running the dev server:
   ```bash
   npm run dev
   ```
3. Once you are happy with the changes, open your terminal and push to GitHub:
   ```bash
   git add .
   git commit -m "Describe what you changed here"
   git push
   ```
4. Within seconds, Netlify will detect the push, build the app, and update the live URL automatically.

---

## Environment Variables & Configs

### Local Development (`.env`)
To run the app locally on `localhost`, you must have an `.env` file in the root directory containing:
```
VITE_SUPABASE_URL=https://[YOUR_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```
*(Note: Because of the `vite.config.js`, all prefix variables MUST start with `VITE_`)*

### Production (Netlify)
The `.env` file is intentionally ignored by `.gitignore` so your secrets don't end up public on GitHub. Therefore, **Netlify gets its variables from its own UI**. 
If you ever create a new Supabase project, you must update the variables in:
**Netlify Dashboard → Site configuration → Environment variables**.

### Netlify Config (`netlify.toml`)
Because this is a Single Page Application (SPA), we need to tell Netlify to redirect all traffic to `index.html`. This configuration is saved in `netlify.toml` in the root directory. Do not delete this file.

---

## Notable Features Added
- **Calendly Integration**: On the final success screen (rendered in `src/App.jsx` when `submitted === true`), there is a "Book Your Mentorship Call" button. It is currently hardcoded to `https://calendly.com/ayodine47/30min`. If your Calendly link changes in the future, just search for that URL in `App.jsx` and replace it!
