'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Task, Subtask, PriorityLevel, EisenhowerQuadrant, ViewMode, FilterStatus, SortOption } from '@/types/todo';
import confetti from 'canvas-confetti';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
}

interface TodoContextType {
  tasks: Task[];
  filteredTasks: Task[];
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  filter: FilterStatus;
  setFilter: (f: FilterStatus) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  allTags: string[];

  // User & DB Settings
  user: AuthUser | null;
  isLoadingUser: boolean;
  hasServerKey: boolean;
  hasUserDbKey: boolean;
  userModel: string;
  autoAnalyzeOnAdd: boolean;
  saveUserDbKey: (key: string, model?: string, autoAnalyze?: boolean) => Promise<boolean>;

  // Task CRUD (backed by Neon DB)
  addTask: (task: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: PriorityLevel;
    quadrant?: EisenhowerQuadrant;
    estimatedMinutes?: number;
    tags?: string[];
    subtasks?: Subtask[];
    aiScore?: number;
    aiReasoning?: string;
  }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;

  // Subtasks
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // AI Operations
  isPrioritizing: boolean;
  prioritizeAllTasks: () => Promise<void>;
  prioritizeCooldown: number;
  isDecomposingId: string | null;
  decomposeTask: (taskId: string) => Promise<void>;
  isParsingNLP: boolean;
  parseAndAddTask: (text: string) => Promise<Task | null>;

  // Theme & Toasts
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  refreshTasks: () => Promise<void>;
}

const TodoContext = createContext<TodoContextType | null>(null);

const STORAGE_KEY_THEME = 'smart_todolist_theme_v2';

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Settings stored in Neon DB (never in localStorage)
  const [hasServerKey, setHasServerKey] = useState(false);
  const [hasUserDbKey, setHasUserDbKey] = useState(false);
  const [userModel, setUserModel] = useState('gemini-2.5-flash');
  const [autoAnalyzeOnAdd, setAutoAnalyzeOnAdd] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('aiScore');

  // AI states
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [prioritizeCooldown, setPrioritizeCooldown] = useState(0);
  const [isDecomposingId, setIsDecomposingId] = useState<string | null>(null);
  const [isParsingNLP, setIsParsingNLP] = useState(false);

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (prioritizeCooldown <= 0) return;
    const interval = setInterval(() => {
      setPrioritizeCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [prioritizeCooldown]);

  // Theme loader
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Load user session and settings from DB
  const loadUserAndSettings = useCallback(async () => {
    try {
      setIsLoadingUser(true);

      const statusRes = await fetch('/api/ai/status');
      const statusData = await statusRes.json();
      setHasServerKey(Boolean(statusData.hasServerKey));

      if (statusData.user) {
        setUser(statusData.user);

        // Fetch user settings from Neon DB
        const settingsRes = await fetch('/api/user/settings');
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setHasUserDbKey(Boolean(s.hasApiKey));
          setUserModel(s.model || 'gemini-2.5-flash');
          setAutoAnalyzeOnAdd(s.autoAnalyzeOnAdd ?? true);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Error loading user/settings:', e);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  // Load tasks from Neon DB
  const refreshTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks)) {
          // Normalize subtasks & tags
          const normalized = data.tasks.map((t: any) => ({
            ...t,
            tags: Array.isArray(t.tags) ? t.tags : [],
            subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
          }));
          setTasks(normalized);
          return;
        }
      }
      setTasks([]);
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
  }, []);

  useEffect(() => {
    loadUserAndSettings();
    refreshTasks();
  }, [loadUserAndSettings, refreshTasks]);

  // Save user's API key to Neon DB
  const saveUserDbKey = useCallback(
    async (apiKey: string, model: string = userModel, autoAnalyze: boolean = autoAnalyzeOnAdd) => {
      try {
        const res = await fetch('/api/user/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            model,
            autoAnalyzeOnAdd: autoAnalyze,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Ошибка сохранения ключа в Neon');
        }

        setHasUserDbKey(Boolean(apiKey && apiKey.trim().length > 0));
        setUserModel(model);
        setAutoAnalyzeOnAdd(autoAnalyze);
        addToast('success', 'Настройки сохранены в БД Neon');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Не удалось сохранить ключ в БД';
        addToast('error', 'Ошибка сохранения', msg);
        return false;
      }
    },
    [userModel, autoAnalyzeOnAdd, addToast]
  );

  // All distinct tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => (t.tags || []).forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [tasks]);

  // Task CRUD operations with Neon DB
  const addTask = useCallback(
    async (input: {
      title: string;
      description?: string;
      dueDate?: string;
      priority?: PriorityLevel;
      quadrant?: EisenhowerQuadrant;
      estimatedMinutes?: number;
      tags?: string[];
      subtasks?: Subtask[];
      aiScore?: number;
      aiReasoning?: string;
    }): Promise<Task> => {
      const tempId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newTask: Task = {
        id: tempId,
        title: input.title,
        description: input.description,
        createdAt: new Date().toISOString(),
        dueDate: input.dueDate,
        isCompleted: false,
        priority: input.priority || 'MEDIUM',
        quadrant: input.quadrant || 'SCHEDULE',
        estimatedMinutes: input.estimatedMinutes || 30,
        tags: input.tags || [],
        subtasks: input.subtasks || [],
        aiScore: input.aiScore,
        aiReasoning: input.aiReasoning,
      };

      // Optimistic update
      setTasks((prev) => [newTask, ...prev]);

      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
        });

        if (!res.ok) {
          throw new Error('Ошибка при сохранении задачи в БД');
        }
      } catch (err) {
        console.error('Failed to persist task in Neon:', err);
      }

      return newTask;
    },
    []
  );

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to update task in Neon:', err);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete task in Neon:', err);
    }
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    let nextStatus = false;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          nextStatus = !t.isCompleted;
          if (nextStatus) {
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            } catch {}
          }
          return { ...t, isCompleted: nextStatus };
        }
        return t;
      })
    );

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: nextStatus }),
      });
    } catch (err) {
      console.error('Failed to toggle completion in Neon:', err);
    }
  }, []);

  // Subtask operations
  const addSubtask = useCallback(async (taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: title.trim(),
      isCompleted: false,
    };

    let updatedSubtasks: Subtask[] = [];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedSubtasks = [...t.subtasks, newSub];
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });
    } catch (err) {
      console.error('Failed to save subtask in Neon:', err);
    }
  }, []);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    let updatedSubtasks: Subtask[] = [];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedSubtasks = t.subtasks.map((sub) =>
            sub.id === subtaskId ? { ...sub, isCompleted: !sub.isCompleted } : sub
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });
    } catch (err) {
      console.error('Failed to toggle subtask in Neon:', err);
    }
  }, []);

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    let updatedSubtasks: Subtask[] = [];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedSubtasks = t.subtasks.filter((sub) => sub.id !== subtaskId);
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });
    } catch (err) {
      console.error('Failed to delete subtask in Neon:', err);
    }
  }, []);

  // 1. AI Prioritization («Разобрать с AI»)
  const prioritizeAllTasks = useCallback(async () => {
    if (prioritizeCooldown > 0) {
      addToast(
        'info',
        'Подождите немного',
        `Повторная AI-приоритезация будет доступна через ${prioritizeCooldown} сек.`
      );
      return;
    }

    const activeTasks = tasks.filter((t) => !t.isCompleted);
    if (activeTasks.length === 0) {
      addToast('info', 'Нет задач для анализа', 'Добавьте невыполненные задачи в список.');
      return;
    }

    setIsPrioritizing(true);

    try {
      const response = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: activeTasks,
          model: userModel,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при вызове Gemini API');
      }

      const updatesMap = new Map<string, any>();
      for (const item of result.data) {
        updatesMap.set(item.id, item);
      }

      setTasks((prev) =>
        prev.map((task) => {
          const aiMeta = updatesMap.get(task.id);
          if (aiMeta) {
            return {
              ...task,
              priority: aiMeta.priority,
              quadrant: aiMeta.quadrant,
              estimatedMinutes: aiMeta.estimatedMinutes,
              aiScore: aiMeta.aiScore,
              aiReasoning: aiMeta.aiReasoning,
            };
          }
          return task;
        })
      );

      setSortBy('aiScore');
      setPrioritizeCooldown(30);

      addToast(
        'success',
        'AI Сортировка завершена',
        `Успешно проанализировано ${result.analyzedCount} задач. Результаты сохранены в Neon DB.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Произошла ошибка при приоритезации';
      console.error('Prioritize error:', err);
      addToast('error', 'Ошибка AI-приоритезации', msg);
    } finally {
      setIsPrioritizing(false);
    }
  }, [tasks, userModel, prioritizeCooldown, addToast]);

  // 2. AI Decomposition («Разбить на шаги»)
  const decomposeTask = useCallback(
    async (taskId: string) => {
      const targetTask = tasks.find((t) => t.id === taskId);
      if (!targetTask) return;

      setIsDecomposingId(taskId);

      try {
        const response = await fetch('/api/ai/decompose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: targetTask.title,
            description: targetTask.description,
            model: userModel,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Не удалось разбить задачу');
        }

        const generatedSubtasks: Subtask[] = (result.subtasks || []).map(
          (s: { title: string }, index: number) => ({
            id: `sub-${Date.now()}-${index}`,
            title: s.title,
            isCompleted: false,
          })
        );

        const newSubtasks = [...targetTask.subtasks, ...generatedSubtasks];

        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, subtasks: newSubtasks } : t))
        );

        // Save in Neon
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtasks: newSubtasks }),
        });

        addToast(
          'success',
          'Задача разбита на шаги',
          `Добавлено ${generatedSubtasks.length} шагов и сохранено в Neon DB.`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Ошибка при декомпозиции';
        addToast('error', 'Ошибка декомпозиции', msg);
      } finally {
        setIsDecomposingId(null);
      }
    },
    [tasks, userModel, addToast]
  );

  // 3. AI Smart NLP parse
  const parseAndAddTask = useCallback(
    async (text: string): Promise<Task | null> => {
      if (!text.trim()) return null;

      setIsParsingNLP(true);

      try {
        const response = await fetch('/api/ai/parse-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            model: userModel,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Ошибка распознавания');
        }

        const parsed = result.data;
        const subtasks: Subtask[] = (parsed.suggestedSubtasks || []).map(
          (title: string, idx: number) => ({
            id: `sub-${Date.now()}-${idx}`,
            title,
            isCompleted: false,
          })
        );

        const newTask = await addTask({
          title: parsed.title,
          description: parsed.description,
          dueDate: parsed.dueDate,
          priority: parsed.priority,
          quadrant: parsed.quadrant,
          estimatedMinutes: parsed.estimatedMinutes,
          tags: parsed.tags || [],
          subtasks,
          aiReasoning: parsed.aiReasoning,
        });

        addToast(
          'success',
          'AI распознал задачу!',
          `Выставлен приоритет: ${parsed.priority}, время: ~${parsed.estimatedMinutes} мин.`
        );

        return newTask;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Не удалось обработать с AI';
        addToast('warning', 'AI недоступен — создана обычная задача', msg);

        return await addTask({
          title: text.trim(),
          priority: 'MEDIUM',
          quadrant: 'SCHEDULE',
          tags: [],
        });
      } finally {
        setIsParsingNLP(false);
      }
    },
    [userModel, addTask, addToast]
  );

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active' && task.isCompleted) return false;
        if (filter === 'completed' && !task.isCompleted) return false;

        if (selectedTag && !task.tags.includes(selectedTag)) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inTitle = task.title.toLowerCase().includes(q);
          const inDesc = task.description?.toLowerCase().includes(q) || false;
          const inTag = task.tags.some((tag) => tag.toLowerCase().includes(q));
          if (!inTitle && !inDesc && !inTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }

        switch (sortBy) {
          case 'aiScore':
            return (b.aiScore ?? 0) - (a.aiScore ?? 0);
          case 'priority': {
            const weight: Record<PriorityLevel, number> = {
              CRITICAL: 4,
              HIGH: 3,
              MEDIUM: 2,
              LOW: 1,
            };
            return weight[b.priority] - weight[a.priority];
          }
          case 'dueDate': {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'title':
            return a.title.localeCompare(b.title, 'ru');
          default:
            return 0;
        }
      });
  }, [tasks, filter, selectedTag, searchQuery, sortBy]);

  return (
    <TodoContext.Provider
      value={{
        tasks,
        filteredTasks,
        viewMode,
        setViewMode,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        sortBy,
        setSortBy,
        allTags,
        user,
        isLoadingUser,
        hasServerKey,
        hasUserDbKey,
        userModel,
        autoAnalyzeOnAdd,
        saveUserDbKey,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        isPrioritizing,
        prioritizeAllTasks,
        prioritizeCooldown,
        isDecomposingId,
        decomposeTask,
        isParsingNLP,
        parseAndAddTask,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        refreshTasks,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}
