import React, { useEffect, useMemo, useRef, useState } from 'react';

// Suggest top 3 matches (case-insensitive) and fill input on click
const AutoSuggestInput = ({ 
  value, 
  onChange, 
  data, 
  placeholder = 'Search...', 
  getLabel = (x) => x, 
  onEnter,
  className = 'form-control ams-input'
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const matches = useMemo(() => {
    if (!query || !data) return [];
    const lowerQuery = query.toLowerCase();
    return data
      .filter(item => {
        const label = getLabel(item);
        return label && label.toLowerCase().includes(lowerQuery);
      })
      .slice(0, 3); // Use containsIgnoreCase to support partial, case-insensitive search
  }, [query, data, getLabel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []); // Close suggestions when clicking outside the component

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (item) => {
    const label = getLabel(item);
    setQuery(label);
    onChange?.(label);
    setIsOpen(false);
    onEnter?.(label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      onEnter?.(query);
    }
  };

  return (
    <div className="ams-autosuggest" ref={ref}>
      <input
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {isOpen && matches.length > 0 && (
        <div className="ams-suggest-menu">
          {matches.map((item, idx) => (
            <div
              key={idx}
              className="ams-suggest-item"
              onClick={() => handleSuggestionClick(item)}
            >
              {getLabel(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoSuggestInput;
