// Script de prueba completo para verificar el perfil del usuario
// Ejecutar con: node test-complete-profile.js

const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testCompleteProfile() {
  console.log('🧪 Prueba completa del perfil de usuario...\n');

  try {
    // 1. Login
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'marlen@gmail.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login falló:', loginResponse.data.message);
      console.log('💡 Intentando con credenciales alternativas...');
      
      // Intentar con otro usuario
      const altLoginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (!altLoginResponse.data.success) {
        console.log('❌ Login alternativo también falló');
        return;
      }
      
      const token = altLoginResponse.data.data.access_token;
      console.log('✅ Login alternativo exitoso');
    } else {
      const token = loginResponse.data.data.access_token;
      console.log('✅ Login exitoso');
    }

    const token = loginResponse.data.data.access_token;

    // 2. Verificar datos del login
    console.log('\n2️⃣ Datos del login:');
    console.log('   Usuario del login:', loginResponse.data.data.user);

    // 3. Obtener perfil
    console.log('\n3️⃣ Obteniendo perfil...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Respuesta completa del perfil:');
    console.log(JSON.stringify(profileResponse.data, null, 2));

    // 4. Verificar campos específicos
    const userData = profileResponse.data.data;
    console.log('\n4️⃣ Verificación de campos:');
    console.log('   firstName:', userData.firstName, typeof userData.firstName);
    console.log('   lastName:', userData.lastName, typeof userData.lastName);
    console.log('   email:', userData.email, typeof userData.email);
    console.log('   phoneNumber:', userData.phoneNumber, typeof userData.phoneNumber);
    console.log('   role:', userData.role, typeof userData.role);

    // 5. Verificar si los campos están vacíos o undefined
    const issues = [];
    if (!userData.firstName || userData.firstName.trim() === '') {
      issues.push('firstName está vacío o undefined');
    }
    if (!userData.lastName || userData.lastName.trim() === '') {
      issues.push('lastName está vacío o undefined');
    }
    if (userData.phoneNumber === undefined || userData.phoneNumber === null) {
      issues.push('phoneNumber es undefined o null');
    }

    if (issues.length > 0) {
      console.log('\n⚠️ Problemas encontrados:');
      issues.forEach(issue => console.log('   -', issue));
    } else {
      console.log('\n🎉 ¡Todos los campos están correctos!');
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Sugerencia: Verifica las credenciales o el token JWT');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Sugerencia: Asegúrate de que el backend esté ejecutándose');
    }
  }
}

// Ejecutar las pruebas
testCompleteProfile();
