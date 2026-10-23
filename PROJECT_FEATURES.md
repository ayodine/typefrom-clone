# Project Profile: Swingtradefxacademy Mentorship Form (Typeform Clone)

This document outlines the core features, architectural highlights, and technical stack of the project. Below, you will find descriptions of the functionalities along with professionally formatted **resume bullet points** that you can copy and paste directly into your resume.

---

## 🛠️ Tech Stack & Architecture
* **Frontend**: React (v19), Vite (v8)
* **Styling**: Custom CSS Design System (Custom layout structure, transition handlers, responsive CSS variables)
* **Backend / Database**: Supabase (PostgreSQL), Row-Level Security (RLS) policies
* **Integration**: Web3Forms API (automated email dispatcher), Lucide Icons
* **Hosting / CI/CD**: Netlify (One-click deployment templates, automated CD pipelines)

---

## 📄 Ready-To-Use Resume Bullet Points

### Option 1: Full-Stack / Integration-Focused
* **Developed and deployed** a high-converting, responsive Typeform clone using **React**, **Vite**, and **Supabase**, serving as the lead-generation funnel for a trading mentorship program.
* **Integrated Supabase PostgreSQL** database with secure **Row-Level Security (RLS)** rules and custom policies, ensuring compliant data ingestion while maintaining a public-facing API endpoint.
* **Architected an asynchronous notification pipeline** using the **Web3Forms API** that delivers real-time email alerts for new leads in the background without affecting frontend application latency.
* **Built a custom, keyboard-accessible autocomplete dropdown** component featuring real-time client-side search, index-based arrow navigation, and a fallback mechanism to capture custom user-defined text.

### Option 2: Frontend / UX-Focused
* **Designed a multi-modal user navigation system** supporting debounced trackpad scroll wheel triggers, window keydown listener shortcuts, and interactive tactile floating navigation controls.
* **Optimized user input experiences** by writing custom UI controls, including letter-keyed choice inputs, a custom fuzzy-search dropdown, and a auto-expanding textarea that adjusts dynamically using DOM scroll-height variables.
* **Created a dynamic completion indicator** and progress bar component that tracks form completion states to maximize UX and application conversion rates.
* **Implemented robust system stability** by wrapping the React application tree in an **Error Boundary** handler and building design-system load states to manage asynchronous backend operations gracefully.

---

## ⚙️ Core Technical Features & Implementations

### 1. Interactive Form Flow & State Machine
* **Single-Page Section Manager**: Utilizes dynamic CSS transitions to transition active, previous, and next states for a 9-step application form.
* **Progress Tracking**: Features a dynamic progress indicator computing active index position against total questions: `(activeIndex + 1) / totalQ * 100`.
* **Error Resilience**: Uses a custom React `ErrorBoundary` component wrapper to intercept UI anomalies and display clean error summaries without crashing the page.

### 2. Custom Input Component Suite
To deliver a high-quality user experience similar to Typeform, standard HTML inputs were replaced with custom interactive React components:
* **Fuzzy-Search Autocomplete Dropdown (`DropdownInput.jsx`)**:
  * Implements dynamic filters based on user text queries.
  * Allows arrow key navigation (`ArrowDown`/`ArrowUp`) and choice selection with `Enter`.
  * Automatically shifts focus to search inputs upon question entry using deferred timeouts (`setTimeout` inside `useEffect`).
  * Supports custom option submissions if the desired item is not pre-populated.
* **Auto-Expanding Long Text Input (`LongTextInput.jsx`)**:
  * Calculates `scrollHeight` in real-time to adjust element height dynamically, preventing scrollbars in input areas.
  * Supports submission on `Enter` and linebreaks on `Shift + Enter`.
* **Hotkeyed Choice Items (`MCInput`)**:
  * Maps choice lists to alphabetical keyboard badges (A, B, C, etc.) with custom selection visual states.
* **Contact Group Form (`ContactInput`)**:
  * Bundles multiple inputs (First Name, Last Name, Email, Phone Number, and Contact Window) into a single state payload, reducing database round-trips.

### 3. Navigation Layer
* **Debounced Mouse/Trackpad Listener**: Intercepts `wheel` events, checks delta magnitudes, and limits page transitions using a custom delay window (1200ms) to ensure smooth UX.
* **Keyboard Shortcuts**: Detects global keyboard commands (`ArrowUp` / `ArrowDown`) while verifying the user is not actively typing in input fields (`HTMLInputElement`/`HTMLTextAreaElement`).

### 4. Database Schema & Security
* **Supabase Client Wrapper (`supabase.js`)**:
  * Detects presence of environmental credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and defaults to local console simulation if undefined to support a developer-friendly playground.
* **PostgreSQL Schema (`create_table.sql`)**:
  * Structured table schema recording specific trading data points, geographical locations, and contact records.
  * Explicit indexes applied (`idx_form_submissions_created_at` on `created_at DESC`) to speed up administrative sorting.
* **Row Level Security (RLS)**:
  * Restricts table permissions strictly by database role.
  * Employs an `anon` insert policy (`allow_anon_insert`) for public application submissions.
  * Enforces an authenticated read policy (`allow_authenticated_select`) so that only authorized administrators can view submissions.
