'use client';

import React, { useState } from 'react';
import { TodoProvider, useTodo } from '@/context/TodoContext';
import { Header } from '@/components/Header';
import { DayHeroHeader } from '@/components/DayHeroHeader';
import { SmartTaskInput } from '@/components/SmartTaskInput';
import { TaskList } from '@/components/TaskList';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
import { SettingsModal } from '@/components/SettingsModal';
import { TaskEditModal } from '@/components/TaskEditModal';
import { ToastContainer } from '@/components/ToastContainer';
import { Task } from '@/types/todo';

function TodoAppContent() {
  const { viewMode } = useTodo();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Day Hero Executive Header with Radial Ring */}
        <DayHeroHeader />

        {/* Smart Input Bar with AI Auto-fill */}
        <SmartTaskInput />

        {/* Dynamic View: Classic List vs Eisenhower Matrix */}
        {viewMode === 'list' ? (
          <TaskList onEditTask={(task) => setEditingTask(task)} />
        ) : (
          <EisenhowerMatrix onEditTask={(task) => setEditingTask(task)} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#222521] py-4 px-4 text-center text-xs text-[#8C9287] mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7E9F74]" />
            <span>SmartToDo • Пространство спокойного фокуса</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-[#E1E3DA] transition-colors cursor-pointer"
            >
              Настройки ключа
            </button>
            <span>•</span>
            <span>Матрица приоритетов</span>
          </div>
        </div>
      </footer>

      {/* Modals & Notifications */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <TaskEditModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />

      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <TodoProvider>
      <TodoAppContent />
    </TodoProvider>
  );
}
