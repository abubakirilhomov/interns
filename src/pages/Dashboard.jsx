// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchProfile } from "../store/slices/authSlice";
// import { fetchLessons } from "../store/slices/lessonSlice";
// import StatsCard from "../components/UI/StatsCard";
// import GradeBadge from "../components/UI/GradesBadge";
// import LoadingSpinner from "../components/UI/LoadingSpinner";

// const Dashboard = () => {
//   const dispatch = useDispatch();
//   const { user, isLoading } = useSelector((state) => state.auth);
//   const { lessons } = useSelector((state) => state.lessons);
//   const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
//   const [isMobile, setIsMobile] = useState(false);

//   // Check if device is mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   useEffect(() => {
//     dispatch(fetchProfile());
//     dispatch(fetchLessons());
//   }, [dispatch]);

//   useEffect(() => {
//     if (!user?.createdAt || !user?.probationPeriod) return;

//     const updateTimer = () => {
//       const createdDate = new Date(user.createdAt);
//       const endDate = new Date(createdDate);
//       endDate.setMonth(endDate.getMonth() + user.probationPeriod);
      
//       const now = new Date();
//       const difference = endDate - now;
      
//       if (difference > 0) {
//         const days = Math.floor(difference / (1000 * 60 * 60 * 24));
//         const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//         const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
//         setTimeLeft({ days, hours, minutes });
//       } else {
//         setTimeLeft({ days: 0, hours: 0, minutes: 0 });
//       }
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 60000);

//     return () => clearInterval(interval);
//   }, [user?.createdAt, user?.probationPeriod]);

//   const totalLessonsVisited = user?.lessonsVisited
//     ? user.lessonsVisited.reduce(
//         (total, entry) => total + (entry.count || 0),
//         0
//       )
//     : 0;

//   const currentMonth = new Date().toISOString().slice(0, 7);
//   const monthlyLessons = user?.lessonsVisited
//     ? user.lessonsVisited.reduce((total, entry) => {
//         const lesson = lessons.find((l) => l._id === entry.lessonId);
//         if (lesson && lesson.createdAt?.slice(0, 7) === currentMonth) {
//           return total + (entry.count || 0);
//         }
//         return total;
//       }, 0)
//     : 0;

//   // Расчет прогресса
//   const monthlyGoal = user?.goal || 0;
//   const actualLessons = monthlyLessons;
//   const lessonsProgressPercentage = monthlyGoal > 0 ? Math.min((actualLessons / monthlyGoal) * 100, 100) : 0;
  
//   const averageScore = user?.score || 0;
//   const scoreProgressPercentage = averageScore > 0 ? Math.min((averageScore / 5) * 100, 100) : 0;
  
//   const overallProgressPercentage = (lessonsProgressPercentage + scoreProgressPercentage) / 2;
  
//   const getStatusColor = (percentage) => {
//     if (percentage >= 80) return 'success';
//     if (percentage >= 50) return 'warning';
//     return 'error';
//   };

//   const lessonsStatusColor = getStatusColor(lessonsProgressPercentage);
//   const scoreStatusColor = getStatusColor(scoreProgressPercentage);
//   const overallStatusColor = getStatusColor(overallProgressPercentage);

//   const generateProgressSteps = () => {
//     const steps = [];
//     const totalSteps = isMobile ? 5 : 10; // Fewer steps on mobile
//     const completedSteps = Math.floor((overallProgressPercentage / 100) * totalSteps);
    
//     for (let i = 0; i < totalSteps; i++) {
//       steps.push({
//         id: i,
//         completed: i < completedSteps,
//         current: i === completedSteps
//       });
//     }
//     return steps;
//   };

//   const progressSteps = generateProgressSteps();

//   // Mobile Progress Component
//   const MobileProgressSection = () => (
//     <div className="space-y-4">
//       {/* Mobile radial progress cards */}
//       <div className="grid grid-cols-2 gap-4">
//         <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow">
//           <div className="card-body items-center text-center p-4">
//             <div 
//               className={`radial-progress text-primary text-xl font-bold`}
//               style={{"--value": lessonsProgressPercentage, "--size": "5rem", "--thickness": "6px"}}
//               role="progressbar"
//             >
//               {lessonsProgressPercentage.toFixed(0)}%
//             </div>
//             <div className="mt-2">
//               <div className="text-xs text-base-content/60">Уроки</div>
//               <div className="text-sm font-semibold">{actualLessons} из {monthlyGoal}</div>
//             </div>
//           </div>
//         </div>

//         <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow">
//           <div className="card-body items-center text-center p-4">
//             <div 
//               className={`radial-progress text-secondary text-xl font-bold`}
//               style={{"--value": scoreProgressPercentage, "--size": "5rem", "--thickness": "6px"}}
//               role="progressbar"
//             >
//               {scoreProgressPercentage.toFixed(0)}%
//             </div>
//             <div className="mt-2">
//               <div className="text-xs text-base-content/60">Качество</div>
//               <div className="text-sm font-semibold">{averageScore.toFixed(1)} из 5.0</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Overall progress for mobile */}
//       <div className="card bg-base-100 shadow">
//         <div className="card-body items-center text-center">
//           <h3 className="card-title text-lg mb-4">Общий прогресс</h3>
//           <div 
//             className={`radial-progress text-${overallStatusColor} text-2xl font-bold mb-4`}
//             style={{"--value": overallProgressPercentage, "--size": "8rem", "--thickness": "8px"}}
//             role="progressbar"
//           >
//             {overallProgressPercentage.toFixed(1)}%
//           </div>
          
//           {/* Mobile status indicators */}
//           <div className="flex justify-center gap-4">
//             <div className={`text-center p-2 rounded-lg ${overallStatusColor === 'error' ? 'bg-error/10 text-error' : 'bg-base-200 text-base-content/50'}`}>
//               <div className="text-sm">🔴</div>
//               <div className="text-xs">0-50%</div>
//             </div>
//             <div className={`text-center p-2 rounded-lg ${overallStatusColor === 'warning' ? 'bg-warning/10 text-warning' : 'bg-base-200 text-base-content/50'}`}>
//               <div className="text-sm">🟡</div>
//               <div className="text-xs">50-80%</div>
//             </div>
//             <div className={`text-center p-2 rounded-lg ${overallStatusColor === 'success' ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/50'}`}>
//               <div className="text-sm">🟢</div>
//               <div className="text-xs">80-100%</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Desktop Progress Component
//   const DesktopProgressSection = () => (
//     <div className="space-y-6">
//       {/* План vs Факт */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow">
//           <div className="card-body">
//             <h3 className="card-title text-primary">📋 План на месяц</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="text-2xl font-bold text-primary">{monthlyGoal}</div>
//                 <div className="text-sm text-base-content/60">Уроков</div>
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-primary">5.0</div>
//                 <div className="text-sm text-base-content/60">Макс. балл</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow">
//           <div className="card-body">
//             <h3 className="card-title text-secondary">✅ Факт</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="text-2xl font-bold text-secondary">{actualLessons}</div>
//                 <div className="text-sm text-base-content/60">Уроков</div>
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-secondary">{averageScore.toFixed(1)}</div>
//                 <div className="text-sm text-base-content/60">Средний балл</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Прогресс-бар и статус */}
//       <div className="card bg-base-100 shadow">
//         <div className="card-body">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="card-title">Прогресс выполнения</h3>
//             <div className={`badge badge-${overallStatusColor} badge-lg`}>
//               {overallProgressPercentage.toFixed(1)}%
//             </div>
//           </div>
          
//           <div className="space-y-4">
//             {/* Прогресс по урокам */}
//             <div>
//               <div className="flex justify-between text-sm mb-2">
//                 <span>Уроки ({actualLessons} из {monthlyGoal})</span>
//                 <span className={`text-${lessonsStatusColor}`}>{lessonsProgressPercentage.toFixed(1)}%</span>
//               </div>
//               <div className="w-full bg-base-200 rounded-full h-3">
//                 <div 
//                   className={`bg-${lessonsStatusColor} h-3 rounded-full transition-all duration-500`}
//                   style={{ width: `${lessonsProgressPercentage}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* Прогресс по баллам */}
//             <div>
//               <div className="flex justify-between text-sm mb-2">
//                 <span>Качество ({averageScore.toFixed(1)} из 5.0)</span>
//                 <span className={`text-${scoreStatusColor}`}>{scoreProgressPercentage.toFixed(1)}%</span>
//               </div>
//               <div className="w-full bg-base-200 rounded-full h-3">
//                 <div 
//                   className={`bg-${scoreStatusColor} h-3 rounded-full transition-all duration-500`}
//                   style={{ width: `${scoreProgressPercentage}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* Общий прогресс */}
//             <div className="pt-2 border-t border-base-300">
//               <div className="flex justify-between text-sm mb-2">
//                 <span className="font-semibold">Общий прогресс</span>
//                 <span className={`text-${overallStatusColor} font-semibold`}>{overallProgressPercentage.toFixed(1)}%</span>
//               </div>
//               <div className="w-full bg-base-200 rounded-full h-4">
//                 <div 
//                   className={`bg-${overallStatusColor} h-4 rounded-full transition-all duration-500`}
//                   style={{ width: `${overallProgressPercentage}%` }}
//                 ></div>
//               </div>
//             </div>
//           </div>

//           {/* Статус индикаторы */}
//           <div className="grid grid-cols-3 gap-4 mt-6">
//             <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'error' ? 'bg-error/10 text-error' : 'bg-base-200 text-base-content/50'}`}>
//               <div className="text-lg">🔴</div>
//               <div className="text-xs">0-50%</div>
//               <div className="text-xs">Критично</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'warning' ? 'bg-warning/10 text-warning' : 'bg-base-200 text-base-content/50'}`}>
//               <div className="text-lg">🟡</div>
//               <div className="text-xs">50-80%</div>
//               <div className="text-xs">Нормально</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'success' ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/50'}`}>
//               <div className="text-lg">🟢</div>
//               <div className="text-xs">80-100%</div>
//               <div className="text-xs">Отлично</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (isLoading) {
//     return <LoadingSpinner size="lg" className="min-h-96" />;
//   }

//   return (
//     <div className="space-y-4 md:space-y-6 px-2 md:px-0">
//       {/* Header */}
//       <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-base-content">
//             {isMobile ? `Привет, ${user?.name?.split(' ')[0] || "Гость"}!` : `Добро пожаловать, ${user?.name || "Гость"}!`}
//           </h1>
//           <p className="text-sm md:text-base text-base-content/70 mt-1">
//             {isMobile ? "Ваш прогресс" : "Вот ваш прогресс на сегодня"}
//           </p>
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
//         <div>
//           <GradeBadge grade={user?.grade || "Не указан"} />
//         </div>
        
//         {/* Timer для испытательного срока */}
//         <div className="bg-base-200 p-3 rounded-lg">
//           <div className="text-xs text-base-content/60 mb-1">
//             {isMobile ? "Испыт. срок" : "Испытательный срок"}
//           </div>
//           <div className="text-sm font-mono">
//             {isMobile ? 
//               `${timeLeft.days}д ${timeLeft.hours}ч` : 
//               `${timeLeft.days}д ${timeLeft.hours}ч ${timeLeft.minutes}м`
//             }
//           </div>
//         </div>
//       </div>

//       {/* Progress Section - Mobile vs Desktop */}
//       {isMobile ? <MobileProgressSection /> : <DesktopProgressSection />}

//       {/* Timeline прогресса */}
//       <div className="card bg-base-100 shadow">
//         <div className="card-body">
//           <h3 className="card-title mb-4 text-base md:text-lg">Карта прогресса</h3>
//           <div className="flex items-center justify-between">
//             {progressSteps.map((step, index) => (
//               <div key={step.id} className="flex items-center">
//                 <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold
//                   ${step.completed ? 'bg-success text-success-content' : 
//                     step.current ? 'bg-warning text-warning-content' : 
//                     'bg-base-300 text-base-content/50'}`}>
//                   {step.completed ? '✓' : step.current ? '●' : '○'}
//                 </div>
//                 {index < progressSteps.length - 1 && (
//                   <div className={`w-4 md:w-8 h-1 mx-1 ${step.completed ? 'bg-success' : 'bg-base-300'}`}></div>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between text-xs text-base-content/60 mt-2">
//             <span>Начало</span>
//             <span>{isMobile ? "Цель" : "Цель достигнута"}</span>
//           </div>
//         </div>
//       </div>

//       {/* Основная статистика */}
//       <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
//         <StatsCard
//           title="Средний балл"
//           value={user?.score ? user.score.toFixed(1) : "0.0"}
//           icon="⭐"
//           trend="up"
//           trendValue="+0.2"
//           colorClass="text-warning"
//         />

//         <StatsCard
//           title={isMobile ? "Уроков" : "Уроков пройдено"}
//           value={totalLessonsVisited}
//           icon="📚"
//           trend="up"
//           trendValue={`+${monthlyLessons}`}
//           colorClass="text-info"
//         />

//         <StatsCard
//           title={isMobile ? "Отзывов" : "Отзывов получено"}
//           value={user?.feedbacks || 0}
//           icon="💬"
//           colorClass="text-success"
//         />

//         <StatsCard
//           title="Уровень"
//           value={user?.grade || "Junior"}
//           icon="🎯"
//           colorClass="text-secondary"
//         />
//       </div>

//       {/* Recent Activity */}
//       <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
//         <div className="card bg-base-100 shadow">
//           <div className="card-body">
//             <h3 className="card-title text-base md:text-lg mb-4">
//               {isMobile ? "Отзывы" : "Последние отзывы"}
//             </h3>
//             {user?.feedbacks && user.feedbacks > 0 ? (
//               <div className="space-y-3 max-h-[20vh] overflow-y-auto">
//                 {Array.from({ length: Math.min(user.feedbacks, isMobile ? 3 : 5) }).map((_, index) => (
//                   <div
//                     key={index}
//                     className="relative flex items-start space-x-3 p-3 bg-base-200 rounded-lg backdrop-blur-sm cursor-not-allowed"
//                     title="Фидбеки конфиденциальные и недоступны для просмотра"
//                   >
//                     <div className="flex-shrink-0">
//                       <div className="badge badge-warning">⭐</div>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm text-base-content/50 select-none blur-sm">
//                         Содержимое отзыва скрыто
//                       </p>
//                       <p className="text-xs text-base-content/40 mt-1 select-none">
//                         Дата скрыта
//                       </p>
//                     </div>
//                     <div className="absolute inset-0 bg-base-200/40 backdrop-blur-sm rounded-lg pointer-events-none" />
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-base-content/60">
//                 <p>Пока нет отзывов</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Monthly Progress */}
//         <div className="card bg-base-100 shadow">
//           <div className="card-body">
//             <h3 className="card-title text-base md:text-lg mb-4">
//               {isMobile ? "По месяцам" : "Прогресс по месяцам"}
//             </h3>
//             {user?.lessonsVisited && user.lessonsVisited.length > 0 ? (
//               <div className="space-y-3">
//                 {Object.entries(
//                   user.lessonsVisited.reduce((acc, entry) => {
//                     const lesson = lessons.find(
//                       (l) => l._id === entry.lessonId
//                     );
//                     if (!lesson) return acc;
//                     const month = lesson.createdAt?.slice(0, 7) || "Unknown";
//                     acc[month] = (acc[month] || 0) + (entry.count || 0);
//                     return acc;
//                   }, {})
//                 )
//                   .sort(([a], [b]) => b.localeCompare(a))
//                   .slice(0, isMobile ? 4 : 6)
//                   .map(([month, count]) => (
//                     <div
//                       key={month}
//                       className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
//                     >
//                       <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
//                         {month === "Unknown"
//                           ? "Неизвестный месяц"
//                           : new Date(month + "-01").toLocaleDateString(
//                               "ru-RU",
//                               {
//                                 year: isMobile ? "2-digit" : "numeric",
//                                 month: isMobile ? "short" : "long",
//                               }
//                             )}
//                       </span>
//                       <div className={`badge badge-primary ${isMobile ? 'badge-sm' : ''}`}>
//                         {count} {isMobile ? '' : 'уроков'}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-base-content/60">
//                 <p className={isMobile ? 'text-sm' : ''}>Пока нет данных о посещённых уроках</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="card bg-base-100 shadow">
//         <div className="card-body">
//           <h3 className="card-title text-base md:text-lg mb-4">Быстрые действия</h3>
//           <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
//             <button className={`btn btn-primary btn-outline ${isMobile ? 'btn-sm' : ''}`}>
//               <svg
//                 className="w-4 h-4 md:w-5 md:h-5 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//                 />
//               </svg>
//               {isMobile ? "Уроки" : "Посмотреть уроки"}
//             </button>

//             <button className={`btn btn-secondary btn-outline ${isMobile ? 'btn-sm' : ''}`}>
//               <svg
//                 className="w-4 h-4 md:w-5 md:h-5 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
//                 />
//               </svg>
//               {isMobile ? "Обратная связь" : "Обратная связь"}
//             </button>

//             <button className={`btn btn-accent btn-outline ${isMobile ? 'btn-sm' : ''}`}>
//               <svg
//                 className="w-4 h-4 md:w-5 md:h-5 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                 />
//               </svg>
//               Профиль
//             </button>

//             <button className={`btn btn-info btn-outline ${isMobile ? 'btn-sm' : ''}`}>
//               <svg
//                 className="w-4 h-4 md:w-5 md:h-5 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2z"
//                 />
//               </svg>
//               Статистика
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../store/slices/authSlice";
import { fetchLessons } from "../store/slices/lessonSlice";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import GradeBadge from "../components/UI/GradesBadge";

// Импорт новых компонентов
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import ProbationTimer from "../components/Dashboard/ProbationTimer";
import MobileProgressSection from "../components/Dashboard/MobileProgressSection";
import DesktopProgressSection from "../components/Dashboard/DesktopProgressSection";
import ProgressTimeline from "../components/Dashboard/ProgressTimeline";
import StatsGrid from "../components/Dashboard/StatsGrid";
import RecentActivity from "../components/Dashboard/RecentActivity";
import QuickActions from "../components/Dashboard/QuickActions";

// Импорт хука
import useMobileDetection from "../hooks/useMobileDetection";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { lessons } = useSelector((state) => state.lessons);
  const isMobile = useMobileDetection();

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchLessons());
  }, [dispatch]);

  const totalLessonsVisited = user?.lessonsVisited
    ? user.lessonsVisited.reduce(
        (total, entry) => total + (entry.count || 0),
        0
      )
    : 0;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyLessons = user?.lessonsVisited
    ? user.lessonsVisited.reduce((total, entry) => {
        const lesson = lessons.find((l) => l._id === entry.lessonId);
        if (lesson && lesson.createdAt?.slice(0, 7) === currentMonth) {
          return total + (entry.count || 0);
        }
        return total;
      }, 0)
    : 0;

  // Расчет прогресса
  const monthlyGoal = user?.goal || 0;
  const actualLessons = monthlyLessons;
  const lessonsProgressPercentage = monthlyGoal > 0 ? Math.min((actualLessons / monthlyGoal) * 100, 100) : 0;
  
  const averageScore = user?.score || 0;
  const scoreProgressPercentage = averageScore > 0 ? Math.min((averageScore / 5) * 100, 100) : 0;
  
  const overallProgressPercentage = (lessonsProgressPercentage + scoreProgressPercentage) / 2;
  
  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const lessonsStatusColor = getStatusColor(lessonsProgressPercentage);
  const scoreStatusColor = getStatusColor(scoreProgressPercentage);
  const overallStatusColor = getStatusColor(overallProgressPercentage);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }

  return (
    <div className="space-y-4 md:space-y-6 md:px-0 h-[90vh] overflow-y-auto">
      {/* Header */}
      <DashboardHeader user={user} />

      <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
        <div>
          <GradeBadge grade={user?.grade || "Не указан"} />
        </div>
        
        {/* Timer для испытательного срока */}
        <ProbationTimer user={user} isMobile={isMobile} />
      </div>

      {/* Progress Section - Mobile vs Desktop */}
      {isMobile ? (
        <MobileProgressSection 
          lessonsProgressPercentage={lessonsProgressPercentage}
          actualLessons={actualLessons}
          monthlyGoal={monthlyGoal}
          scoreProgressPercentage={scoreProgressPercentage}
          averageScore={averageScore}
          overallProgressPercentage={overallProgressPercentage}
          overallStatusColor={overallStatusColor}
        />
      ) : (
        <DesktopProgressSection 
          monthlyGoal={monthlyGoal}
          actualLessons={actualLessons}
          averageScore={averageScore}
          overallProgressPercentage={overallProgressPercentage}
          overallStatusColor={overallStatusColor}
          lessonsProgressPercentage={lessonsProgressPercentage}
          lessonsStatusColor={lessonsStatusColor}
          scoreProgressPercentage={scoreProgressPercentage}
          scoreStatusColor={scoreStatusColor}
        />
      )}

      {/* Timeline прогресса */}
      <ProgressTimeline 
        overallProgressPercentage={overallProgressPercentage}
        isMobile={isMobile}
      />

      {/* Основная статистика */}
      <StatsGrid 
        user={user}
        totalLessonsVisited={totalLessonsVisited}
        monthlyLessons={monthlyLessons}
        isMobile={isMobile}
      />

      {/* Recent Activity */}
      <RecentActivity 
        user={user}
        lessons={lessons}
        isMobile={isMobile}
      />

      {/* Quick Actions */}
      <QuickActions isMobile={isMobile} />
    </div>
  );
};

export default Dashboard;