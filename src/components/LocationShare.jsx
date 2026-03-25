import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapPin, MapPinOff, Loader } from "lucide-react";

const STORAGE_KEY = "locationSharing";
const SEND_INTERVAL_MS = 60 * 1000; // 60 seconds

const LocationShare = () => {
  const [status, setStatus] = useState("idle"); // "idle" | "requesting" | "active" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const lastPositionRef = useRef(null);

  const sendLocation = async (lat, lng) => {
    try {
      await axios.post("/locations/update", { lat, lng });
    } catch {
      // Silently ignore send errors — don't disrupt the user
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Геолокация не поддерживается вашим браузером");
      setStatus("error");
      return;
    }

    setStatus("requesting");
    setErrorMsg("");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        lastPositionRef.current = { lat, lng };

        if (status !== "active") {
          setStatus("active");
          localStorage.setItem(STORAGE_KEY, "true");
          // Send immediately on first fix
          sendLocation(lat, lng);
        }
      },
      (err) => {
        const messages = {
          1: "Доступ к геолокации запрещён. Разрешите в настройках браузера.",
          2: "Геолокация недоступна.",
          3: "Время ожидания геолокации истекло.",
        };
        setErrorMsg(messages[err.code] || "Ошибка геолокации");
        setStatus("error");
        localStorage.removeItem(STORAGE_KEY);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    // Interval to re-send every 60s
    intervalRef.current = setInterval(() => {
      if (lastPositionRef.current) {
        sendLocation(lastPositionRef.current.lat, lastPositionRef.current.lng);
      }
    }, SEND_INTERVAL_MS);

    setStatus("active");
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const stopSharing = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    lastPositionRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
    setStatus("idle");
    setErrorMsg("");

    try {
      await axios.delete("/locations/stop");
    } catch {
      // Ignore errors on stop
    }
  };

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") {
      startSharing();
    }

    return () => {
      // Cleanup on unmount — stop watch and interval but DON'T call /stop
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = status === "active";
  const isRequesting = status === "requesting";

  const handleToggle = () => {
    if (isActive || isRequesting) {
      stopSharing();
    } else {
      startSharing();
    }
  };

  return (
    <div className="rounded-2xl bg-base-100 border border-base-200 shadow p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isActive
                ? "bg-green-100 text-green-600"
                : status === "error"
                ? "bg-red-100 text-red-500"
                : "bg-base-200 text-base-content/50"
            }`}
          >
            {isRequesting ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : isActive ? (
              <MapPin className="w-5 h-5" />
            ) : (
              <MapPinOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-base-content">Геолокация</p>
            <p className="text-xs text-base-content/50">
              {isRequesting && "Запрос доступа..."}
              {isActive && "Активно — виден ментору"}
              {status === "idle" && "Выключено"}
              {status === "error" && "Ошибка"}
            </p>
          </div>
        </div>

        <input
          type="checkbox"
          className="toggle toggle-success"
          checked={isActive || isRequesting}
          onChange={handleToggle}
          disabled={isRequesting}
        />
      </div>

      {isActive && (
        <p className="text-xs text-base-content/40 leading-relaxed">
          Ваш ментор видит вас на карте. Геопозиция обновляется каждую минуту и автоматически исчезнет через 20 минут бездействия.
        </p>
      )}

      {status === "error" && errorMsg && (
        <p className="text-xs text-error">{errorMsg}</p>
      )}
    </div>
  );
};

export default LocationShare;
