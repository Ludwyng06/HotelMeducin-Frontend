'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestBackendPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const tests = [];

    // Test 1: Swagger docs
    try {
      const response = await axios.get('http://localhost:3000/api/docs');
      tests.push({ 
        name: 'Swagger Docs', 
        status: response.status === 200 ? 'OK' : 'FAIL',
        details: `Status: ${response.status}`
      });
    } catch (error: any) {
      tests.push({ 
        name: 'Swagger Docs', 
        status: 'FAIL',
        details: error.message
      });
    }

    // Test 2: API Health check
    try {
      const response = await axios.get('http://localhost:3000/api');
      tests.push({ 
        name: 'API Root', 
        status: response.status === 200 ? 'OK' : 'FAIL',
        details: `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`
      });
    } catch (error: any) {
      tests.push({ 
        name: 'API Root', 
        status: 'FAIL',
        details: error.message
      });
    }

    // Test 3: Reservations endpoint (sin token)
    try {
      const response = await axios.get('http://localhost:3000/api/reservations');
      tests.push({ 
        name: 'Reservations List', 
        status: response.status === 200 ? 'OK' : 'FAIL',
        details: `Status: ${response.status}, Count: ${response.data?.length || 0}`
      });
    } catch (error: any) {
      tests.push({ 
        name: 'Reservations List', 
        status: 'FAIL',
        details: error.response?.data?.message || error.message
      });
    }

    // Test 4: Token check
    const token = localStorage.getItem('token');
    tests.push({ 
      name: 'Token Present', 
      status: token ? 'OK' : 'FAIL',
      details: token ? `Token exists: ${token.substring(0, 20)}...` : 'No token found'
    });

    // Test 5: User reservations (con token si existe)
    if (token) {
      try {
        const response = await axios.get('http://localhost:3000/api/reservations/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        tests.push({ 
          name: 'User Reservations', 
          status: response.status === 200 ? 'OK' : 'FAIL',
          details: `Status: ${response.status}, Count: ${response.data?.length || 0}`
        });
      } catch (error: any) {
        tests.push({ 
          name: 'User Reservations', 
          status: 'FAIL',
          details: error.response?.data?.message || error.message
        });
      }
    }

    setResults(tests);
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test de Conexión Backend</h1>
      <p>Verificar que el backend esté funcionando correctamente</p>
      
      <button 
        onClick={testConnection}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </button>

      {results.length > 0 && (
        <div>
          <h3>Resultados:</h3>
          {results.map((test, index) => (
            <div key={index} style={{
              padding: '10px',
              margin: '5px 0',
              borderRadius: '5px',
              backgroundColor: test.status === 'OK' ? '#d4edda' : '#f8d7da',
              border: `1px solid ${test.status === 'OK' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <strong>{test.name}: </strong>
              <span style={{ color: test.status === 'OK' ? '#155724' : '#721c24' }}>
                {test.status}
              </span>
              <br />
              <small>{test.details}</small>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h4>URLs Configuradas:</h4>
        <p><strong>Backend esperado:</strong> http://localhost:3000/api</p>
        <p><strong>Swagger:</strong> http://localhost:3000/api/docs</p>
        <p><strong>Crear reserva:</strong> POST http://localhost:3000/api/reservations</p>
        <p><strong>Mis reservas:</strong> GET http://localhost:3000/api/reservations/user</p>
      </div>
    </div>
  );
}
