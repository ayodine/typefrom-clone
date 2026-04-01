export const questions = [
  {
    id: "q1",
    type: "dropdown",
    title: "What country are you based in?",
    required: true,
    options: ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Nigeria", "Other (Type to Search)"] // Reduced for demo
  },
  {
    id: "q2",
    type: "multiple_choice",
    title: "How long have you been trading Forex?",
    required: true,
    options: [
      "Less than 6 months",
      "6–12 months",
      "1–2 years",
      "2–5 years",
      "5+ years"
    ]
  },
  {
    id: "q3",
    type: "multiple_choice",
    title: "What do you believe is the main reason you have not yet reached consistent profitability?",
    required: true,
    options: [
      "I do not have a clear system",
      "I struggle with discipline",
      "My psychology affects my execution",
      "My risk management is weak",
      "I lack structure and accountability",
      "I know what to do but fail to do it consistently",
      "Other"
    ]
  },
  {
    id: "q4",
    type: "multiple_choice",
    title: "Which best describes your current trading situation?",
    required: true,
    options: [
      "I am still learning the basics",
      "I know what to do but I struggle with consistency",
      "I have a strategy but my psychology affects me",
      "I am profitable but want to scale",
      "I want a structured system and accountability"
    ]
  },
  {
    id: "q5",
    type: "multiple_choice",
    title: "Are you currently profitable?",
    required: true,
    options: [
      "Yes, consistently",
      "Sometimes",
      "Break-even",
      "No"
    ]
  },
  {
    id: "q6",
    type: "long_text",
    title: "Why are you looking for private 1:1 mentorship instead of continuing on your own?",
    required: true
  },
  {
    id: "q7",
    type: "multiple_choice",
    title: "Are you willing to follow a strict process, journal your trades, backtest, and be held accountable?",
    required: true,
    options: ["Yes", "No"]
  },
  {
    id: "q8",
    type: "multiple_choice",
    title: "If accepted into this private mentorship, are you ready to make a $5,000 investment into building a structured, repeatable trading system for long-term freedom?",
    required: true,
    options: ["Yes", "No"]
  },
  {
    id: "q9",
    type: "contact_group",
    title: "Contact Details",
    required: true,
    fields: [
      { id: "firstName", label: "First Name", type: "text" },
      { id: "lastName", label: "Last Name", type: "text" },
      { id: "email", label: "Email Address", type: "email" },
      { id: "phone", label: "Phone Number", type: "tel" }
    ]
  }
];
