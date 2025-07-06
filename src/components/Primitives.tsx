// src/components/Primitives.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="uppercase font-muller text-sm h-11 inline-flex justify-center items-center rounded px-6 text-white bg-indigo-500 hover:bg-indigo-600 shadow-md disabled:opacity-50 transition"
      {...props}
    >
      {children}
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="uppercase font-muller text-sm inline-block py-4 px-5 text-[#9e3621] disabled:text-gray-300"
      {...props}
    >
      {children}
    </button>
  );
};

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  color?: string;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ children, color = 'white', ...props }) => {
  return (
    <a
      className="uppercase font-muller inline-block py-4 px-5 hover:bg-white/10 transition cursor-pointer"
      style={{ color }}
      {...props}
    >
      {children}
    </a>
  );
};

export const Avatar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-[50px] w-[50px] leading-[50px] rounded-full text-center text-xl bg-gray-300">
      {children}
    </div>
  );
};
