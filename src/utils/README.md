# Исправление логики расчёта прогресса

Мы создали новый файл утилит для корректного расчёта прогресса на фронтенде, так как серверная логика была неполной или некорректной.

## 1. Новая функция расчёта

Файл: `interns/src/utils/progressHelper.js`

```javascript
export const calculateInternProgress = (intern) => {
  // Деструктурируем входные данные
  // Поддержка разных форматов данных (массив оценок или уже посчитанный средний балл)
  const { monthlyGoal, lessonsVisited, score = [] } = intern;

  // Защита от деления на 0
  const safeGoal = monthlyGoal > 0 ? monthlyGoal : 1;
  const safeLessonsVisited = lessonsVisited || 0;

  // 1. Прогресс по урокам: (lessonsVisited / goal) * 100
  // Минимум 0, максимум 100
  let lessonsProgress = (safeLessonsVisited / safeGoal) * 100;
  lessonsProgress = Math.min(100, Math.max(0, lessonsProgress));

  // 2. Средний балл
  let averageScore = 0;
  if (Array.isArray(score) && score.length > 0) {
    // Если передан массив оценок
    const sum = score.reduce((acc, curr) => acc + curr, 0);
    averageScore = sum / score.length;
  } else if (typeof intern.averageScore === 'number') {
    // Если передан уже готовый средний балл
    averageScore = intern.averageScore;
  } else if (typeof score === 'number') {
    // На случай если поле score содержит число
    averageScore = score;
  }

  // 3. Прогресс по качеству (баллам)
  // scoreProgress = (averageScore / 5) * 100
  let scoreProgress = (averageScore / 5) * 100;
  scoreProgress = Math.min(100, Math.max(0, scoreProgress));

  // 4. Общий прогресс
  // ВАЖНО: Среднее арифметическое двух прогрессов
  let overallProgress = (lessonsProgress + scoreProgress) / 2;
  
  // Определение цвета статуса
  const getStatusColor = (value) => {
    if (value < 50) return 'error';
    if (value < 80) return 'warning';
    return 'success';
  };

  const lessonsStatusColor = getStatusColor(lessonsProgress);
  const scoreStatusColor = getStatusColor(scoreProgress);
  const overallStatusColor = getStatusColor(overallProgress);

  // Возвращаем объект готовый для пропсов DesktopProgressSection
  return {
    monthlyGoal,
    actualLessons: safeLessonsVisited,
    averageScore, 
    
    lessonsProgressPercentage: Math.round(lessonsProgress),
    lessonsStatusColor,
    
    scoreProgressPercentage: Math.round(scoreProgress),
    scoreStatusColor,
    
    overallProgressPercentage: Math.round(overallProgress),
    overallStatusColor
  };
};
```

## 2. Как использовать в `Dashboard.jsx`

Вам нужно импортировать утилиту и компонент, подготовить данные и передать их.

**Изменения в `interns/src/pages/Dashboard.jsx`:**

```javascript
// 1. Импорты
import DesktopProgressSection from "../components/Dashboard/DesktopProgressSection";
import { calculateInternProgress } from "../utils/progressHelper";

// ... внутри компонента Dashboard перед return ...

const {
  lessonsThisMonth,
  monthlyGoal,
  averageScore,
  // ... другие поля
} = stats;

// 2. Подготовка данных для прогресса
// Создаём объект с данными, которые ожидает наша функция
const progressData = calculateInternProgress({
  monthlyGoal: monthlyGoal,
  lessonsVisited: lessonsThisMonth,
  averageScore: Number(averageScore), // Убедимся что это число
  // score: [5, 4, 5] // Если бы у нас был массив оценок
});

return (
  <div className="space-y-6 md:space-y-8 pb-10">
    {/* ... Header ... */}

    {/* 3. Вставка компонента прогресса (например, после StatsPanel или вместо неё, по вашему желанию) */}
    
    {/* Пример вставки: */}
    <div className="grid grid-cols-1">
       <DesktopProgressSection {...progressData} />
    </div>

    {/* ... остальной код ... */}
  </div>
);
```

## 3. Что было исправлено

1.  **Логика Overall Progress**: Теперь считается строго как `(lessonsProgress + scoreProgress) / 2`.
2.  **Защита данных**: Добавлена проверка на деление на 0 и `Math.min(100, val)`.
3.  **Статусы**: Цвета (error/warning/success) теперь определяются на фронтенде по единым правилам (<50, 50-80, >80).
