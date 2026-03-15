'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  variant = 'light',
  className = '',
  disabled = false,
  zIndex = 50,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState('bottom');
  const buttonRef = useRef(null);

  const isDark = variant === 'dark';

  const toggleMenu = (e) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setMenuPlacement('top');
      } else {
        setMenuPlacement('bottom');
      }
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={buttonRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggleMenu}
        className={`
          flex justify-between items-center w-full px-4 py-2 rounded-lg border
          ${
            isDark
              ? 'bg-gray-900 text-gray-200 border-gray-700'
              : 'bg-white text-gray-900 border-gray-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="truncate">
          {value
            ? options.find((opt) => opt.value === value)?.label
            : placeholder}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`
            absolute left-0 right-0 rounded-lg shadow-lg max-h-60 overflow-y-auto
            ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-200 text-gray-900'
            }
            border
            ${menuPlacement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'}
          `}
          style={{ zIndex: zIndex + 30 }}
        >
          {options.length > 0 ? (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-600/20 ${
                  value === opt.value
                    ? isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-100'
                    : ''
                }`}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-400">No options</div>
          )}
        </div>
      )}
    </div>
  );
}

// Gradient Select variant for user dropdown
export function GradientSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  // Extract height class from className and remove it from the container
  const heightMatch = className.match(/h-\w+/);
  const heightClass = heightMatch ? heightMatch[0] : 'h-10';
  const containerClassName = className.replace(/h-\w+/g, '').trim();

  return (
    <div className={`relative ${containerClassName} z-20`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
          text-white px-4 py-2 rounded-lg flex items-center space-x-2 ${heightClass}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-purple-500
        `}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          {selectedOption?.icon ? (
            <img
              src={selectedOption.icon}
              alt={selectedOption.label}
              className="w-5 h-5 rounded-full object-cover bg-white"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-400" />
          )}
        </div>
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-white transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto min-w-max z-50">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    flex items-center px-3 py-2 cursor-pointer transition-colors text-black
                    hover:bg-gray-100
                    ${
                      value === option.value
                        ? 'bg-purple-50 text-purple-700'
                        : ''
                    }
                  `}
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    {option.icon ? (
                      <img
                        src={option.icon}
                        alt={option.label}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
export function ColoredSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  backgroundColor = 'bg-green-500',
  textColor = 'text-white',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  // Check if custom height is provided in className
  const hasCustomHeight = className.includes('h-');
  const defaultHeight = hasCustomHeight ? '' : 'h-10';

  // Extract height class from className and remove it from the container
  const heightMatch = className.match(/h-\w+/);
  const heightClass = heightMatch ? heightMatch[0] : 'h-10';
  const containerClassName = className.replace(/h-\w+/g, '').trim();

  return (
    <div className={`relative ${containerClassName} z-20`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${backgroundColor} ${textColor} border-none ${heightClass} rounded-lg w-full px-3 
          flex items-center justify-between font-medium
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-purple-500
        `}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors text-black
                    hover:bg-gray-100
                    ${
                      value === option.value
                        ? 'bg-purple-50 text-purple-700'
                        : ''
                    }
                  `}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
