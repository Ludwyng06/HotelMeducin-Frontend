'use client';
import React, { useState, useEffect } from 'react';
import { reservationService } from '@services/reservationService';

interface AvailabilityCalendarProps {
  roomId: string;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  disabled?: boolean;
}

export default function AvailabilityCalendar({ 
  roomId, 
  onDateSelect, 
  selectedDate, 
  disabled = false 
}: AvailabilityCalendarProps) {
  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Cargar fechas ocupadas
  useEffect(() => {
    const loadOccupiedDates = async () => {
      if (!roomId) return;
      
      setLoading(true);
      try {
        const dates = await reservationService.getOccupiedDates(roomId);
        setOccupiedDates(dates);
        console.log('📅 Fechas ocupadas cargadas:', dates);
      } catch (error) {
        console.error('Error al cargar fechas ocupadas:', error);
        setOccupiedDates([]);
      } finally {
        setLoading(false);
      }
    };

    loadOccupiedDates();
  }, [roomId]);

  // Generar días del mes
  const generateDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < today;
      const isOccupied = occupiedDates.includes(dateString);
      const isSelected = selectedDate === dateString;
      const isHovered = hoveredDate === dateString;

      days.push({
        date,
        dateString,
        isCurrentMonth,
        isPast,
        isOccupied,
        isSelected,
        isHovered
      });
    }

    return days;
  };

  const handleDateClick = (dateString: string, isOccupied: boolean, isPast: boolean) => {
    if (disabled || isOccupied || isPast) return;
    onDateSelect(dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const getDateStatus = (day: any) => {
    if (day.isPast) return 'past';
    if (day.isOccupied) return 'occupied';
    if (day.isSelected) return 'selected';
    if (day.isHovered) return 'hovered';
    return 'available';
  };

  const getDateStyle = (day: any) => {
    const status = getDateStatus(day);
    const baseStyle = {
      padding: '0.5rem',
      textAlign: 'center' as const,
      cursor: disabled || day.isPast || day.isOccupied ? 'not-allowed' : 'pointer',
      borderRadius: '6px',
      transition: 'all 0.2s',
      fontWeight: '500',
      fontSize: '0.9rem',
      border: '1px solid transparent',
      opacity: day.isCurrentMonth ? 1 : 0.3
    };

    switch (status) {
      case 'past':
        return {
          ...baseStyle,
          backgroundColor: '#f7fafc',
          color: '#a0aec0',
          cursor: 'not-allowed'
        };
      case 'occupied':
        return {
          ...baseStyle,
          backgroundColor: '#fed7d7',
          color: '#c53030',
          cursor: 'not-allowed',
          border: '1px solid #feb2b2'
        };
      case 'selected':
        return {
          ...baseStyle,
          backgroundColor: '#3182ce',
          color: 'white',
          border: '1px solid #2c5aa0'
        };
      case 'hovered':
        return {
          ...baseStyle,
          backgroundColor: '#bee3f8',
          color: '#2b6cb0',
          border: '1px solid #90cdf4'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f0fff4',
          color: '#22543d',
          border: '1px solid #9ae6b4'
        };
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#4a5568'
      }}>
        Cargando disponibilidad...
      </div>
    );
  }

  const days = generateDays();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Header del calendario */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <button
          onClick={() => navigateMonth('prev')}
          style={{
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
        >
          ‹
        </button>
        
        <h3 style={{
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#2d3748'
        }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          style={{
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
        >
          ›
        </button>
      </div>

      {/* Días de la semana */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
        marginBottom: '0.5rem'
      }}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} style={{
            padding: '0.5rem',
            textAlign: 'center',
            fontWeight: '600',
            color: '#4a5568',
            fontSize: '0.9rem'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem'
      }}>
        {days.map((day, index) => (
          <div
            key={index}
            style={getDateStyle(day)}
            onClick={() => handleDateClick(day.dateString, day.isOccupied, day.isPast)}
            onMouseEnter={() => setHoveredDate(day.dateString)}
            onMouseLeave={() => setHoveredDate(null)}
            title={
              day.isOccupied ? 'Ocupado' :
              day.isPast ? 'Fecha pasada' :
              'Disponible'
            }
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div style={{
        marginTop: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#f0fff4',
            border: '1px solid #9ae6b4',
            borderRadius: '3px'
          }}></div>
          <span>Disponible</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#fed7d7',
            border: '1px solid #feb2b2',
            borderRadius: '3px'
          }}></div>
          <span>Ocupado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '3px'
          }}></div>
          <span>Pasado</span>
        </div>
      </div>
    </div>
  );
}
