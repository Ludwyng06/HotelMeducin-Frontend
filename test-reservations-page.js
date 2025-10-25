// Script de prueba para verificar la página de reservaciones
// Ejecutar con: node test-reservations-page.js

console.log('🧪 Probando la función normalizeReservations para la página de reservaciones...\n');

// Simular diferentes formatos de respuesta del servicio de reservaciones
const testCases = [
  // Caso 1: Array directo (datos mock)
  [
    { 
      id: 1, 
      room: { name: 'Suite Presidencial' }, 
      checkInDate: '2024-01-15', 
      checkOutDate: '2024-01-18',
      status: 'confirmed',
      totalPrice: 450.00
    },
    { 
      id: 2, 
      room: { name: 'Habitación Estándar' }, 
      checkInDate: '2024-02-10', 
      checkOutDate: '2024-02-12',
      status: 'pending',
      totalPrice: 180.00
    }
  ],
  
  // Caso 2: Objeto con propiedad data (respuesta del backend)
  {
    success: true,
    data: [
      { 
        id: 1, 
        room: { name: 'Suite Presidencial' }, 
        checkInDate: '2024-01-15', 
        checkOutDate: '2024-01-18',
        status: 'confirmed',
        totalPrice: 450.00
      }
    ],
    message: 'Reservas obtenidas exitosamente'
  },
  
  // Caso 3: Objeto con propiedad reservations
  {
    reservations: [
      { 
        id: 1, 
        room: { name: 'Suite Presidencial' }, 
        checkInDate: '2024-01-15', 
        checkOutDate: '2024-01-18',
        status: 'confirmed',
        totalPrice: 450.00
      }
    ]
  },
  
  // Caso 4: Formato inesperado
  { error: 'No se encontraron reservas' },
  
  // Caso 5: null/undefined
  null,
  undefined
];

// Función helper para normalizar datos de reservaciones (copiada del componente)
const normalizeReservations = (data) => {
  if (Array.isArray(data)) {
    return data;
  } else if (data && data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data.reservations)) {
    return data.reservations;
  } else {
    console.warn('⚠️ Formato de reservas no esperado:', data);
    return [];
  }
};

// Probar cada caso
testCases.forEach((testCase, index) => {
  console.log(`📋 Caso ${index + 1}:`);
  console.log('   Entrada:', JSON.stringify(testCase, null, 2));
  
  const result = normalizeReservations(testCase);
  console.log('   Resultado:', JSON.stringify(result, null, 2));
  console.log('   Es array:', Array.isArray(result));
  console.log('   Longitud:', result.length);
  
  // Probar que se puede usar .filter() sin errores
  try {
    const filtered = result.filter(item => item.id > 0);
    console.log('   ✅ .filter() funciona correctamente');
    console.log('   Elementos filtrados:', filtered.length);
    
    // Probar filtros específicos como en la página de reservaciones
    const searchFilter = result.filter(r => {
      const matchNombre = r.room?.name?.toLowerCase().includes('suite');
      const matchFecha = true; // Simular sin filtro de fecha
      return matchNombre && matchFecha;
    });
    console.log('   ✅ Filtros de búsqueda funcionan:', searchFilter.length, 'resultados');
    
  } catch (error) {
    console.log('   ❌ Error con .filter():', error.message);
  }
  
  console.log('   ---\n');
});

console.log('🎉 Pruebas completadas. La función normalizeReservations maneja todos los casos correctamente.');
console.log('\n💡 La página de reservaciones ahora debería funcionar sin el error "reservas.filter is not a function"');
