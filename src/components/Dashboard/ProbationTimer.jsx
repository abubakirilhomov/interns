import { useState, useEffect } from "react";

const ProbationTimer = ({ user, isMobile }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!user?.createdAt || !user?.probationPeriod) return;

    const updateTimer = () => {
      const createdDate = new Date(user.createdAt);
      const endDate = new Date(createdDate);
      endDate.setMonth(endDate.getMonth() + user.probationPeriod);
      
      const now = new Date();
      const difference = endDate - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second instead of every minute

    return () => clearInterval(interval);
  }, [user?.createdAt, user?.probationPeriod]);

  return (
    <div className="bg-base-200 p-3 rounded-lg">
      <div className="text-xs text-base-content/60 mb-3 text-center">
        {isMobile ? "Испыт. срок" : "Испытательный срок"}
      </div>
      
      <div className={`grid grid-flow-col justify-center gap-2 md:gap-5 items-center text-center auto-cols-max`}>
        <div className="flex flex-col">
          <span className={`countdown font-mono ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
            <span 
              style={{"--value": timeLeft.days}} 
              aria-live="polite" 
              aria-label={`${timeLeft.days} days`}
            >
              {timeLeft.days}
            </span>
          </span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-base-content/60`}>
            {isMobile ? 'дн' : 'дни'}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className={`countdown font-mono ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
            <span 
              style={{"--value": timeLeft.hours}} 
              aria-live="polite" 
              aria-label={`${timeLeft.hours} hours`}
            >
              {timeLeft.hours}
            </span>
          </span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-base-content/60`}>
            {isMobile ? 'ч' : 'часов'}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className={`countdown font-mono ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
            <span 
              style={{"--value": timeLeft.minutes}} 
              aria-live="polite" 
              aria-label={`${timeLeft.minutes} minutes`}
            >
              {timeLeft.minutes}
            </span>
          </span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-base-content/60`}>
            {isMobile ? 'м' : 'мин'}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className={`countdown font-mono ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
            <span 
              style={{"--value": timeLeft.seconds}} 
              aria-live="polite" 
              aria-label={`${timeLeft.seconds} seconds`}
            >
              {timeLeft.seconds}
            </span>
          </span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-base-content/60`}>
            {isMobile ? 'с' : 'сек'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProbationTimer;