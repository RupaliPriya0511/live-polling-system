import { useState, useEffect } from 'react';

export const usePollTimer = (startedAt: string | null, duration: number): number => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setTimeRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = Date.now();
      const startTime = new Date(startedAt).getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      return remaining;
    };

    // Initial calculation
    const initialRemaining = calculateTimeRemaining();
    setTimeRemaining(initialRemaining);

    // If time already expired, don't start interval
    if (initialRemaining <= 0) {
      return;
    }

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, duration]);

  return timeRemaining;
};