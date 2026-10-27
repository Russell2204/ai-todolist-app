import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Task, PriorityLevel, EisenhowerQuadrant } from '@/types/todo';

export interface PrioritizedItem {
  id: string;
  priority: PriorityLevel;
  quadrant: EisenhowerQuadrant;
  estimatedMinutes: number;
  aiScore: number;
  aiReasoning: string;
}

export interface DecomposedItem {
  subtasks: Array<{ title: string }>;
}

export interface ParsedTaskResult {
  title: string;
  description: string;
  priority: PriorityLevel;
  quadrant: EisenhowerQuadrant;
  estimatedMinutes: number;
  dueDate?: string; // ISO string if detected
  tags: string[];
  aiReasoning: string;
  suggestedSubtasks?: string[];
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

export function getGeminiClient(customApiKey?: string) {
  const apiKey = (customApiKey && customApiKey.trim().length > 0)
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      'API-ключ Google Gemini не найден. Пожалуйста, введите ваш ключ в настройках (иконка ⚙️ вверху справа) или укажите GEMINI_API_KEY в файле .env.local'
    );
  }

  return new GoogleGenAI({ apiKey });
}

// 1. Массовая приоритезация задач по спецификации
const prioritizationSchema: Schema = {
  type: Type.ARRAY,
  description: 'Список проанализированных задач с обновленными приоритетами',
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: 'ID исходной задачи' },
      priority: {
        type: Type.STRING,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        description: 'Уровень приоритета',
      },
      quadrant: {
        type: Type.STRING,
        enum: ['DO_FIRST', 'SCHEDULE', 'DELEGATE', 'DELETE'],
        description: 'Квадрант матрицы Эйзенхауэра',
      },
      estimatedMinutes: {
        type: Type.INTEGER,
        description: 'Примерная оценка времени в минутах',
      },
      aiScore: {
        type: Type.INTEGER,
        description: 'Рейтинг приоритетности от 1 до 100',
      },
      aiReasoning: {
        type: Type.STRING,
        description: 'Короткое и емкое объяснение на русском языке (1 предложение)',
      },
    },
    required: ['id', 'priority', 'quadrant', 'estimatedMinutes', 'aiScore', 'aiReasoning'],
  },
};

export async function prioritizeTasksWithAI(
  tasks: Task[],
  customApiKey?: string,
  modelName: string = DEFAULT_MODEL
): Promise<PrioritizedItem[]> {
  const ai = getGeminiClient(customApiKey);

  const payload = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    dueDate: t.dueDate || 'не указан',
    currentPriority: t.priority,
    tags: t.tags,
  }));

  const prompt = `
Текущее локальное время и дата: ${new Date().toISOString()}

Проанализируй следующий список активных задач пользователя:
${JSON.stringify(payload, null, 2)}

Инструкции:
1. Оцени важность и срочность каждой задачи с учетом текущей даты и возможных дедлайнов.
2. Присвой каждой задаче квадрант матрицы Эйзенхауэра:
   - DO_FIRST: Срочно и Важно (критические дедлайны, блокирующие вопросы)
   - SCHEDULE: Не срочно, но Важно (стратегические задачи, обучение, здоровье)
   - DELEGATE: Срочно, но Не важно (рутина, которую можно оптимизировать или делегировать)
   - DELETE: Не срочно и Не важно (пожиратели времени, низкоприоритетные мелочи)
3. Выстави числовой рейтинг aiScore от 1 до 100 (чем выше, тем скорее нужно сделать задачу прямо сейчас).
4. Оцени примерное время выполнения в минутах (estimatedMinutes).
5. Напиши четкое и дружелюбное обоснование aiReasoning на русском языке (ровно 1 предложение).
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction:
        'Ты — эксперт по личной продуктивности и тайм-менеджменту. Помогай пользователю эффективно структурировать дела.',
      responseMimeType: 'application/json',
      responseSchema: prioritizationSchema,
      temperature: 0.2,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini API вернул пустой ответ при приоритезации.');
  }

  return JSON.parse(responseText) as PrioritizedItem[];
}

// 2. Декомпозиция сложной задачи на подзадачи
const decompositionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subtasks: {
      type: Type.ARRAY,
      description: 'Список конкретных шагов от 3 до 5 пунктов',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Конкретное действие в повелительном наклонении или инфинитиве' },
        },
        required: ['title'],
      },
    },
  },
  required: ['subtasks'],
};

export async function decomposeTaskWithAI(
  title: string,
  description?: string,
  customApiKey?: string,
  modelName: string = DEFAULT_MODEL
): Promise<Array<{ title: string }>> {
  const ai = getGeminiClient(customApiKey);

  const prompt = `
Задача: "${title}"
${description ? `Дополнительное описание: "${description}"` : ''}

Разбей эту задачу на 3-5 конкретных, выполнимых шагов (подзадач).
Каждый шаг должен быть практичным и лаконичным на русском языке.
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction:
        'Ты — ассистент по планированию. Декомпозируй крупную задачу на четкие понятные подзадачи для чек-листа.',
      responseMimeType: 'application/json',
      responseSchema: decompositionSchema,
      temperature: 0.3,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini API вернул пустой ответ при декомпозиции задачи.');
  }

  const parsed = JSON.parse(responseText) as DecomposedItem;
  return parsed.subtasks;
}

// 3. NLP Smart Auto-fill при вводе новой задачи
const parseTaskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Очищенное краткое название задачи' },
    description: { type: Type.STRING, description: 'Дополнительные детали или контекст (если есть)' },
    priority: {
      type: Type.STRING,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      description: 'Определенный приоритет',
    },
    quadrant: {
      type: Type.STRING,
      enum: ['DO_FIRST', 'SCHEDULE', 'DELEGATE', 'DELETE'],
      description: 'Квадрант Эйзенхауэра',
    },
    estimatedMinutes: { type: Type.INTEGER, description: 'Оценка времени в минутах' },
    dueDate: { type: Type.STRING, description: 'Дата и время в формате ISO 8601 (если указан срок в тексте)' },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Релевантные теги (1-3 штуки, например: "работа", "покупки", "здоровье")',
    },
    aiReasoning: { type: Type.STRING, description: 'Краткое объяснение, почему так определены параметры' },
    suggestedSubtasks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Опциональные первые шаги, если задача объемная',
    },
  },
  required: ['title', 'description', 'priority', 'quadrant', 'estimatedMinutes', 'tags', 'aiReasoning'],
};

export async function parseTaskNLPWithAI(
  inputText: string,
  customApiKey?: string,
  modelName: string = DEFAULT_MODEL
): Promise<ParsedTaskResult> {
  const ai = getGeminiClient(customApiKey);

  const now = new Date();
  const prompt = `
Текущее время: ${now.toISOString()} (${now.toLocaleString('ru-RU')})
Текст задачи от пользователя: "${inputText}"

Извлеки из текста:
1. Лаконичное название задачи (title).
2. Подробности в description (если есть).
3. Дедлайн (dueDate в формате ISO 8601), если в тексте упоминаются фразы вроде "завтра", "к пятнице", "до конца дня", "через 2 часа".
4. Оценку приоритета (CRITICAL / HIGH / MEDIUM / LOW) и квадрант Эйзенхауэра.
5. Примерное время выполнения в минутах (estimatedMinutes).
6. 1-3 подходящих тега на русском языке (например: "Работа", "Учеба", "Дом", "Финансы").
7. Краткое объяснение (aiReasoning).
8. Если задача сложная, предложи 2-3 начальных шага (suggestedSubtasks).
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction:
        'Ты — интеллектуальный анализатор задач. Выделяй скрытые параметры, дедлайны и категорию из произвольного текста пользователя.',
      responseMimeType: 'application/json',
      responseSchema: parseTaskSchema,
      temperature: 0.2,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini API вернул пустой ответ при анализе текста.');
  }

  return JSON.parse(responseText) as ParsedTaskResult;
}

// 4. Проверка подключения к Gemini
export async function testGeminiConnection(customApiKey?: string, modelName: string = DEFAULT_MODEL) {
  const ai = getGeminiClient(customApiKey);
  const response = await ai.models.generateContent({
    model: modelName,
    contents: 'Привет! Ответь коротко одним словом "OK" для проверки связи.',
  });
  return { success: true, text: response.text?.trim() };
}
