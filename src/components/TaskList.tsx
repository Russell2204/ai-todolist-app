'use client';

import React, { useState, useMemo } from 'react';
import { useTodo } from '@/context/TodoContext';
import { Task, SortOption } from '@/types/todo';
import { TaskCard } from './TaskCard';
import { ZenCairnIllustration } from './ZenCairnIllustration';
import { Search, ArrowUpDown, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';

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

  const [isCompletedSectionOpen, setIsCompletedSectionOpen] = useState(false);

  // Divide filtered tasks into active and completed to keep workspace clean
  const { activeTasks, completedTasks } = useMemo(() => {
    const active = filteredTasks.filter((t) => !t.isCompleted);
    const completed = filteredTasks.filter((t) => t.isCompleted);
    return { activeTasks: active, completedTasks: completed };
  }, [filteredTasks]);

  const totalActiveCount = useMemo(() => tasks.filter((t) => !t.isCompleted).length, [tasks]);
  const totalCompletedCount = useMemo(() => tasks.filter((t) => t.isCompleted).length, [tasks]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search, Filter Tabs & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#1A1C1A] p-2.5 sm:p-3 rounded-2xl border border-[#282C27] shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9287]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по задачам..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#8C9287] focus:outline-none focus:border-[#7E9F74] transition-colors"
          />
        </div>

        {/* Status Filters (Segmented Pill) */}
        <div className="flex items-center gap-1 bg-[#141614] p-1 rounded-xl text-xs border border-[#222521]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#232622] text-[#E1E3DA] shadow-xs'
                : 'text-[#8C9287] hover:text-[#E1E3DA]'
            }`}
          >
            Все ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'active'
                ? 'bg-[#232622] text-[#E1E3DA] shadow-xs'
                : 'text-[#8C9287] hover:text-[#E1E3DA]'
            }`}
          >
            В фокусе ({totalActiveCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-[#232622] text-[#E1E3DA] shadow-xs'
                : 'text-[#8C9287] hover:text-[#E1E3DA]'
            }`}
          >
            Завершённые ({totalCompletedCount})
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#8C9287] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-2.5 py-1.5 rounded-xl bg-[#141614] border border-[#282C27] text-[#C4C8BE] text-xs focus:outline-none focus:border-[#7E9F74] font-medium cursor-pointer"
          >
            <option value="aiScore">AI Важность</option>
            <option value="priority">Приоритет</option>
            <option value="dueDate">Дедлайн</option>
            <option value="createdAt">Дата добавления</option>
            <option value="title">По названию</option>
          </select>
        </div>
      </div>

      {/* Tags Chips Bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[12px] text-[#8C9287] shrink-0 font-medium">Теги:</span>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedTag === null
                ? 'bg-[#7E9F74] text-[#111211]'
                : 'bg-[#1A1C1A] border border-[#282C27] text-[#8C9287] hover:text-[#E1E3DA]'
            }`}
          >
            Все
          </button>
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#7E9F74] text-[#111211]'
                  : 'bg-[#1A1C1A] border border-[#282C27] text-[#8C9287] hover:text-[#E1E3DA]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Tasks List Content */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          /* Zen Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#282C27] bg-[#141614]/50 animate-gentle-rise">
            <ZenCairnIllustration className="w-14 h-14 mb-3 text-[#7E9F74]" />
            <h3 className="text-sm font-medium text-[#E1E3DA]">
              {searchQuery || selectedTag || filter !== 'all'
                ? 'Ничего не найдено по этому запросу'
                : 'Все дела решены. Время для отдыха'}
            </h3>
            <p className="text-xs text-[#8C9287] max-w-sm mt-1">
              {searchQuery || selectedTag || filter !== 'all'
                ? 'Попробуйте сбросить фильтры или изменить условия поиска'
                : 'Запишите новую мысль в строке выше, когда будете готовы к делам.'}
            </p>
          </div>
        ) : filter === 'completed' ? (
          /* Showing completed only */
          completedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))
        ) : (
          /* Normal List with Dedicated Completed Accordion */
          <>
            {/* Active Tasks First */}
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} />
            ))}

            {/* If there are no active tasks left in 'all' view */}
            {activeTasks.length === 0 && (
              <div className="py-6 px-4 text-center rounded-xl bg-[#1A1C1A]/40 border border-[#282C27] text-xs text-[#8C9287]">
                Все текущие дела завершены!
              </div>
            )}

            {/* Collapsed Completed Tasks Section */}
            {completedTasks.length > 0 && filter === 'all' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompletedSectionOpen(!isCompletedSectionOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#151715] border border-[#222521] text-xs text-[#8C9287] hover:text-[#E1E3DA] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#7E9F74]" />
                    <span>Завершённые дела ({completedTasks.length})</span>
                  </span>
                  {isCompletedSectionOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {isCompletedSectionOpen && (
                  <div className="mt-2.5 space-y-2.5 animate-gentle-rise">
                    {completedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={onEditTask} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
