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
  Pencil,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Circle,
  Tag,
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
  const [showReasoning, setShowReasoning] = useState(false);

  const isDecomposing = isDecomposingId === task.id;

  // Quadrant Dot & Label Palette (Nordic Sanctuary)
  const quadrantMeta: Record<
    EisenhowerQuadrant,
    { dot: string; label: string; text: string }
  > = {
    DO_FIRST: {
      dot: 'bg-[#B86E53]', // Muted Terracotta / Cedar
      label: 'Q1 Главный фокус',
      text: 'text-[#B86E53]',
    },
    SCHEDULE: {
      dot: 'bg-[#7E9F74]', // Nordic Sage
      label: 'Q2 Стратегия',
      text: 'text-[#7E9F74]',
    },
    DELEGATE: {
      dot: 'bg-[#D6A368]', // Nordic Amber
      label: 'Q3 Делегировать',
      text: 'text-[#D6A368]',
    },
    DELETE: {
      dot: 'bg-[#8C9287]', // Dried Lichen
      label: 'Q4 Отпустить',
      text: 'text-[#8C9287]',
    },
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const completedSubtasksCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasksCount = task.subtasks.length;

  // Format Due Date cleanly without clutter
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now;
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    let display = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });

    if (isToday) {
      display = `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      display = `${display}, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return { display, isPast };
  };

  const dueInfo = formatDueDate(task.dueDate);

  return (
    <div
      className={`task-row group relative p-3.5 sm:p-4.5 flex flex-col gap-2.5 transition-all duration-200 ${
        task.isCompleted
          ? 'bg-[#151715]/70 border-[#222622] opacity-65'
          : 'bg-[#1A1C1A] border-[#282C27]'
      }`}
    >
      {/* Main Row */}
      <div className="flex items-start gap-3">
        {/* Checkbox with generous touch padding (min 44px hit-box) */}
        <div className="pt-0.5 shrink-0">
          <button
            type="button"
            onClick={() => toggleComplete(task.id)}
            className="w-10 h-10 -m-2 flex items-center justify-center cursor-pointer group/check"
            aria-label={task.isCompleted ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150 ${
                task.isCompleted
                  ? 'bg-[#7E9F74] border-[#7E9F74] text-[#111211]'
                  : 'border-[#3D453A] group-hover/check:border-[#7E9F74] bg-[#141614]'
              }`}
            >
              {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </div>
          </button>
        </div>

        {/* Content Area (Direct Click opens Edit Modal) */}
        <div
          onClick={() => onEdit(task)}
          className="flex-1 min-w-0 cursor-pointer select-none"
        >
          {/* Title & Micro Metadata */}
          <div className="flex flex-col gap-1">
            <h3
              className={`text-sm font-medium leading-relaxed break-words transition-colors ${
                task.isCompleted
                  ? 'line-through text-[#585E54]'
                  : 'text-[#E1E3DA] group-hover:text-white'
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={`text-xs leading-relaxed break-words line-clamp-2 ${
                  task.isCompleted ? 'text-[#585E54]' : 'text-[#8C9287]'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Clean Metadata Line (Quiet & Scannable) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#8C9287]">
              {/* Quadrant Dot & Label */}
              {task.quadrant && (
                <span className="inline-flex items-center gap-1.5" title={quadrantMeta[task.quadrant].label}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${quadrantMeta[task.quadrant].dot}`} />
                  <span className="font-medium text-[#C4C8BE] text-[12px]">
                    {quadrantMeta[task.quadrant].label.split(' ')[0]}
                  </span>
                </span>
              )}

              {/* Due Date */}
              {dueInfo && (
                <span
                  className={`inline-flex items-center gap-1 text-[12px] ${
                    dueInfo.isPast && !task.isCompleted
                      ? 'text-[#B86E53] font-medium'
                      : 'text-[#8C9287]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span>{dueInfo.display}</span>
                </span>
              )}

              {/* Estimated Time */}
              {task.estimatedMinutes && (
                <span className="inline-flex items-center gap-1 text-[12px] text-[#8C9287]">
                  <Clock className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span>~{task.estimatedMinutes} мин</span>
                </span>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#8C9287]">
                  {task.tags.map((tag) => (
                    <span key={tag} className="hover:text-[#E1E3DA] transition-colors">
                      #{tag}
                    </span>
                  ))}
                </span>
              )}

              {/* AI Score (Quiet pill) */}
              {typeof task.aiScore === 'number' && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[11px] font-medium rounded text-[#7CA3AC] bg-[#7CA3AC]/10 border border-[#7CA3AC]/20"
                  title="Оценка важности Gemini AI"
                >
                  AI: {task.aiScore}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
          {/* AI Reasoning Trigger */}
          {task.aiReasoning && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReasoning(!showReasoning);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8C9287] hover:text-[#7CA3AC] hover:bg-[#232622] transition-colors"
                title="Обоснование AI"
                aria-label="Обоснование AI"
              >
                <Lightbulb className="w-4 h-4" />
              </button>

              {showReasoning && (
                <div className="absolute right-0 top-10 z-30 w-72 p-3.5 rounded-xl bg-[#232622] text-[#E1E3DA] text-xs shadow-2xl border border-[#383F35] animate-gentle-rise">
                  <div className="flex items-center justify-between font-medium text-[#7CA3AC] mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Логика приоритета:</span>
                    </span>
                    <button
                      onClick={() => setShowReasoning(false)}
                      className="text-[#8C9287] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[#C4C8BE] leading-relaxed text-xs">{task.aiReasoning}</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8C9287] hover:text-[#E1E3DA] hover:bg-[#232622] transition-colors"
            title="Редактировать задачу"
            aria-label="Редактировать задачу"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8C9287] hover:text-[#B86E53] hover:bg-[#B86E53]/10 transition-colors"
            title="Удалить задачу"
            aria-label="Удалить задачу"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtasks Footer Strip (Accordion) */}
      <div className="pt-2 border-t border-[#232622] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          {totalSubtasksCount > 0 ? (
            <button
              type="button"
              onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
              className="flex items-center gap-1.5 text-[#8C9287] hover:text-[#E1E3DA] font-medium transition-colors cursor-pointer py-1"
            >
              <span>
                Шаги: {completedSubtasksCount}/{totalSubtasksCount}
              </span>
              {isSubtasksExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="text-[#585E54] text-[12px]">Без подзадач</span>
          )}

          {/* Action Chips: AI Decompose & Add Step */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => decomposeTask(task.id)}
              disabled={isDecomposing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-[#1F2422] text-[#7CA3AC] hover:bg-[#262E2A] hover:text-[#90BAC4] border border-[#2B3531] transition-colors disabled:opacity-50 cursor-pointer"
              title="Разбить задачу на конкретные шаги через AI"
            >
              {isDecomposing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Разбиваем...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Разбить на шаги</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSubtasksExpanded(true);
                setIsAddingSubtask(true);
              }}
              className="flex items-center gap-1 text-[12px] text-[#8C9287] hover:text-[#E1E3DA] px-2 py-1 rounded-lg hover:bg-[#232622] transition-colors cursor-pointer"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>+ Шаг</span>
            </button>
          </div>
        </div>

        {/* Subtasks Expanded Checklist */}
        {isSubtasksExpanded && (
          <div className="mt-1 space-y-1.5 pl-3 border-l border-[#2B2F2A] animate-gentle-rise">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center justify-between gap-2 text-xs py-1 group/sub"
              >
                <button
                  type="button"
                  onClick={() => toggleSubtask(task.id, subtask.id)}
                  className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                >
                  {subtask.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#7E9F74] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#585E54] hover:text-[#7E9F74] shrink-0 transition-colors" />
                  )}
                  <span
                    className={`break-words text-xs ${
                      subtask.isCompleted
                        ? 'line-through text-[#585E54]'
                        : 'text-[#C4C8BE]'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteSubtask(task.id, subtask.id)}
                  className="opacity-60 hover:opacity-100 p-1 text-[#8C9287] hover:text-[#B86E53] transition-colors"
                  title="Удалить шаг"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Inline Add Step Form */}
            {isAddingSubtask && (
              <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 pt-1.5">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Название шага..."
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#8C9287] focus:outline-none focus:border-[#7E9F74]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#7E9F74] text-[#111211] hover:bg-[#8EB382] transition-colors cursor-pointer"
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(false)}
                  className="px-2 py-1.5 text-xs text-[#8C9287] hover:text-[#E1E3DA] cursor-pointer"
                >
                  Отмена
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
