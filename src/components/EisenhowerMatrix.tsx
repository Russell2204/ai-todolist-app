'use client';

import React, { useState } from 'react';
import { useTodo } from '@/context/TodoContext';
import { Task, EisenhowerQuadrant } from '@/types/todo';
import { TaskCard } from './TaskCard';
import { Plus, X, Check } from 'lucide-react';

interface EisenhowerMatrixProps {
  onEditTask: (task: Task) => void;
}

export function EisenhowerMatrix({ onEditTask }: EisenhowerMatrixProps) {
  const { filteredTasks, addTask } = useTodo();
  const [quickAddQuadrant, setQuickAddQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [activeMobileQuadrant, setActiveMobileQuadrant] = useState<EisenhowerQuadrant>('DO_FIRST');

  const quadrantsConfig: Array<{
    id: EisenhowerQuadrant;
    title: string;
    subtitle: string;
    shortLabel: string;
    dotColor: string;
    badgeBg: string;
    badgeText: string;
  }> = [
    {
      id: 'DO_FIRST',
      title: 'Q1: Главный фокус',
      subtitle: 'Важно & Срочно',
      shortLabel: 'Q1 Фокус',
      dotColor: 'bg-[#B86E53]',
      badgeBg: 'bg-[#B86E53]/15',
      badgeText: 'text-[#C27466]',
    },
    {
      id: 'SCHEDULE',
      title: 'Q2: Стратегия',
      subtitle: 'Важно & Не срочно',
      shortLabel: 'Q2 Стратегия',
      dotColor: 'bg-[#7E9F74]',
      badgeBg: 'bg-[#7E9F74]/15',
      badgeText: 'text-[#7E9F74]',
    },
    {
      id: 'DELEGATE',
      title: 'Q3: Делегировать',
      subtitle: 'Не важно & Срочно',
      shortLabel: 'Q3 Делегировать',
      dotColor: 'bg-[#D6A368]',
      badgeBg: 'bg-[#D6A368]/15',
      badgeText: 'text-[#D6A368]',
    },
    {
      id: 'DELETE',
      title: 'Q4: Отпустить',
      subtitle: 'Не важно & Не срочно',
      shortLabel: 'Q4 Отпустить',
      dotColor: 'bg-[#8C9287]',
      badgeBg: 'bg-[#8C9287]/15',
      badgeText: 'text-[#8C9287]',
    },
  ];

  const handleQuickAdd = (quadrant: EisenhowerQuadrant) => {
    if (!quickAddTitle.trim()) return;
    addTask({
      title: quickAddTitle.trim(),
      quadrant,
      priority:
        quadrant === 'DO_FIRST'
          ? 'HIGH'
          : quadrant === 'SCHEDULE'
          ? 'MEDIUM'
          : 'LOW',
    });
    setQuickAddTitle('');
    setQuickAddQuadrant(null);
  };

  const renderQuadrantContent = (q: typeof quadrantsConfig[0]) => {
    const quadrantTasks = filteredTasks.filter((t) => t.quadrant === q.id);

    return (
      <div
        key={q.id}
        className="flex flex-col rounded-2xl border border-[#282C27] bg-[#1A1C1A] p-3.5 sm:p-4.5 shadow-sm transition-all"
      >
        {/* Quadrant Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#222521] mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${q.dotColor} shrink-0`} />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-[#E1E3DA]">{q.title}</h3>
                <span className="text-[11px] text-[#8C9287] hidden sm:inline">
                  • {q.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Task Count Badge */}
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${q.badgeBg} ${q.badgeText}`}
          >
            {quadrantTasks.length}
          </span>
        </div>

        {/* Quick Add inline */}
        {quickAddQuadrant === q.id ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickAdd(q.id);
            }}
            className="mb-2.5 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
              placeholder="Новая задача в этот квадрант..."
              autoFocus
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#585E54] focus:outline-none focus:border-[#7E9F74]"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 text-xs font-medium bg-[#7E9F74] text-[#111211] rounded-xl hover:bg-[#8EB382] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickAddQuadrant(null);
                setQuickAddTitle('');
              }}
              className="p-1.5 text-[#8C9287] hover:text-[#E1E3DA] rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setQuickAddQuadrant(q.id)}
            className="mb-2.5 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed border-[#282C27] hover:border-[#7E9F74]/50 text-[#8C9287] hover:text-[#E1E3DA] text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить задачу</span>
          </button>
        )}

        {/* Tasks List */}
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[460px] pr-0.5">
          {quadrantTasks.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center p-3 border border-dashed border-[#242823] rounded-xl text-xs text-[#585E54]">
              <span>Все дела решены</span>
            </div>
          ) : (
            quadrantTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Mobile-Only Segmented Quadrant Tabs (Eliminates Nested Scroll Traps on < 768px) */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-1 bg-[#141614] p-1.5 rounded-xl border border-[#222521]">
        {quadrantsConfig.map((q) => {
          const count = filteredTasks.filter((t) => t.quadrant === q.id).length;
          const isActive = activeMobileQuadrant === q.id;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setActiveMobileQuadrant(q.id)}
              className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#232622] text-[#E1E3DA] shadow-xs'
                  : 'text-[#8C9287] hover:text-[#E1E3DA]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${q.dotColor} shrink-0`} />
              <span className="truncate">{q.shortLabel}</span>
              {count > 0 && <span className="text-[11px] opacity-75">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Mobile: Active Quadrant View */}
      <div className="md:hidden">
        {renderQuadrantContent(
          quadrantsConfig.find((q) => q.id === activeMobileQuadrant) || quadrantsConfig[0]
        )}
      </div>

      {/* Desktop (md+): Full 2x2 Grid View */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 lg:gap-5">
        {quadrantsConfig.map((q) => renderQuadrantContent(q))}
      </div>
    </div>
  );
}
