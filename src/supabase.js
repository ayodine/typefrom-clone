import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing. Form submissions will not be saved.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Submit a completed form to Supabase.
 * 
 * @param {Object} answers - The form answers keyed by question ID
 * @returns {{ success: boolean, error?: string }}
 */
export async function submitFormResponse(answers) {
  if (!supabase) {
    console.warn('Supabase not configured. Logging submission locally.');
    console.log('Form submission:', answers);
    return { success: true };
  }

  try {
    const payload = {
      country: answers.q1 || null,
      trading_duration: answers.q2 || null,
      profitability_reason: answers.q3 || null,
      trading_situation: answers.q4 || null,
      currently_profitable: answers.q5 || null,
      mentorship_reason: answers.q6 || null,
      willing_to_follow_process: answers.q7 || null,
      investment_ready: answers.q8 || null,
      first_name: answers.q9?.firstName || null,
      last_name: answers.q9?.lastName || null,
      email: answers.q9?.email || null,
      phone: answers.q9?.phone || null,
      best_time_to_reach: answers.q9?.bestTime || null,
    };

    const { data, error } = await supabase
      .from('form_submissions')
      .insert([payload]);

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    console.log('Form submitted successfully');

    try {
      // Dispatch background email notification without blocking the UI
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "d11ddcb6-f66f-4d5f-88ba-9b6126b6ff37";
      fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
             access_key: web3FormsKey,
             subject: `New Mentorship Lead: ${payload.first_name || ''} ${payload.last_name || ''}`,
             from_name: "Mentorship Application",
             replyto: payload.email || undefined, /* Allows clicking "Reply" in gmail to direct reply to the lead */
             "First Name": payload.first_name,
             "Last Name": payload.last_name,
             "Email": payload.email,
             "Phone": payload.phone,
             "Best Time To Reach": payload.best_time_to_reach,
             "Country": payload.country,
             "Trading Duration": payload.trading_duration,
             "Biggest Struggle": payload.profitability_reason,
             "Trading Situation": payload.trading_situation,
             "Currently Profitable": payload.currently_profitable,
             "Why Need Mentorship": payload.mentorship_reason,
             "Willing to Follow Process": payload.willing_to_follow_process,
             "Investment Ready": payload.investment_ready
          })
      }).catch(e => console.error("Email notification error:", e));
    } catch (emailErr) {
      console.warn("Attempted to send mail failed locally", emailErr);
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error submitting form:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Sign in as an administrator.
 */
export async function signInAdmin(email, password) {
  // Always support the offline demo credentials for testing convenience
  if (email === "admin@swingtradefx.com" && password === "admin123") {
    const user = { email, id: "demo-admin-id", user_metadata: { role: "admin" } };
    localStorage.setItem('demo_session', JSON.stringify(user));
    return { success: true, user };
  }

  if (!supabase) {
    return { success: false, error: 'Supabase credentials missing. Use demo account: admin@swingtradefx.com / admin123' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Sign out administrator.
 */
export async function signOutAdmin() {
  localStorage.removeItem('demo_session');
  if (!supabase) return { success: true };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Sign out error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check for active admin user session.
 */
export async function getAdminUser() {
  const demoSession = localStorage.getItem('demo_session');
  if (demoSession) return JSON.parse(demoSession);
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('Error fetching admin user:', err);
    return null;
  }
}

/**
 * Listen to auth state transitions.
 */
export function onAdminAuthStateChange(callback) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const demoSession = localStorage.getItem('demo_session');
    if (demoSession) {
      callback(event, JSON.parse(demoSession));
    } else {
      callback(event, session ? session.user : null);
    }
  });
  return () => subscription.unsubscribe();
}

/**
 * Fetch all form submissions (admin-only, protected by RLS).
 */
export async function fetchSubmissions() {
  const isDemoSession = localStorage.getItem('demo_session') !== null;
  if (!supabase || isDemoSession) {
    console.warn('Returning mock submissions (Demo Mode).');
    return { success: true, data: getMockSubmissions() };
  }
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error fetching submissions:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update a lead's properties (status, notes).
 */
export async function updateSubmission(id, updates) {
  const isDemoSession = localStorage.getItem('demo_session') !== null || id.startsWith('mock-');
  if (!supabase || isDemoSession) {
    console.warn('Mock update locally (Demo Mode).');
    try {
      const saved = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
      const updated = saved.map(l => l.id === id ? { ...l, ...updates } : l);
      localStorage.setItem('demo_submissions', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to update mock submissions in localStorage', err);
    }
    return { success: true };
  }
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating submission:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a lead.
 */
export async function deleteSubmission(id) {
  const isDemoSession = localStorage.getItem('demo_session') !== null || id.startsWith('mock-');
  if (!supabase || isDemoSession) {
    console.warn('Mock delete locally (Demo Mode).');
    try {
      const saved = JSON.parse(localStorage.getItem('demo_submissions') || '[]');
      const updated = saved.filter(l => l.id !== id);
      localStorage.setItem('demo_submissions', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to delete mock submission in localStorage', err);
    }
    return { success: true };
  }
  try {
    const { error } = await supabase
      .from('form_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting submission:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Mock data helper for developers running locally without keys
 */
function getMockSubmissions() {
  // Try retrieving from localStorage if available, so local edits persist across refreshes!
  try {
    const saved = localStorage.getItem('demo_submissions');
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Failed to load demo submissions from localStorage', err);
  }

  const defaults = [
    {
      id: "mock-1",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      first_name: "James",
      last_name: "Smith",
      email: "james.smith@example.com",
      phone: "+1 555-0199",
      best_time_to_reach: "Afternoon",
      country: "United States",
      trading_duration: "1–2 years",
      profitability_reason: "I struggle with discipline",
      trading_situation: "I know what to do but I struggle with consistency",
      currently_profitable: "Sometimes",
      mentorship_reason: "Need live reviews of my execution mistakes and structured rules to stick to.",
      willing_to_follow_process: "Yes",
      investment_ready: "Yes",
      status: "New",
      notes: "Emailed him to introduce myself. Seems highly motivated."
    },
    {
      id: "mock-2",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      first_name: "Sarah",
      last_name: "Connor",
      email: "sarah.c@gmail.com",
      phone: "+61 491 570 156",
      best_time_to_reach: "Morning",
      country: "Australia",
      trading_duration: "Less than 6 months",
      profitability_reason: "I do not have a clear system",
      trading_situation: "I am still learning the basics",
      currently_profitable: "No",
      mentorship_reason: "Looking for an expert mentor to bypass years of trial and error.",
      willing_to_follow_process: "Yes",
      investment_ready: "No",
      status: "Contacted",
      notes: "Wants to join but currently hesitant on the $5,000 package. Call scheduled for tomorrow."
    },
    {
      id: "mock-3",
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      first_name: "Alex",
      last_name: "Müller",
      email: "alex.muller@web.de",
      phone: "+49 170 555 1234",
      best_time_to_reach: "Evening",
      country: "Germany",
      trading_duration: "2–5 years",
      profitability_reason: "My psychology affects my execution",
      trading_situation: "I have a strategy but my psychology affects me",
      currently_profitable: "Break-even",
      mentorship_reason: "Struggling with psychological hurdles on large funded accounts. Need guidance to scale.",
      willing_to_follow_process: "Yes",
      investment_ready: "Yes",
      status: "Enrolled",
      notes: "Enrolled in the June cohort! Paid full."
    },
    {
      id: "mock-4",
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      first_name: "David",
      last_name: "Beckham",
      email: "david.b@outlook.com",
      phone: "+44 7911 123456",
      best_time_to_reach: "Anytime",
      country: "United Kingdom",
      trading_duration: "5+ years",
      profitability_reason: "My risk management is weak",
      trading_situation: "I am profitable but want to scale",
      currently_profitable: "Yes, consistently",
      mentorship_reason: "Wanting high level networking and direct private backing access.",
      willing_to_follow_process: "No",
      investment_ready: "Yes",
      status: "Archived",
      notes: "Unwilling to follow rules or keep logs. Archived."
    }
  ];

  try {
    localStorage.setItem('demo_submissions', JSON.stringify(defaults));
  } catch (err) {
    console.warn('Failed to save demo submissions to localStorage', err);
  }
  return defaults;
}

