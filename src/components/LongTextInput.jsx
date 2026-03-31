import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

export default function LongTextInput({ value, onChange, onSubmit }) {
  const textareaRef = useRef(null);

  // Auto resize the textarea based on content
  const handleInput = (e) => {
    const target = e.target;
    onChange(target.value);
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value?.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="text-input-wrapper">
      <textarea
        ref={textareaRef}
        className="base-text-input"
        placeholder="Type your answer here..."
        value={value || ''}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={1}
        style={{ resize: 'none', overflow: 'hidden', minHeight: '40px' }}
      />
      <div className="long-text-hint">
        <strong>Shift ⇧</strong> + <strong>Enter ↵</strong> to make a line break
      </div>
      {value && value.trim() && (
        <div className="ok-button-container">
          <button className="ok-button" onClick={onSubmit}>
            OK <Check size={20} />
          </button>
          <span className="press-enter">press <strong>Enter ↵</strong></span>
        </div>
      )}
    </div>
  );
}
