import React, { useState } from 'react';
import { Check, Maximize } from 'lucide-react';
import { Dimensions } from '../types';

interface ScannerInputProps {
  onSave: (dims: Dimensions) => void;
  initialDims?: Dimensions;
  label: string;
}

export const ScannerInput: React.FC<ScannerInputProps> = ({ onSave, initialDims, label }) => {
  const [dims, setDims] = useState<Dimensions>(initialDims || { length: 0, width: 0, height: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
    setDims({ ...dims, [e.target.name]: value === '' ? 0 : value });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
        <Maximize className="w-5 h-5 text-brand-600 dark:text-brand-400" /> {label}
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Length (cm)</label>
            <input
              type="number"
              name="length"
              value={dims.length || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Width (cm)</label>
            <input
              type="number"
              name="width"
              value={dims.width || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={dims.height || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
        </div>

        <button
          onClick={() => onSave(dims)}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 dark:bg-brand-700 text-white py-2 rounded hover:bg-brand-700 dark:hover:bg-brand-600 transition font-medium"
        >
          <Check className="w-4 h-4" /> Confirm Dimensions
        </button>
      </div>
    </div>
  );
};