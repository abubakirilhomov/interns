import { useState, useEffect } from "react";
import GradeBadge from "../UI/GradesBadge";

const DashboardHeader = ({ user }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-base-content">
          {isMobile ? `Привет, ${user?.name?.split(' ')[0] || "Гость"}!` : `Добро пожаловать, ${user?.name || "Гость"}!`}
        </h1>
        <p className="text-sm md:text-base text-base-content/70 mt-1">
          {isMobile ? "Ваш прогресс" : "Вот ваш прогресс на сегодня"}
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;