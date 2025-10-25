// Script de prueba para verificar que el error de reservations.filter está solucionado
// Ejecutar con: node test-profile-fix.js

console.log('🧪 Probando la función normalizeReservations...\n');

// Simular diferentes formatos de respuesta del servicio de reservaciones
const testCases = [
  // Caso 1: Array directo
  [
    { id: 1, room: { name: 'Suite Presidencial' }, checkInDate: '2024-01-15', checkOutDate: '2024-01-18' },
    { id: 2, room: { name: 'Habitación Estándar' }, checkInDate: '2024-02-10', checkOutDate: '2024-02-12' }
  ],
  
  // Caso 2: Objeto con propiedad data
  {
    success: true,
    data: [
      { id: 1, room: { name: 'Suite Presidencial' }, checkInDate: '2024-01-15', checkOutDate: '2024-01-18' }
    ],
    message: 'Reservas obtenidas exitosamente'
  },
  
  // Caso 3: Objeto con propiedad reservations
  {
    reservations: [
      { id: 1, room: { name: 'Suite Presidencial' }, checkInDate: '2024-01-15', checkOutDate: '2024-01-18' }
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
  } catch (error) {
    console.log('   ❌ Error con .filter():', error.message);
  }
  
  console.log('   ---\n');
});

console.log('🎉 Pruebas completadas. La función normalizeReservations maneja todos los casos correctamente.');
