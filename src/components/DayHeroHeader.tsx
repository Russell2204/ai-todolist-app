'use client';

import React, { useMemo } from 'react';
import { useTodo } from '@/context/TodoContext';
import { Check, Sparkles } from 'lucide-react';

export function DayHeroHeader() {
  const { tasks } = useTodo();

  // Get localized date
  const dateFormatted = useMemo(() => {
    const now = new Date();
    const weekday = now.toLocaleDateString('ru-RU', { weekday: 'long' });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const dayMonth = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    return `${capitalizedWeekday}, ${dayMonth}`;
  }, []);

  // Calculate task counts
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const activeCount = totalCount - completedCount;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // SVG circular progress calculation
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalCount > 0 
    ? circumference - (percentage / 100) * circumference 
    : circumference;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1 pt-2 animate-gentle-rise">
      {/* Date & Focus Status */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#EDEFE8] font-sans">
          {dateFormatted}
        </h2>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8E948A]">
          {totalCount === 0 ? (
            <span>День свободен для отдыха или новых идей</span>
          ) : activeCount === 0 ? (
            <span className="text-[#7E9F74] font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[2.5]" />
              Все дела на сегодня выполнены!
            </span>
          ) : (
            <span>
              В фокусе <strong className="text-[#EDEFE8] font-medium">{activeCount}</strong> {activeCount === 1 ? 'задача' : activeCount < 5 ? 'задачи' : 'задач'}
              {completedCount > 0 && ` • ${completedCount} выполнено`}
            </span>
          )}
        </div>
      </div>

      {/* Daily Progress Dial Ring (Apple/Linear style) */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3 self-stretch sm:self-auto bg-[#171917]/90 px-3.5 py-2 rounded-2xl border border-[#262925] shadow-xs">
          <div className="relative w-11 h-11 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="text-[#242823]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="text-[#7E9F74] transition-all duration-500 ease-out"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Ring Metric */}
            <span className="absolute text-[11px] font-semibold text-[#EDEFE8]">
              {percentage}%
            </span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#EDEFE8] leading-tight">
              Прогресс дня
            </span>
            <span className="text-[11px] text-[#8E948A]">
              {completedCount} из {totalCount} закрыто
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
