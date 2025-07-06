// src/components/InputField.tsx
import React from 'react';

export interface IInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export default function InputField({ label, error, ...props }: IInputFieldProps) {
  return (
    <label className="text-sm font-semibold text-gray-600 mb-2 flex flex-col">
      {label}
      <input
        className="border border-gray-300 rounded-md px-3 py-2 text-base outline-none hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </label>
  );
}
