'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { REQUEST_CATEGORY_GROUPS } from '@/lib/constants';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  isMobile?: boolean;
}

export default function CategorySelector({ value, onChange, isMobile = false }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const getSelectedLabel = () => {
    if (!value) return 'All Categories';
    for (const group of REQUEST_CATEGORY_GROUPS) {
      const cat = group.categories.find(c => c.value === value);
      if (cat) return cat.label;
    }
    return 'All Categories';
  };

  if (!isMobile) {
    // Desktop: Standard select with optgroups
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="">All Categories</option>
        {REQUEST_CATEGORY_GROUPS.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  }

  // Mobile: Custom dropdown with expandable groups
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white flex items-center justify-between"
      >
        <span className="truncate">{getSelectedLabel()}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Category</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto">
              {/* All Categories Option */}
              <button
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                  value === '' ? 'bg-primary-50 text-primary-700 font-medium' : ''
                }`}
              >
                All Categories
              </button>

              {/* Category Groups */}
              {REQUEST_CATEGORY_GROUPS.map((group) => (
                <div key={group.group} className="border-t border-gray-100">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.group)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{group.group}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{group.description}</div>
                    </div>
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedGroups.includes(group.group) ? 'transform rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Group Categories */}
                  {expandedGroups.includes(group.group) && (
                    <div className="bg-gray-50">
                      {group.categories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            onChange(cat.value);
                            setIsOpen(false);
                          }}
                          className={`w-full px-8 py-2.5 text-left text-sm hover:bg-gray-100 ${
                            value === cat.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
