import React from 'react';

export function ZenCairnIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      {/* Нижний камень (основание) */}
      <ellipse cx="32" cy="50" rx="20" ry="7" className="text-[#2B2F2A]" fill="currentColor" opacity="0.3" />
      <path
        d="M14 50C14 45 22 43 32 43C42 43 50 45 50 50C50 55 42 57 32 57C22 57 14 55 14 50Z"
        className="text-[#282C27]"
        stroke="currentColor"
      />
      {/* Средний камень */}
      <path
        d="M20 37C20 33 25 31 32 31C39 31 44 33 44 37C44 41 39 43 32 43C25 43 20 41 20 37Z"
        className="text-[#363C34]"
        stroke="currentColor"
      />
      {/* Верхний камень равновесия */}
      <ellipse cx="32" cy="24" rx="7" ry="5" className="text-[#7E9F74]" stroke="currentColor" />
      {/* Росток на вершине */}
      <path
        d="M32 19V13M32 13C32 13 35 12 36 9C33 9 32 11 32 13ZM32 15C32 15 29 14 28 12C30 11 32 13 32 15Z"
        className="text-[#8EB883]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
