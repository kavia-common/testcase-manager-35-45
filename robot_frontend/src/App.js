import React, { useEffect, useState } from 'react';
import './App.css';
import './index.css';
import AppRouter from './router';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root App component providing theme and layout base classes.
   * Applies Ocean Professional theme via CSS variables.
   */
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={`App theme-${theme}`}>
      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title="Toggle theme"
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <AppRouter />
    </div>
  );
}

export default App;
