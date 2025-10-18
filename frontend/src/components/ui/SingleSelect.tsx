import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SingleSelectProps {
  options?: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dropdownClass?: string;
  disabled?: boolean;
}

export const SingleSelect = forwardRef<HTMLButtonElement, SingleSelectProps>(
  ({ options = [], value, onChange, placeholder = 'Select option', dropdownClass, disabled = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below');
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    if (!dropdownClass) {
      dropdownClass =
        'flex min-h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';
    }

    // Highlight search terms in text
    const highlightSearch = (text: string, searchTerm: string) => {
      if (!searchTerm.trim()) return text;

      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className='bg-yellow-200 font-semibold dark:bg-yellow-700'>
            {part}
          </span>
        ) : (
          part
        ),
      );
    };

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current && options.length > 20) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }, [isOpen, options.length]);

    useEffect(() => {
      const calculatePosition = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const dropdownMaxHeight = 240; // max-h-60 = 240px
        const spaceBelow = windowHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Show above if there's not enough space below and more space above
        if (spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow) {
          setDropdownPosition('above');
        } else {
          setDropdownPosition('below');
        }
      };

      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        calculatePosition();
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', calculatePosition);
        window.addEventListener('resize', calculatePosition);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', calculatePosition);
        window.removeEventListener('resize', calculatePosition);
      };
    }, [isOpen]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleOptionClick = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    };

    const selectedOption = options.find((option) => option.value === value);
    const filteredOptions = options.filter(
      (option) => typeof option?.label === 'string' && option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <div className='relative' ref={containerRef}>
        <button
          ref={ref}
          type='button'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={dropdownClass}
          disabled={disabled}
        >
          <span className={selectedOption ? 'text-left text-gray-900 dark:text-gray-100' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className='h-4 w-4 text-gray-400' />
        </button>

        {isOpen && (
          <div
            className={`absolute z-[9999] w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 ${
              dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
          >
            <div className='max-h-60 overflow-auto p-1'>
              {options.length > 20 && (
                <div className='sticky top-0 border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800'>
                  <div className='relative'>
                    <Search className='absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                    <input
                      ref={searchInputRef}
                      type='text'
                      placeholder='Search options...'
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      className='w-full rounded-md border border-gray-300 py-1.5 pr-3 pl-8 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                    />
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {filteredOptions.length === 0 && searchTerm && (
                <div className='px-2 py-2 text-center text-sm text-gray-500'>No options match "{searchTerm}"</div>
              )}

              {filteredOptions.map((option) => {
                const isSelected = value === option.value;
                return (
                  <div
                    key={option.value}
                    className={`flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleOptionClick(option.value)}
                  >
                    <span className={isSelected ? 'font-medium' : ''}>{highlightSearch(option.label, searchTerm)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
);

SingleSelect.displayName = 'SingleSelect';

