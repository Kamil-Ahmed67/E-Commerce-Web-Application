'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiCheckCircle, FiCircle } from 'react-icons/fi';

export default function CollapsibleCodeField({
  label,
  description,
  value,
  onChange,
  placeholder,
  rows = 6,
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasValue = Boolean(value?.trim());

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {expanded ? (
            <FiChevronDown className="shrink-0 text-gray-500" size={16} />
          ) : (
            <FiChevronRight className="shrink-0 text-gray-500" size={16} />
          )}
          <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
        </div>
        <span
          className={`flex items-center gap-1 text-xs shrink-0 ${
            hasValue ? 'text-[#32BBAB]' : 'text-gray-400'
          }`}
        >
          {hasValue ? <FiCheckCircle size={13} /> : <FiCircle size={13} />}
          {hasValue ? 'Configured' : 'Empty'}
        </span>
      </button>

      {expanded && (
        <div className="p-3 space-y-1.5 bg-white">
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
          <textarea
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-[#32BBAB]/30 focus:border-[#32BBAB] transition-colors"
          />
        </div>
      )}
    </div>
  );
}
