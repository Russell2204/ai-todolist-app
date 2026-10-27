'use client';

import React, { useState, useEffect } from 'react';
import { Task, PriorityLevel, EisenhowerQuadrant } from '@/types/todo';
import { useTodo } from '@/context/TodoContext';
import { X, Calendar, Clock, Tag, Flame } from 'lucide-react';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskEditModal({ task, isOpen, onClose }: TaskEditModalProps) {
  const { updateTask, addToast } = useTodo();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>('SCHEDULE');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [dueDate, setDueDate] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setQuadrant(task.quadrant || 'SCHEDULE');
      setEstimatedMinutes(task.estimatedMinutes || 30);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 16) : '');
      setTagsInput(task.tags ? task.tags.join(', ') : '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      quadrant,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags,
    });

    addToast('success', 'Задача обновлена');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Редактирование задачи
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Название задачи
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Описание / детали
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Priority & Quadrant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
              >
                <option value="CRITICAL">🔥 Критический</option>
                <option value="HIGH">⚡ Высокий</option>
                <option value="MEDIUM">🔹 Средний</option>
                <option value="LOW">◽ Низкий</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Квадрант Эйзенхауэра
              </label>
              <select
                value={quadrant}
                onChange={(e) => setQuadrant(e.target.value as EisenhowerQuadrant)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
              >
                <option value="DO_FIRST">1. Сделать первым (Важно & Срочно)</option>
                <option value="SCHEDULE">2. Запланировать (Важно & Не срочно)</option>
                <option value="DELEGATE">3. Делегировать (Не важно & Срочно)</option>
                <option value="DELETE">4. Устранить (Не важно & Не срочно)</option>
              </select>
            </div>
          </div>

          {/* Time & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Время выполнения (мин)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Дедлайн
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-purple-500" />
              Теги (через запятую)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Работа, Отчет, Проект"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
