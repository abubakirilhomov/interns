import { useEffect, useRef } from "react";
import axios from "axios";

const SEND_INTERVAL_MS = 60 * 1000;

const LocationShare = () => {
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const lastPositionRef = useRef(null);

  const sendLocation = async (lat, lng) => {
    try {
      await axios.post("/locations/update", { lat, lng });
    } catch {
      // Silently ignore
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        lastPositionRef.current = { lat, lng };
        sendLocation(lat, lng);
      },
      () => {
        // Silently ignore errors (permission denied, unavailable, etc.)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    intervalRef.current = setInterval(() => {
      if (lastPositionRef.current) {
        sendLocation(lastPositionRef.current.lat, lastPositionRef.current.lng);
      }
    }, SEND_INTERVAL_MS);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
};

export default LocationShare;
