import { useEffect } from 'react';

export const useAutoLogout = (
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];

  let timer: ReturnType<typeof setTimeout> | null;

  useEffect(() => {
    Object.values(events).forEach((item) => {
      window.addEventListener(item, () => {
        resetTimer();
        handleTimer();
      });
    });
  }, []);

  const resetTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
    }
  };

  const handleTimer = () => {
    timer = setTimeout(() => {
      resetTimer();
      Object.values(events).forEach((item) => {
        window.removeEventListener(item, resetTimer);
      });
      setIsLoggedIn(false);
    }, 1200000); //  20 min
  };
};

export default useAutoLogout;
