'use client';

import React, { useState } from 'react';
import { useTodo } from '@/context/TodoContext';
import { Sparkles, Plus, Loader2, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { PriorityLevel, EisenhowerQuadrant } from '@/types/todo';

export function SmartTaskInput() {
  const {
    addTask,
    parseAndAddTask,
    isParsingNLP,
    autoAnalyzeOnAdd,
    saveUserDbKey,
    allTags,
  } = useTodo();

  const [inputVal, setInputVal] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [localAutoFill, setLocalAutoFill] = useState(autoAnalyzeOnAdd);

  // Manual extra parameters
  const [manualPriority, setManualPriority] = useState<PriorityLevel>('MEDIUM');
  const [manualQuadrant, setManualQuadrant] = useState<EisenhowerQuadrant>('SCHEDULE');
  const [manualMinutes, setManualMinutes] = useState<number>(30);
  const [manualDueDate, setManualDueDate] = useState<string>('');
  const [manualTagInput, setManualTagInput] = useState<string>('');

  const toggleAutoFill = () => {
    const nextVal = !localAutoFill;
    setLocalAutoFill(nextVal);
    saveUserDbKey(undefined as any, undefined, nextVal).catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isParsingNLP) return;

    if (localAutoFill) {
      const textToParse = inputVal;
      setInputVal('');
      await parseAndAddTask(textToParse);
    } else {
      const tags = manualTagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await addTask({
        title: inputVal.trim(),
        priority: manualPriority,
        quadrant: manualQuadrant,
        estimatedMinutes: Number(manualMinutes) || 30,
        dueDate: manualDueDate ? new Date(manualDueDate).toISOString() : undefined,
        tags,
      });

      setInputVal('');
      setManualTagInput('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="w-full bg-[#1A1C1A] rounded-2xl border border-[#282C27] shadow-sm p-2.5 sm:p-3.5 transition-all">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Main Input Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isParsingNLP}
              placeholder={
                localAutoFill
                  ? 'Что освободит вашу голову сегодня?..'
                  : 'Запишите новую задачу...'
              }
              className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#141614] border text-sm sm:text-base text-[#E1E3DA] placeholder:text-[#8C9287] focus:outline-none transition-all ${
                isParsingNLP
                  ? 'border-[#7CA3AC]/50 text-[#8C9287]'
                  : 'border-[#282C27] focus:border-[#7E9F74] focus:ring-2 focus:ring-[#7E9F74]/20'
              }`}
            />
            {isParsingNLP && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-[#7CA3AC] font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">AI распределяет...</span>
              </div>
            )}
          </div>

          {/* Add / Submit Button */}
          <button
            type="submit"
            disabled={!inputVal.trim() || isParsingNLP}
            className={`flex items-center justify-center gap-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              !inputVal.trim() || isParsingNLP
                ? 'bg-[#232622] text-[#585E54] cursor-not-allowed'
                : 'bg-[#7E9F74] text-[#111211] hover:bg-[#8EB382] active:scale-95'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        {/* Action Bar: AI Auto-fill toggle & details */}
        <div className="flex items-center justify-between text-xs text-[#8C9287] px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAutoFill}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                localAutoFill
                  ? 'bg-[#1F2422] text-[#7CA3AC] border-[#2B3531]'
                  : 'bg-transparent text-[#8C9287] border-[#282C27] hover:text-[#E1E3DA]'
              }`}
              title="Автоматически определить дедлайн, приоритет и теги через AI"
            >
              <Sparkles className="w-3 h-3 text-[#7CA3AC]" />
              <span>AI авто-анализ</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  localAutoFill ? 'bg-[#7CA3AC]' : 'bg-[#585E54]'
                }`}
              />
            </button>

            {!localAutoFill && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-[#8C9287] hover:text-[#E1E3DA] transition-colors cursor-pointer"
              >
                <span>Параметры</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          <span className="text-[11px] text-[#585E54] hidden sm:inline">
            Нажмите ↵ Enter для быстрого сохранения
          </span>
        </div>

        {/* Expandable Manual Parameters (Minimalist & Compact) */}
        {!localAutoFill && isExpanded && (
          <div className="mt-2 pt-2.5 border-t border-[#222521] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs animate-gentle-rise">
            {/* Priority */}
            <div>
              <label className="block text-[#8C9287] mb-1 font-medium text-[11px]">Приоритет</label>
              <select
                value={manualPriority}
                onChange={(e) => setManualPriority(e.target.value as PriorityLevel)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74]"
              >
                <option value="CRITICAL">Критический</option>
                <option value="HIGH">Высокий</option>
                <option value="MEDIUM">Средний</option>
                <option value="LOW">Низкий</option>
              </select>
            </div>

            {/* Quadrant */}
            <div>
              <label className="block text-[#8C9287] mb-1 font-medium text-[11px]">Квадрант</label>
              <select
                value={manualQuadrant}
                onChange={(e) => setManualQuadrant(e.target.value as EisenhowerQuadrant)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74]"
              >
                <option value="DO_FIRST">Q1: Сделать первым</option>
                <option value="SCHEDULE">Q2: Запланировать</option>
                <option value="DELEGATE">Q3: Делегировать</option>
                <option value="DELETE">Q4: Отпустить</option>
              </select>
            </div>

            {/* Time */}
            <div>
              <label className="block text-[#8C9287] mb-1 font-medium text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> Время (мин)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74]"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[#8C9287] mb-1 font-medium text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Дедлайн
              </label>
              <input
                type="datetime-local"
                value={manualDueDate}
                onChange={(e) => setManualDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#141614] border border-[#282C27] text-[#E1E3DA] focus:outline-none focus:border-[#7E9F74]"
              />
            </div>

            {/* Tags Input */}
            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-[#8C9287] mb-1 font-medium text-[11px]">
                Теги (через запятую)
              </label>
              <input
                type="text"
                value={manualTagInput}
                onChange={(e) => setManualTagInput(e.target.value)}
                placeholder="работа, дом, здоровье..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#141614] border border-[#282C27] text-[#E1E3DA] placeholder:text-[#585E54] focus:outline-none focus:border-[#7E9F74]"
              />
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[11px] text-[#585E54] mr-1 self-center">Быстрые:</span>
                  {allTags.slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const current = manualTagInput ? manualTagInput.split(',').map((t) => t.trim()) : [];
                        if (!current.includes(tag)) {
                          setManualTagInput([...current, tag].join(', '));
                        }
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-[#141614] border border-[#222521] text-[#8C9287] hover:text-[#E1E3DA] transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
