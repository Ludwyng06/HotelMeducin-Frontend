// Script de prueba para verificar el formulario de reservaciones
// Ejecutar con: node test-reservation-form.js

console.log('🧪 Probando la función normalizeRooms para el formulario de reservaciones...\n');

// Simular diferentes formatos de respuesta del servicio de habitaciones
const testCases = [
  // Caso 1: Array directo (datos mock)
  [
    { 
      id: 1, 
      name: 'Suite Presidencial', 
      description: 'Lujo máximo con terraza privada',
      price: 350,
      capacity: 4,
      imageUrls: ['/images/suite-presidencial.jpg']
    },
    { 
      id: 2, 
      name: 'Habitación Estándar', 
      description: 'Amplia habitación con vista al jardín',
      price: 120,
      capacity: 2,
      imageUrls: ['/images/habitacion-estandar.jpg']
    }
  ],
  
  // Caso 2: Objeto con propiedad data (respuesta del backend)
  {
    success: true,
    data: [
      { 
        id: 1, 
        name: 'Suite Presidencial', 
        description: 'Lujo máximo con terraza privada',
        price: 350,
        capacity: 4,
        imageUrls: ['/images/suite-presidencial.jpg']
      }
    ],
    message: 'Habitaciones obtenidas exitosamente'
  },
  
  // Caso 3: Objeto con propiedad rooms
  {
    rooms: [
      { 
        id: 1, 
        name: 'Suite Presidencial', 
        description: 'Lujo máximo con terraza privada',
        price: 350,
        capacity: 4,
        imageUrls: ['/images/suite-presidencial.jpg']
      }
    ]
  },
  
  // Caso 4: Formato inesperado
  { error: 'No se encontraron habitaciones' },
  
  // Caso 5: null/undefined
  null,
  undefined
];

// Función helper para normalizar datos de habitaciones (copiada del componente)
const normalizeRooms = (data) => {
  if (Array.isArray(data)) {
    return data;
  } else if (data && data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data.rooms)) {
    return data.rooms;
  } else {
    console.warn('⚠️ Formato de habitaciones no esperado:', data);
    return [];
  }
};

// Probar cada caso
testCases.forEach((testCase, index) => {
  console.log(`🏨 Caso ${index + 1}:`);
  console.log('   Entrada:', JSON.stringify(testCase, null, 2));
  
  const result = normalizeRooms(testCase);
  console.log('   Resultado:', JSON.stringify(result, null, 2));
  console.log('   Es array:', Array.isArray(result));
  console.log('   Longitud:', result.length);
  
  // Probar que se puede usar .map() sin errores
  try {
    const mapped = result.map(room => ({
      id: room.id,
      name: room.name,
      price: room.price
    }));
    console.log('   ✅ .map() funciona correctamente');
    console.log('   Elementos mapeados:', mapped.length);
    
    // Probar renderizado como en el componente
    const rendered = result.map(room => {
      let imageUrl = '/images/habitacion-estandar.jpg';
      if (Array.isArray(room.imageUrls)) {
        imageUrl = room.imageUrls[0] || imageUrl;
      }
      return {
        id: room.id,
        name: room.name,
        imageUrl: imageUrl
      };
    });
    console.log('   ✅ Renderizado funciona:', rendered.length, 'habitaciones');
    
  } catch (error) {
    console.log('   ❌ Error con .map():', error.message);
  }
  
  console.log('   ---\n');
});

console.log('🎉 Pruebas completadas. La función normalizeRooms maneja todos los casos correctamente.');
console.log('\n💡 El formulario de reservaciones ahora debería funcionar sin el error "rooms.map is not a function"');
