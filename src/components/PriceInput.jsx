import React, { useState, useEffect } from 'react';

// Reusable price input component that doesn't format while typing
export const PriceInput = ({ value, onChange, step = "0.01", className = "", decimals = 2 }) => {
  const [localValue, setLocalValue] = useState(value.toFixed(decimals));
  const [isFocused, setIsFocused] = useState(false);
  
  // Update local value when external value changes (but not while focused)
  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toFixed(decimals));
    }
  }, [value, isFocused, decimals]);
  
  return (
    <input
      type="number"
      step={step}
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        const parsed = parseFloat(e.target.value);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        const parsed = parseFloat(localValue);
        if (!isNaN(parsed)) {
          setLocalValue(parsed.toFixed(decimals));
        }
      }}
      className={className}
    />
  );
};
