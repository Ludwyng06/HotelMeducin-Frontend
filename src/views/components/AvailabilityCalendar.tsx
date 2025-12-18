'use client';
import React, { useState, useEffect } from 'react';
import { reservationService } from '@services/reservationService';
import { TemporalUtils } from '@/utils/temporal.utils';
import { Temporal } from '@js-temporal/polyfill';

interface AvailabilityCalendarProps {
  roomId: string;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  disabled?: boolean;
  key?: string | number; // Agregar key para forzar re-render cuando cambie
}

// Función helper para formatear fecha sin problemas de zona horaria
const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  // Estado para forzar re-render cuando cambie el día
  const [todayDate, setTodayDate] = useState<string>(() => TemporalUtils.formatDate(TemporalUtils.today()));

  // Actualizar la fecha de hoy periódicamente para detectar cambios de día
  useEffect(() => {
    const updateToday = () => {
      const currentToday = TemporalUtils.formatDate(TemporalUtils.today());
      if (currentToday !== todayDate) {
        console.log('📅 [Calendar] Día cambió de', todayDate, 'a', currentToday);
        setTodayDate(currentToday);
      }
    };

    // Verificar inmediatamente al montar
    updateToday();
    
    // Verificar cada minuto para detectar cambios de día
    const interval = setInterval(updateToday, 60000); // Cada minuto
    
    // También verificar cada 10 segundos para detectar cambios más rápido
    // (útil si el usuario tiene el calendario abierto durante el cambio de día)
    const fastCheck = setInterval(updateToday, 10000); // Cada 10 segundos
    
    return () => {
      clearInterval(interval);
      clearInterval(fastCheck);
    };
  }, [todayDate]);

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

  // Generar días del mes usando Temporal
  // IMPORTANTE: Usar useMemo para recalcular cuando cambien currentMonth, todayDate u occupiedDates
  const days = React.useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1; // Temporal usa meses 1-12
    const firstDay = Temporal.PlainDate.from({ year, month, day: 1 });
    const lastDay = firstDay.toPlainYearMonth().daysInMonth;
    
    // Calcular el primer día de la semana del calendario (domingo = 0)
    const firstDayOfWeek = Temporal.PlainDate.from({ year, month, day: 1 }).dayOfWeek % 7;
    const startDate = firstDay.subtract({ days: firstDayOfWeek });

    const daysArray = [];
    // IMPORTANTE: Obtener la fecha de hoy directamente usando Temporal API
    // Esto asegura que siempre tengamos la fecha correcta según la zona horaria de Bogotá
    const today = TemporalUtils.today();
    const todayString = TemporalUtils.formatDate(today);
    
    // Log SIEMPRE visible para verificar la fecha actual
    console.log(`📅 [Calendar] ===== FECHA ACTUAL (Bogotá): ${todayString} =====`);
    
    // Log para debug - verificar que estamos usando la fecha correcta
    if (todayString !== todayDate) {
      console.warn(`⚠️ [Calendar] Desincronización - Estado todayDate: ${todayDate}, Fecha real: ${todayString}`);
    }

    for (let i = 0; i < 42; i++) {
      const date = startDate.add({ days: i });
      const dateString = TemporalUtils.formatDate(date);
      
      const isCurrentMonth = date.month === month;
      // Comparar fechas: si date < today, entonces está en el pasado
      // Usar compareDates que retorna: -1 si date1 < date2, 0 si son iguales, 1 si date1 > date2
      const comparison = TemporalUtils.compareDates(date, today);
      const isPast = comparison < 0; // Solo días anteriores a hoy están en el pasado
      
      // Debug para fechas problemáticas (día 17 y 18) - SIEMPRE loguear para diagnóstico
      if (dateString === '2025-12-17' || dateString === '2025-12-18') {
        console.log(`📅 [Calendar Debug] Fecha: ${dateString}, Hoy: ${todayString}, Comparación: ${comparison}, isPast: ${isPast}, isCurrentMonth: ${isCurrentMonth}`);
        console.log(`📅 [Calendar Debug] date objeto:`, date.toString(), `today objeto:`, today.toString());
      }
      
      // También verificar si TODAS las fechas del 1-16 están marcadas como pasado
      if (isCurrentMonth && date.day <= 16) {
        if (!isPast) {
          console.warn(`⚠️ [Calendar] Fecha ${dateString} debería estar en el pasado pero isPast=${isPast}`);
        }
      }
      const isOccupied = occupiedDates.includes(dateString);
      const isSelected = selectedDate === dateString;
      const isHovered = hoveredDate === dateString;

      daysArray.push({
        date: TemporalUtils.plainDateToDate(date), // Convertir PlainDate a Date para compatibilidad
        dateString,
        dayNumber: date.day, // Usar directamente el día del PlainDate para evitar problemas de zona horaria
        isCurrentMonth,
        isPast,
        isOccupied,
        isSelected,
        isHovered
      });
    }

    return daysArray;
  }, [currentMonth, todayDate, occupiedDates, selectedDate, hoveredDate]); // Incluir todayDate para forzar recalculación cuando cambie el día

  const handleDateClick = (dateString: string, isOccupied: boolean, isPast: boolean) => {
    console.log('📅 handleDateClick - fecha:', dateString, 'ocupada:', isOccupied, 'pasada:', isPast, 'disabled:', disabled);
    
    // Debug específico para día 17
    if (dateString === '2025-12-17') {
      console.log('🔍 [Debug Día 17] Click detectado en día 17');
      console.log('🔍 [Debug Día 17] isPast:', isPast, 'isOccupied:', isOccupied, 'disabled:', disabled);
    }
    
    if (disabled || isOccupied || isPast) {
      console.log('❌ Fecha bloqueada - disabled:', disabled, 'ocupada:', isOccupied, 'pasada:', isPast);
      return;
    }
    console.log('✅ Fecha seleccionada, llamando onDateSelect con:', dateString);
    console.log('📤 [onDateSelect] Enviando fecha:', dateString, 'tipo:', typeof dateString);
    onDateSelect(dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const getDateStatus = (day: any) => {
    // IMPORTANTE: Verificar isPast primero - tiene la mayor prioridad
    if (day.isPast) {
      // Debug para día 17
      if (day.dateString === '2025-12-17') {
        console.log(`📅 [getDateStatus] Día 17 detectado como pasado - isPast: ${day.isPast}`);
      }
      return 'past';
    }
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

  // Los días ya están calculados en el useMemo arriba
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
        {days.map((day, index) => {
          // Debug para día 17
          if (day.dateString === '2025-12-17') {
            const status = getDateStatus(day);
            const style = getDateStyle(day);
            console.log(`📅 [Render] Día 17 - isPast: ${day.isPast}, status: ${status}, backgroundColor: ${style.backgroundColor}, color: ${style.color}`);
          }
          return (
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
              {day.dayNumber || day.date.getDate()}
            </div>
          );
        })}
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
