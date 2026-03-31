import React, { useRef, useEffect } from 'react';

export default function ContactGroupInput({ question, value = {}, onChange, onSubmit }) {
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleChange = (fieldId, fieldValue) => {
    onChange({ ...value, [fieldId]: fieldValue });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="contact-group">
      {question.fields.map((field, index) => (
        <div key={field.id} className="contact-field">
          <label className="contact-label">{field.label}</label>
          <input
            ref={index === 0 ? firstInputRef : null}
            className="base-text-input"
            type={field.type}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            value={value[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      ))}

      <button className="submit-button" onClick={onSubmit}>
        Submit form
      </button>
    </div>
  );
}
