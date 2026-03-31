import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { ChevronDown, Check } from 'lucide-react';

export default function DropdownInput({ question, value, onChange, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const options = question.options.filter(opt =>
    opt.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSearchValue(option);
    setIsOpen(false);
    setTimeout(() => {
      onSubmit();
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && options[highlightedIndex]) {
        handleSelect(options[highlightedIndex]);
      } else if (!isOpen && value) {
        onSubmit();
      }
    }
  };

  return (
    <div className="dropdown-container" ref={wrapperRef}>
      <div
        className="dropdown-input-wrapper"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          ref={inputRef}
          type="text"
          className="dropdown-input"
          placeholder="Type or select an option"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown className="dropdown-icon" size={24} />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {options.length > 0 ? (
            options.map((option, index) => (
              <div
                key={option}
                className={classNames('dropdown-item', {
                  'highlighted': index === highlightedIndex
                })}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="dropdown-item" style={{ color: 'var(--text-tertiary)' }}>
              No options found
            </div>
          )}
        </div>
      )}

      {value && !isOpen && (
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
