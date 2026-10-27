'use client';

import React, { useState } from 'react';
import { useTodo } from '@/context/TodoContext';
import { Task, EisenhowerQuadrant } from '@/types/todo';
import { TaskCard } from './TaskCard';
import { Flame, Calendar, Users, Ban, Plus, X } from 'lucide-react';

interface EisenhowerMatrixProps {
  onEditTask: (task: Task) => void;
}

export function EisenhowerMatrix({ onEditTask }: EisenhowerMatrixProps) {
  const { filteredTasks, addTask } = useTodo();
  const [quickAddQuadrant, setQuickAddQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const quadrantsConfig: Array<{
    id: EisenhowerQuadrant;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    colorClasses: {
      card: string;
      headerBg: string;
      text: string;
      border: string;
      badge: string;
    };
  }> = [
    {
      id: 'DO_FIRST',
      title: 'Сделать первым (Q1)',
      subtitle: 'Важно & Срочно',
      description: 'Критические инциденты, горящие дедлайны, неотложные задачи',
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      colorClasses: {
        card: 'bg-rose-500/5 border-rose-500/20',
        headerBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-600 dark:text-rose-300',
      },
    },
    {
      id: 'SCHEDULE',
      title: 'Запланировать (Q2)',
      subtitle: 'Важно & Не срочно',
      description: 'Стратегия, саморазвитие, здоровье, системные улучшения',
      icon: <Calendar className="w-4 h-4 text-blue-500" />,
      colorClasses: {
        card: 'bg-blue-500/5 border-blue-500/20',
        headerBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/30',
        badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-300',
      },
    },
    {
      id: 'DELEGATE',
      title: 'Делегировать (Q3)',
      subtitle: 'Не важно & Срочно',
      description: 'Прерывания, рутина, организационные мелкие вопросы',
      icon: <Users className="w-4 h-4 text-amber-500" />,
      colorClasses: {
        card: 'bg-amber-500/5 border-amber-500/20',
        headerBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-300',
      },
    },
    {
      id: 'DELETE',
      title: 'Устранить (Q4)',
      subtitle: 'Не важно & Не срочно',
      description: 'Пожиратели времени, лишний шум, бесполезные дела',
      icon: <Ban className="w-4 h-4 text-slate-400" />,
      colorClasses: {
        card: 'bg-slate-500/5 border-slate-500/20',
        headerBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/30',
        badge: 'bg-slate-500/20 text-slate-600 dark:text-slate-300',
      },
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {quadrantsConfig.map((q) => {
        const quadrantTasks = filteredTasks.filter((t) => t.quadrant === q.id);

        return (
          <div
            key={q.id}
            className={`flex flex-col rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200 ${q.colorClasses.card}`}
          >
            {/* Quadrant Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  {q.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {q.title}
                    </h3>
                    <span className="text-[11px] font-medium opacity-75">
                      ({q.subtitle})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                    {q.description}
                  </p>
                </div>
              </div>

              {/* Task Count Badge */}
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.colorClasses.badge}`}
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
                  placeholder="Название задачи..."
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-500"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddQuadrant(null);
                    setQuickAddTitle('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setQuickAddQuadrant(q.id)}
                className="mb-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить задачу в этот квадрант</span>
              </button>
            )}

            {/* Quadrant Tasks List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
              {quadrantTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Нет задач в этом квадранте
                  </p>
                </div>
              ) : (
                quadrantTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={onEditTask} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
