'use client';

import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../ThemeProvider/ThemeProvider';
import '../../styles/ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  // Los hooks deben llamarse siempre en el mismo orden
  const { theme, toggleTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // No renderizar hasta que esté montado para evitar problemas de hidratación
  if (!mounted) {
    return null; // Evitar hidration mismatch
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
      title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        <FiMoon className="theme-icon" />
      ) : (
        <FiSun className="theme-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;

