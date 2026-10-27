'use client';

import React, { useState } from 'react';
import { Task, PriorityLevel, EisenhowerQuadrant } from '@/types/todo';
import { useTodo } from '@/context/TodoContext';
import {
  Check,
  Clock,
  Calendar,
  Sparkles,
  Lightbulb,
  ListPlus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Circle,
  Tag,
  AlertTriangle,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const {
    toggleComplete,
    deleteTask,
    decomposeTask,
    isDecomposingId,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    isPrioritizing,
  } = useTodo();

  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showReasoningModal, setShowReasoningModal] = useState(false);

  const isDecomposing = isDecomposingId === task.id;

  // Priority Styles
  const priorityStyles: Record<
    PriorityLevel,
    { label: string; badge: string; border: string; dot: string }
  > = {
    CRITICAL: {
      label: 'Критический',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      border: 'hover:border-rose-500/50',
      dot: 'bg-rose-500',
    },
    HIGH: {
      label: 'Высокий',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      border: 'hover:border-amber-500/50',
      dot: 'bg-amber-500',
    },
    MEDIUM: {
      label: 'Средний',
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      border: 'hover:border-blue-500/50',
      dot: 'bg-blue-500',
    },
    LOW: {
      label: 'Низкий',
      badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
      border: 'hover:border-slate-500/50',
      dot: 'bg-slate-400',
    },
  };

  // Quadrant Labels
  const quadrantLabels: Record<EisenhowerQuadrant, { name: string; tag: string }> = {
    DO_FIRST: { name: 'Сделать срочно', tag: 'bg-rose-500/10 text-rose-600 dark:text-rose-300' },
    SCHEDULE: { name: 'Запланировать', tag: 'bg-blue-500/10 text-blue-600 dark:text-blue-300' },
    DELEGATE: { name: 'Делегировать', tag: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
    DELETE: { name: 'Устранить', tag: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  // Subtask completed count
  const completedSubtasksCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasksCount = task.subtasks.length;

  // Format Due Date
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now;
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 3600);

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    let display = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) {
      display = `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return { display, isPast, isUrgent: diffHours > 0 && diffHours <= 24 };
  };

  const dueInfo = formatDueDate(task.dueDate);

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        task.isCompleted
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-65'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/90 shadow-sm hover:shadow-md'
      } ${priorityStyles[task.priority].border} ${isPrioritizing ? 'ai-shimmer' : ''}`}
    >
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Top Header: Checkbox, Title, Badges, Options */}
        <div className="flex items-start gap-3">
          {/* Complete Toggle Checkbox */}
          <button
            onClick={() => toggleComplete(task.id)}
            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
              task.isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
            }`}
            aria-label={task.isCompleted ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>

          {/* Main Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {/* Priority Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  priorityStyles[task.priority].badge
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles[task.priority].dot}`} />
                {priorityStyles[task.priority].label}
              </span>

              {/* Eisenhower Quadrant Badge */}
              {task.quadrant && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    quadrantLabels[task.quadrant].tag
                  }`}
                >
                  {quadrantLabels[task.quadrant].name}
                </span>
              )}

              {/* Time Estimate Badge */}
              {task.estimatedMinutes && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3" /> ~{task.estimatedMinutes} мин
                </span>
              )}

              {/* AI Score Badge */}
              {typeof task.aiScore === 'number' && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    task.aiScore >= 80
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20'
                      : task.aiScore >= 50
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Индекс важности, вычисленный Gemini AI (от 1 до 100)"
                >
                  <Sparkles className="w-3 h-3" /> {task.aiScore}
                </span>
              )}

              {/* Due Date Badge */}
              {dueInfo && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md ${
                    dueInfo.isPast
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                      : dueInfo.isUrgent
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium'
                      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {dueInfo.display}
                  {dueInfo.isPast && <span className="ml-0.5">(Просрочено)</span>}
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className={`text-base font-semibold leading-snug break-words ${
                task.isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p
                className={`text-xs mt-1 leading-relaxed break-words line-clamp-2 ${
                  task.isCompleted ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                  >
                    <Tag className="w-2.5 h-2.5 opacity-60" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions: Edit, Delete, Reasoning */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {/* AI Reasoning Tooltip / Trigger */}
            {task.aiReasoning && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowReasoningModal(!showReasoningModal)}
                  className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                  title="Обоснование Gemini AI: почему выбран такой приоритет"
                >
                  <Lightbulb className="w-4 h-4 fill-purple-400/20" />
                </button>

                {showReasoningModal && (
                  <div className="absolute right-0 top-8 z-20 w-64 p-3 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-1.5 font-semibold text-purple-300 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Логика Gemini AI:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{task.aiReasoning}</p>
                    <button
                      onClick={() => setShowReasoningModal(false)}
                      className="mt-2 text-[10px] text-slate-400 hover:text-white underline block"
                    >
                      Закрыть
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Edit Task Button */}
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Редактировать задачу"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete Task Button */}
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Удалить задачу"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Reasoning Strip below card if available (always easily visible) */}
        {task.aiReasoning && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300">
            <Lightbulb className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="line-clamp-1 italic">{task.aiReasoning}</span>
          </div>
        )}

        {/* Subtasks Section / Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            {/* Toggle Subtasks Expand */}
            {totalSubtasksCount > 0 ? (
              <button
                onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
              >
                <span>
                  Подзадачи: {completedSubtasksCount}/{totalSubtasksCount}
                </span>
                {isSubtasksExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="text-slate-400 text-[11px]">Нет подзадач</span>
            )}

            {/* AI Decompose Button («Разбить на шаги») */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => decomposeTask(task.id)}
                disabled={isDecomposing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
                title="Использовать Gemini AI для разбиения задачи на 3-5 конкретных подзадач"
              >
                {isDecomposing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                    <span>Разбиваем...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span>Разбить на шаги (AI)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsSubtasksExpanded(true);
                  setIsAddingSubtask(true);
                }}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>+ Шаг</span>
              </button>
            </div>
          </div>

          {/* Subtasks List */}
          {isSubtasksExpanded && (
            <div className="mt-1 space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between gap-2 group/sub text-xs py-0.5"
                >
                  <button
                    onClick={() => toggleSubtask(task.id, subtask.id)}
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                  >
                    {subtask.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500 shrink-0" />
                    )}
                    <span
                      className={`break-words ${
                        subtask.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                    className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="Удалить подзадачу"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add Subtask Form */}
              {isAddingSubtask ? (
                <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Название шага..."
                    autoFocus
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500"
                  >
                    ОК
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingSubtask(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Отмена
                  </button>
                </form>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
