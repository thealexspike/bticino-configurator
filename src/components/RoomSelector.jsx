import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n';

export function RoomSelector({ value, onChange, existingRooms }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = React.useRef(null);
  const t = useTranslation();

  // Common room suggestions as fallback (translated)
  const defaultRooms = [
    t.livingRoom, t.kitchen, `${t.bedroom} 1`, `${t.bedroom} 2`, `${t.bedroom} 3`,
    `${t.bathroom} 1`, `${t.bathroom} 2`, t.hallway, t.entrance, t.office,
    t.diningRoom, t.garage, t.laundry, t.storage, t.balcony
  ];

  // Combine existing rooms with defaults, existing first
  const allSuggestions = useMemo(() => {
    const existing = existingRooms.filter(r => r && r.trim());
    const combined = [...new Set([...existing, ...defaultRooms])];
    return combined;
  }, [existingRooms, defaultRooms]);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return allSuggestions;
    const lower = inputValue.toLowerCase();
    return allSuggestions.filter(room => 
      room.toLowerCase().includes(lower)
    );
  }, [inputValue, allSuggestions]);

  const handleSelect = (room) => {
    setInputValue(room);
    onChange(room);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={t.room + '...'}
        className="w-full border rounded px-3 py-2"
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredSuggestions.map((room, idx) => {
            const isExisting = existingRooms.includes(room);
            return (
              <li
                key={idx}
                onClick={() => handleSelect(room)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
              >
                <span>{room}</span>
                {isExisting && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                    {t.used}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
