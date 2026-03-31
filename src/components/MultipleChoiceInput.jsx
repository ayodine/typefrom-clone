import React, { useEffect, useCallback, useRef } from 'react';
import classNames from 'classnames';
import { Check } from 'lucide-react';

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function MultipleChoiceInput({ question, value, onChange, onSubmit }) {
  const timeoutRef = useRef(null);

  // Clean up pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSelect = useCallback((option) => {
    onChange(option);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onSubmit();
    }, 400);
  }, [onChange, onSubmit]);

  // Keyboard shortcuts: A, B, C...
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      const index = LETTERS.indexOf(key);
      if (index >= 0 && index < question.options.length) {
        handleSelect(question.options[index]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question.options, handleSelect]);

  return (
    <ul className="multiple-choice-list">
      {question.options.map((option, index) => {
        const isSelected = value === option;
        const letter = LETTERS[index];
        return (
          <li
            key={index}
            className={classNames('choice-item', { 'selected': isSelected })}
            onClick={() => handleSelect(option)}
            style={{ '--index': index }}
          >
            <div className="choice-letter">{letter}</div>
            <div className="choice-text">{option}</div>
            {isSelected && <Check size={20} className="choice-check" />}
          </li>
        );
      })}
    </ul>
  );
}
