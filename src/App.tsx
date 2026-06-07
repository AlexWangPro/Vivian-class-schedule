import React, { useEffect } from 'react';
import CalendarMain from './components/CalendarMain';
import { useStore } from './store';

export default function App() {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <CalendarMain />
    </>
  );
}

