'use client';

import React from 'react';
import { useTodo } from '@/context/TodoContext';
import { Task, FilterStatus, SortOption } from '@/types/todo';
import { TaskCard } from './TaskCard';
import { Search, Filter, ArrowUpDown, Tag, Sparkles, CheckCircle2 } from 'lucide-react';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

export function TaskList({ onEditTask }: TaskListProps) {
  const {
    filteredTasks,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    allTags,
    sortBy,
    setSortBy,
    tasks,
  } = useTodo();

  const activeCount = tasks.filter((t) => !t.isCompleted).length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Search, Filter Tabs & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, описанию или тегу..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Все ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'active'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Активные ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Завершенные ({completedCount})
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs focus:outline-none font-medium cursor-pointer"
          >
            <option value="aiScore">✨ Важность (AI Score)</option>
            <option value="priority">🔥 Приоритет</option>
            <option value="dueDate">📅 Дедлайн</option>
            <option value="createdAt">🕒 Дата добавления</option>
            <option value="title">🔤 По алфавиту</option>
          </select>
        </div>
      </div>

      {/* Tags Chips Bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3" /> Теги:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
              selectedTag === null
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Все
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Задач не найдено
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {searchQuery || selectedTag || filter !== 'all'
                ? 'Попробуйте сбросить фильтры или изменить поисковый запрос'
                : 'Добавьте первую задачу в строке выше или используйте AI Auto-fill!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))
        )}
      </div>
    </div>
  );
}
