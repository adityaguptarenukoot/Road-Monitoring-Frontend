import React from 'react';

const PollingDropdown = ({ value, onChange, label }) => {
  const intervals = [
    { label: '1 second', value: 1 },
    { label: '5 seconds', value: 5 },
    { label: '10 seconds', value: 10 },
    { label: '30 seconds', value: 30 },
    { label: '1 minute', value: 60 },
    { label: '5 minutes', value: 300 },
  ];

  return (
    <div className="flex items-center gap-2">
      <label className="text-gray-300 text-sm font-medium">
        {label || 'Update Every:'}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {intervals.map((interval) => (
          <option key={interval.value} value={interval.value}>
            {interval.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PollingDropdown;
