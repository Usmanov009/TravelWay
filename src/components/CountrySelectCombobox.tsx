import React, { useState, useRef, useEffect, useMemo } from 'react';
import { KompasCountry } from './SearchScreen';

interface CountrySelectComboboxProps {
  countries: KompasCountry[];
  selectedCode: string;
  onSelectCountry: (code: string) => void;
  label?: string;
  id?: string;
  placeholder?: string;
}

export const CountrySelectCombobox: React.FC<CountrySelectComboboxProps> = ({
  countries,
  selectedCode,
  onSelectCountry,
  label = '🌍 Borish mamlakati (Страна)',
  id = 'country-select-combobox',
  placeholder = 'Davlat nomini yozing...'
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Currently selected country
  const selectedCountry = useMemo(() => {
    return countries.find((c) => c.code === selectedCode) || countries[0];
  }, [countries, selectedCode]);

  // Filtered countries based on user typing
  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [countries, query]);

  // Dynamic flag in input: reflects current match while typing or selected country
  const currentDisplayFlag = useMemo(() => {
    if (isOpen && query.trim()) {
      const topMatch = filteredCountries[0];
      if (topMatch) return topMatch.flag;
    }
    return selectedCountry ? selectedCountry.flag : '🌍';
  }, [isOpen, query, filteredCountries, selectedCountry]);

  // Sync query text when selectedCountry changes and dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedCountry ? selectedCountry.name : '');
    }
  }, [selectedCountry, isOpen]);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCountries.length]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Revert query to current selected country name
        if (selectedCountry) {
          setQuery(selectedCountry.name);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedCountry]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredCountries.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCountries.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCountries[highlightedIndex]) {
        handleSelect(filteredCountries[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      if (selectedCountry) {
        setQuery(selectedCountry.name);
      }
      inputRef.current?.blur();
    }
  };

  const handleSelect = (country: KompasCountry) => {
    onSelectCountry(country.code);
    setQuery(country.name);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Select all text on focus for quick typing
    inputRef.current?.select();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allOption = countries.find((c) => c.code === 'ALL') || countries[0];
    if (allOption) {
      handleSelect(allOption);
    }
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative p-2.5 rounded-2xl border transition-colors"
      style={{
        backgroundColor: 'var(--tw-subtle)',
        borderColor: isOpen ? 'var(--tw-accent)' : 'var(--tw-border)'
      }}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-0.5">
        <label
          htmlFor={id}
          className="text-[10px] block font-semibold cursor-pointer select-none"
          style={{ color: 'var(--tw-text-sub)' }}
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
        >
          {label}
        </label>
        {selectedCode !== 'ALL' && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-slate-400 hover:text-white tap-bounce"
            title="Barchasiga qaytarish"
          >
            Barchasi ✕
          </button>
        )}
      </div>

      {/* Select + Type Input Field with Flag in front of the name */}
      <div className="flex items-center gap-1.5 cursor-pointer">
        {/* Davlat bayrog'i doimo nomining oldida */}
        <span
          className="text-base select-none shrink-0"
          title={selectedCountry?.name}
          onClick={() => {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
        >
          {currentDisplayFlag}
        </span>

        {/* Typeable Input */}
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={handleInputFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-text truncate"
          style={{ color: 'var(--tw-text-main)' }}
        />

        {/* Dropdown chevron button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="text-[11px] p-0.5 tap-bounce shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--tw-text-sub)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          title={isOpen ? 'Yopish' : 'Ro‘yxatni ko‘rish'}
        >
          ▾
        </button>
      </div>

      {/* Dropdown Menu (Selectable items with flag in front of name) */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-xl overflow-hidden animate-fadeIn"
          style={{
            backgroundColor: 'var(--tw-surface)',
            borderColor: 'var(--tw-border)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Quick hint for typing */}
          <div
            className="px-3 py-1.5 border-b text-[10px] font-semibold flex items-center justify-between"
            style={{
              borderColor: 'var(--tw-border)',
              backgroundColor: 'var(--tw-subtle)',
              color: 'var(--tw-text-sub)'
            }}
          >
            <span>Qidirish yoki tanlash:</span>
            <span>{filteredCountries.length} ta davlat</span>
          </div>

          <ul
            ref={listRef}
            className="max-h-56 overflow-y-auto no-scrollbar py-1"
            role="listbox"
          >
            {filteredCountries.length === 0 ? (
              <li
                className="px-3 py-3 text-center text-xs"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                "{query}" bo'yicha davlat topilmadi
              </li>
            ) : (
              filteredCountries.map((c, index) => {
                const isSelected = c.code === selectedCode;
                const isHighlighted = index === highlightedIndex;
                return (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(c);
                    }}
                    onClick={() => handleSelect(c)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className="px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isHighlighted
                        ? 'var(--tw-subtle)'
                        : isSelected
                        ? 'var(--tw-accent-light)'
                        : 'transparent',
                      color: isSelected ? 'var(--tw-accent)' : 'var(--tw-text-main)'
                    }}
                  >
                    {/* Davlat bayrog'i nomining oldida */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{c.flag}</span>
                      <span
                        className={`truncate ${
                          isSelected ? 'font-black' : 'font-semibold'
                        }`}
                      >
                        {c.name}
                      </span>
                    </div>

                    {isSelected && (
                      <span
                        className="text-xs font-black shrink-0 ml-2"
                        style={{ color: 'var(--tw-accent)' }}
                      >
                        ✓
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
