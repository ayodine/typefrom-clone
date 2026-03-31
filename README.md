# Swingtradefxacademy Mentorship Form

A fully custom, high-converting Typeform alternative built in React (Vite) and styled with a custom CSS Design System. This project includes an intelligent custom dynamic autocomplete dropdown, a full 9-step responsive UI, and is fully integrated with a **Supabase PostgreSQL** backend database to persist leads.

## 🚀 One-Click Deploy Template

If your previous Netlify account ran out of credits, or you simply want to instantly spin up a clone of this repository on a brand new, free Netlify account, click the button below:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ayodine/typefrom-clone)

*Clicking this button will securely log you into your new Netlify account, automatically pull this exact codebase from your GitHub, set up the Continuous Deployment pipeline, and deploy it live to the web in under 60 seconds.*

---

## 🛠 Required Setup After Deployment

After you deploy to Netlify using the button above, your site will be live, but it won't be able to talk to your Supabase database until you give it the keys.

1. Go to your new Netlify Dashboard for this site.
2. Navigate to **Site configuration** -> **Environment variables**.
3. Add the following two variables (which you can find in your Supabase dashboard):
   - `VITE_SUPABASE_URL` = (Your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = (Your massive Supabase Anon Key string)
4. Trigger a new deploy (or just wait for the next time you push to GitHub) to apply the keys!

---

## ⚙️ Local Development Environment

If you want to edit the code locally on your machine:
```bash
# Install dependencies
npm install

# Start the local development server (http://localhost:5173/ )
npm run dev
```

Remember to also place your `.env` file in the root directory locally so the local server can communicate with Supabase!
