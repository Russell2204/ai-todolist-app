'use client';

import React, { useState } from 'react';
import { TodoProvider, useTodo } from '@/context/TodoContext';
import { Header } from '@/components/Header';
import { SmartTaskInput } from '@/components/SmartTaskInput';
import { TaskList } from '@/components/TaskList';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
import { SettingsModal } from '@/components/SettingsModal';
import { TaskEditModal } from '@/components/TaskEditModal';
import { ToastContainer } from '@/components/ToastContainer';
import { Task } from '@/types/todo';
import { Sparkles, Info, Heart } from 'lucide-react';

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
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Smart ToDoList с интеграцией Google Gemini API</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 underline transition-colors"
            >
              Настройки API-ключа
            </button>
            <span>•</span>
            <span>Матрица Эйзенхауэра & AI Scoring</span>
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
