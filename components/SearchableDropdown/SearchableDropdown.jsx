'use client';

import { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  icon: Icon = null,
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.id, option.name);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative group" ref={dropdownRef}>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#32BBAB] transition-colors pointer-events-none z-10" />
        )}
        <div
          className={`rounded-lg border text-sm w-full py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-10 outline-none duration-200 bg-gray-50/60 focus:bg-white focus:ring-2 cursor-pointer ${
            hasError
              ? 'border-red-400 focus:border-red-400 focus:ring-red-500/15'
              : 'border-gray-200 focus:border-[#32BBAB] focus:ring-[#32BBAB]/15'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedOption ? (
            <span className="text-gray-800">{selectedOption.name}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#32BBAB]/20 focus:border-[#32BBAB]"
              autoFocus
            />
          </div>
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                    value === option.id ? 'bg-[#32BBAB]/10 text-[#279487] font-medium' : 'text-gray-700'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;