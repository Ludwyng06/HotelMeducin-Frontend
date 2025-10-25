// Script de prueba para verificar el acceso al perfil
// Ejecutar con: node test-profile.js

const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testProfileAccess() {
  console.log('🧪 Iniciando pruebas del perfil de usuario...\n');

  try {
    // 1. Probar login
    console.log('1️⃣ Probando login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login exitoso:', loginResponse.data.success);
    
    const token = loginResponse.data.data.access_token;
    console.log('🔑 Token obtenido:', token ? 'Sí' : 'No');

    // 2. Probar obtener perfil
    console.log('\n2️⃣ Probando obtener perfil...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Perfil obtenido:', profileResponse.data.success);
    console.log('👤 Datos del usuario:', profileResponse.data.data);

    // 3. Probar actualizar perfil
    console.log('\n3️⃣ Probando actualizar perfil...');
    const updateResponse = await axios.put(`${API_URL}/auth/profile`, {
      firstName: 'Usuario',
      lastName: 'Actualizado',
      phoneNumber: '1234567890'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Perfil actualizado:', updateResponse.data.success);
    console.log('📝 Mensaje:', updateResponse.data.message);

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Sugerencia: Verifica que el usuario de prueba exista en la base de datos');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Sugerencia: Asegúrate de que el backend esté ejecutándose en el puerto 3000');
    }
  }
}

// Ejecutar las pruebas
testProfileAccess();
