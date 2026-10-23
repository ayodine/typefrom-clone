# Swingtradefxacademy Mentorship Form

A fully custom, high-converting Typeform alternative built in React (Vite) and styled with a custom CSS Design System. This project includes an intelligent custom dynamic autocomplete dropdown, a full 9-step responsive UI, and is fully integrated with a **Supabase PostgreSQL** database to persist leads.

---

## 🛠 Required Setup After Deployment

After deploying the site to your hosting provider, make sure to add the following two environment variables so the application can communicate with your Supabase database:
* `VITE_SUPABASE_URL` = (Your Supabase URL)
* `VITE_SUPABASE_ANON_KEY` = (Your massive Supabase Anon Key string)

*(Ensure that the environment variables are exposed to the browser build, as Vite requires the `VITE_` prefix)*

---

## ⚙️ Local Development Environment

If you want to edit or run the code locally:

```bash
# Install dependencies
npm install

# Start the local development server (http://localhost:5173/)
npm run dev
```

Remember to place your `.env` file in the root directory locally containing:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
