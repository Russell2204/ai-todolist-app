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
    matrixClass: string;
  }> = [
    {
      id: 'DO_FIRST',
      title: 'Q1: Главный фокус',
      subtitle: 'Важно & Срочно',
      shortLabel: 'Q1 Фокус',
      dotColor: 'bg-[#C06C53]',
      badgeBg: 'bg-[#C06C53]/15',
      badgeText: 'text-[#D47E66]',
      matrixClass: 'matrix-q1',
    },
    {
      id: 'SCHEDULE',
      title: 'Q2: Стратегия',
      subtitle: 'Важно & Не срочно',
      shortLabel: 'Q2 Стратегия',
      dotColor: 'bg-[#7E9F74]',
      badgeBg: 'bg-[#7E9F74]/15',
      badgeText: 'text-[#7E9F74]',
      matrixClass: 'matrix-q2',
    },
    {
      id: 'DELEGATE',
      title: 'Q3: Делегировать',
      subtitle: 'Не важно & Срочно',
      shortLabel: 'Q3 Делегировать',
      dotColor: 'bg-[#D8A562]',
      badgeBg: 'bg-[#D8A562]/15',
      badgeText: 'text-[#D8A562]',
      matrixClass: 'matrix-q3',
    },
    {
      id: 'DELETE',
      title: 'Q4: Отпустить',
      subtitle: 'Не важно & Не срочно',
      shortLabel: 'Q4 Отпустить',
      dotColor: 'bg-[#8E948A]',
      badgeBg: 'bg-[#8E948A]/15',
      badgeText: 'text-[#8E948A]',
      matrixClass: 'matrix-q4',
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
        className={`flex flex-col rounded-2xl p-4 sm:p-5 shadow-sm transition-all relative overflow-hidden ${q.matrixClass}`}
      >
        {/* Quadrant Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262925] mb-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${q.dotColor} shrink-0 shadow-xs`} />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-[#EDEFE8]">{q.title}</h3>
                <span className="text-[11px] text-[#8E948A] hidden sm:inline">
                  • {q.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Task Count Badge */}
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border border-white/5 ${q.badgeBg} ${q.badgeText}`}
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
            className="mb-3 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
              placeholder="Новая задача в этот квадрант..."
              autoFocus
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#141614] border border-[#262925] text-[#EDEFE8] placeholder:text-[#565C52] focus:outline-none focus:border-[#7E9F74]"
            />
            <button
              type="submit"
              className="px-3 py-2 text-xs font-medium bg-[#7E9F74] text-[#111211] rounded-xl hover:bg-[#8EB382] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickAddQuadrant(null);
                setQuickAddTitle('');
              }}
              className="p-2 text-[#8E948A] hover:text-[#EDEFE8] rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setQuickAddQuadrant(q.id)}
            className="mb-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-[#282C27] hover:border-[#7E9F74]/40 text-[#8E948A] hover:text-[#EDEFE8] text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить задачу</span>
          </button>
        )}

        {/* Tasks List */}
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px] pr-0.5">
          {quadrantTasks.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center p-3 border border-dashed border-[#242823] rounded-xl text-xs text-[#565C52]">
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
      {/* Mobile-Only Segmented Quadrant Tabs */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-1 bg-[#141614] p-1.5 rounded-xl border border-[#222521]">
        {quadrantsConfig.map((q) => {
          const count = filteredTasks.filter((t) => t.quadrant === q.id).length;
          const isActive = activeMobileQuadrant === q.id;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setActiveMobileQuadrant(q.id)}
              className={`flex-1 min-w-[75px] py-2 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#202320] text-[#EDEFE8] shadow-xs'
                  : 'text-[#8E948A] hover:text-[#EDEFE8]'
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
