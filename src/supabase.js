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
      .insert([payload])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    console.log('Form submitted successfully:', data);

    try {
      // Dispatch background email notification without blocking the UI
      fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
             access_key: "d11ddcb6-f66f-4d5f-88ba-9b6126b6ff37",
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
