'use client';

import React, { useState, useEffect } from 'react';
import { Task, PriorityLevel, EisenhowerQuadrant } from '@/types/todo';
import { useTodo } from '@/context/TodoContext';
import { X, Calendar, Clock, Tag, Trash2 } from 'lucide-react';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskEditModal({ task, isOpen, onClose }: TaskEditModalProps) {
  const { updateTask, deleteTask, addToast } = useTodo();

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

    addToast('success', 'Изменения сохранены');
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    addToast('info', 'Задача удалена');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-gentle-rise">
      <div className="relative w-full max-w-lg bg-[#1A1C1A] border border-[#282C27] rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242823]">
          <h2 className="text-base font-semibold text-[#E1E3DA]">
            Редактирование задачи
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8C9287] hover:text-[#E1E3DA] hover:bg-[#232622] transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* Title */}
          <div>
            <label className="block text-[#8C9287] font-medium mb-1">
              Название задачи
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74] font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#8C9287] font-medium mb-1">
              Описание / заметка
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Дополнительные мысли..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#585E54] focus:outline-none focus:border-[#7E9F74] resize-none"
            />
          </div>

          {/* Priority & Quadrant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8C9287] font-medium mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74] cursor-pointer"
              >
                <option value="CRITICAL">Критический</option>
                <option value="HIGH">Высокий</option>
                <option value="MEDIUM">Средний</option>
                <option value="LOW">Низкий</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8C9287] font-medium mb-1">
                Квадрант Эйзенхауэра
              </label>
              <select
                value={quadrant}
                onChange={(e) => setQuadrant(e.target.value as EisenhowerQuadrant)}
                className="w-full px-3 py-2 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74] cursor-pointer"
              >
                <option value="DO_FIRST">Q1: Сделать первым (Важно & Срочно)</option>
                <option value="SCHEDULE">Q2: Запланировать (Важно & Не срочно)</option>
                <option value="DELEGATE">Q3: Делегировать (Не важно & Срочно)</option>
                <option value="DELETE">Q4: Отпустить (Не важно & Не срочно)</option>
              </select>
            </div>
          </div>

          {/* Time & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8C9287] font-medium mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Время выполнения (мин)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74]"
              />
            </div>

            <div>
              <label className="block text-[#8C9287] font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Дедлайн
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[#8C9287] font-medium mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Теги (через запятую)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="работа, отчет, личное"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#585E54] focus:outline-none focus:border-[#7E9F74]"
            />
          </div>

          {/* Footer Actions: Delete (separated to left) & Save/Cancel on right */}
          <div className="pt-3.5 flex items-center justify-between border-t border-[#242823] mt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-[#B86E53] hover:bg-[#B86E53]/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-xl text-[#8C9287] hover:text-[#E1E3DA] hover:bg-[#232622] transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#7E9F74] text-[#111211] hover:bg-[#8EB382] transition-colors cursor-pointer active:scale-95"
              >
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
