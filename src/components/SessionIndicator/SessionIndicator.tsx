'use client';

import React, { useEffect, useState } from 'react';
import { FiUser, FiCheckCircle } from 'react-icons/fi';
import '../../styles/SessionIndicator.css';

interface SessionIndicatorProps {
  userName?: string;
  userRole?: string;
}

const SessionIndicator: React.FC<SessionIndicatorProps> = ({ userName, userRole }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si hay sesión activa
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setIsVisible(true);
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="session-indicator" title="Sesión activa">
      <div className="session-indicator-content">
        <FiCheckCircle className="session-icon" />
        <div className="session-info">
          {userName && <span className="session-user">{userName}</span>}
          {userRole && <span className="session-role">{userRole}</span>}
        </div>
      </div>
      <div className="session-pulse"></div>
    </div>
  );
};

export default SessionIndicator;

