import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Check, Loader2 } from 'lucide-react';
import { questions } from './questions';
import { submitFormResponse } from './supabase';
import './App.css';

/* ──────────────────────── Error Boundary ──────────────────────── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#ff4d4f' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ──────────────────────── Input Components (inline) ──────────────────────── */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function MCInput({ options, value, onSelect }) {
  return (
    <ul className="multiple-choice-list">
      {options.map((option, i) => (
        <li
          key={i}
          className={'choice-item' + (value === option ? ' selected' : '')}
          onClick={() => onSelect(option)}
          style={{ '--index': i }}
        >
          <div className="choice-letter">{LETTERS[i]}</div>
          <div className="choice-text">{option}</div>
          {value === option && <Check size={20} className="choice-check" />}
        </li>
      ))}
    </ul>
  );
}

function DropdownInput({ options, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const [hl, setHl] = useState(0);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus({ preventScroll: true });
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (opt) => {
    setSearch(opt);
    setOpen(false);
    setTimeout(() => onSelect(opt), 300);
  };

  return (
    <div className="dropdown-container" ref={ref}>
      <div className="dropdown-input-wrapper" onClick={() => setOpen(!open)}>
        <input
          ref={inputRef}
          type="text"
          className="dropdown-input"
          placeholder="Type or select an option"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); setHl(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHl(h => Math.min(h + 1, filtered.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHl(h => Math.max(h - 1, 0)); }
            else if (e.key === 'Enter' && open && filtered[hl]) { e.preventDefault(); select(filtered[hl]); }
          }}
        />
      </div>
      {open && (
        <div className="dropdown-menu">
          {filtered.length > 0 ? filtered.map((opt, i) => (
            <div key={opt} className={'dropdown-item' + (i === hl ? ' highlighted' : '')} onMouseEnter={() => setHl(i)} onClick={() => select(opt)}>
              {opt}
            </div>
          )) : <div className="dropdown-item" style={{color:'var(--text-tertiary)'}}>No options found</div>}
        </div>
      )}
      {value && !open && (
        <div className="ok-button-container">
          <button className="ok-button" onClick={() => onSelect(value)}>OK <Check size={20} /></button>
          <span className="press-enter">press <strong>Enter ↵</strong></span>
        </div>
      )}
    </div>
  );
}

function LongTextInput({ value, onChangeValue, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) ref.current.focus({ preventScroll: true });
    }, 700); // Wait for CSS transition to finish
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-input-wrapper">
      <textarea
        ref={ref}
        className="base-text-input"
        placeholder="Type your answer here..."
        value={value || ''}
        onChange={e => {
          onChangeValue(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (value?.trim()) onDone(); }
        }}
        rows={1}
        style={{ resize: 'none', overflow: 'hidden', minHeight: 40 }}
      />
      <div className="long-text-hint"><strong>Shift ⇧</strong> + <strong>Enter ↵</strong> to make a line break</div>
      {value?.trim() && (
        <div className="ok-button-container">
          <button className="ok-button" onClick={onDone}>OK <Check size={20} /></button>
          <span className="press-enter">press <strong>Enter ↵</strong></span>
        </div>
      )}
    </div>
  );
}

function ContactInput({ fields, value, onChangeValue, onDone, submitting, submitError }) {
  const ref = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) ref.current.focus({ preventScroll: true });
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="contact-group">
      {fields.map((field, i) => (
        <div key={field.id} className="contact-field">
          <label className="contact-label">{field.label}</label>
          <input
            ref={i === 0 ? ref : null}
            className="base-text-input"
            type={field.type}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            value={(value && value[field.id]) || ''}
            onChange={e => onChangeValue({ ...value, [field.id]: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            disabled={submitting}
          />
        </div>
      ))}
      {submitError && (
        <div className="submit-error">{submitError}</div>
      )}
      <button className="submit-button" onClick={onDone} disabled={submitting}>
        {submitting ? (
          <><Loader2 size={20} className="spinner" /> Submitting...</>
        ) : (
          'Submit form'
        )}
      </button>
    </div>
  );
}

/* ──────────────────────── Main App ──────────────────────── */

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const containerRef = useRef(null);
  const totalQ = questions.length;

  const goNext = () => setActiveIndex(i => Math.min(i + 1, totalQ - 1));
  const goPrev = () => setActiveIndex(i => Math.max(i - 1, 0));

  const BrandingHeader = () => (
    <div className="branding-header">
      <img src="/fav_dark.svg" alt="Logo" className="branding-logo" />
      <span className="branding-text">Swingtradefxacademy</span>
    </div>
  );

  // Keyboard nav (arrows only when not in input)
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Wheel debounce
  useEffect(() => {
    let t;
    const handler = (e) => {
      if (t) return;
      if (Math.abs(e.deltaY) > 50) {
        e.deltaY > 0 ? goNext() : goPrev();
        t = setTimeout(() => { t = null; }, 1200);
      }
    };
    const el = containerRef.current;
    if (el) el.addEventListener('wheel', handler, { passive: true });
    return () => { if (el) el.removeEventListener('wheel', handler); };
  }, []);

  const setAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitFormResponse(answers);
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error || 'Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="app-container">
        <BrandingHeader />
        <div className="questions-wrapper">
          <div className="question-section active">
            <div className="question-content" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div className="question-title" style={{ justifyContent: 'center', marginBottom: 0 }}>
                <div>Thanks for completing this form! 🎉</div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 18, margin: 0 }}>
                You're one step closer to consistent profitability. Let's get you on the calendar.
              </p>
              
              <button 
                className="submit-button" 
                style={{ 
                  marginTop: '32px', 
                  width: 'auto', 
                  minWidth: '280px',
                  padding: '16px 40px', 
                  fontSize: '18px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 4px 14px 0 rgba(0, 85, 254, 0.39)'
                }}
                onClick={() => window.open('https://calendly.com/ayodine47/30min', '_blank')}
              >
                Book Your Mentorship Call
              </button>
            </div>
          </div>
        </div>
        <div className="progress-bar" style={{ width: '100%' }} />
      </div>
    );
  }

  const progress = ((activeIndex + 1) / totalQ) * 100;

  return (
    <div className="app-container" ref={containerRef}>
      <BrandingHeader />
      <div className="questions-wrapper">
        {questions.map((q, idx) => {
          const isActive = idx === activeIndex;
          const isPrev = idx < activeIndex;
          const cls = 'question-section' + (isActive ? ' active' : '') + (isPrev ? ' prev' : '');

          return (
            <div key={q.id} className={cls}>
              <div className="question-content">
                <div className="question-title">
                  <span className="question-number">{idx + 1} {q.required && <span className="question-asterisk">*</span>}</span>
                  <div>{q.title}</div>
                </div>

                {/* Render ONLY for active question. Each type is rendered independently (different key prefix) */}
                {isActive && q.type === 'dropdown' && (
                  <DropdownInput
                    key={'drop-' + q.id}
                    options={q.options}
                    value={answers[q.id]}
                    onSelect={(v) => { setAnswer(q.id, v); goNext(); }}
                  />
                )}
                {isActive && q.type === 'multiple_choice' && (
                  <MCInput
                    key={'mc-' + q.id}
                    options={q.options}
                    value={answers[q.id]}
                    onSelect={(v) => { setAnswer(q.id, v); setTimeout(goNext, 400); }}
                  />
                )}
                {isActive && q.type === 'long_text' && (
                  <LongTextInput
                    key={'lt-' + q.id}
                    value={answers[q.id]}
                    onChangeValue={(v) => setAnswer(q.id, v)}
                    onDone={goNext}
                  />
                )}
                {isActive && q.type === 'contact_group' && (
                  <ContactInput
                    key={'cg-' + q.id}
                    fields={q.fields}
                    value={answers[q.id]}
                    onChangeValue={(v) => setAnswer(q.id, v)}
                    onDone={handleSubmit}
                    submitting={submitting}
                    submitError={submitError}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="navigation-container">
        <div className="nav-buttons">
          <button className="nav-button" onClick={goPrev} disabled={activeIndex === 0}><ChevronUp size={20} /></button>
          <div className="nav-separator" />
          <button className="nav-button" onClick={goNext} disabled={activeIndex === totalQ - 1}><ChevronDown size={20} /></button>
        </div>
      </div>

      <div className="progress-bar" style={{ width: progress + '%' }} />
    </div>
  );
}

export default function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
