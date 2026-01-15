import { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";

const DashboardHeader = ({ user }) => {
  const [greeting, setGreeting] = useState("Добро пожаловать");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setGreeting("Доброй ночи");
    else if (hour < 12) setGreeting("Доброе утро");
    else if (hour < 18) setGreeting("Добрый день");
    else setGreeting("Добрый вечер");
  }, []);

  return (
    <div className="glass-panel p-4 md:p-6 flex items-center justify-between mb-6">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Аватар с градиентным кольцом */}
        <div className="relative">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-primary to-secondary p-[2px]">
            <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-8 h-8 md:w-12 md:h-12 text-base-content/20" />
              )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-success border-2 border-base-100 rounded-full"></div>
        </div>

        <div>
          <h1 className="text-lg md:text-3xl font-extrabold text-base-content tracking-tight leading-tight">
            {greeting}, <br className="block md:hidden" /> <span className="text-gradient-primary">{user?.name?.split(' ')[0] || "Гость"}</span>!
          </h1>
          <p className="text-xs md:text-base text-base-content/60 font-medium">Давайте посмотрим на ваши успехи ✨</p>
        </div>
      </div>

      {/* Дата (скрыта на мобильных) */}
      <div className="hidden md:block text-right">
        <div className="text-sm font-semibold text-base-content/40 uppercase tracking-widest">
          {new Date().toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;