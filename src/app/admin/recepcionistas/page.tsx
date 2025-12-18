'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import API from '@services/api';
import '@styles/DashboardAdmin.css';

interface Recepcionista {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
}

export default function RecepcionistasPage() {
  const { user } = useAuth();
  const [recepcionistas, setRecepcionistas] = useState<Recepcionista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecepcionista, setEditingRecepcionista] = useState<Recepcionista | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      loadRecepcionistas();
    }
  }, [user]);

  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const loadRecepcionistas = async () => {
    try {
      setLoading(true);
      const response = await API.get('/superadmin/recepcionistas');
      console.log('📋 Respuesta completa:', response.data);
      const recepcionistasData = response.data?.data || [];
      console.log('📋 Recepcionistas recibidos:', recepcionistasData);
      setRecepcionistas(Array.isArray(recepcionistasData) ? recepcionistasData : []);
    } catch (error: any) {
      console.error('❌ Error cargando recepcionistas:', error);
      setError(error.response?.data?.message || 'Error al cargar recepcionistas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await API.post('/superadmin/recepcionistas', formData);
      setRecepcionistas([...recepcionistas, response.data.data]);
      setShowCreateForm(false);
      setFormData({ email: '', firstName: '', lastName: '', password: '' });
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al crear recepcionista');
    }
  };

  const handleUpdate = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { password, ...updateData } = formData;
      const dataToUpdate = password ? { ...updateData, password } : updateData;
      const response = await API.patch(`/superadmin/recepcionistas/${id}`, dataToUpdate);
      setRecepcionistas(recepcionistas.map(r => r._id === id ? response.data.data : r));
      setEditingRecepcionista(null);
      setFormData({ email: '', firstName: '', lastName: '', password: '' });
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar recepcionista');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este recepcionista?')) {
      return;
    }
    try {
      await API.delete(`/superadmin/recepcionistas/${id}`);
      setRecepcionistas(recepcionistas.filter(r => r._id !== id));
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar recepcionista');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      <div className="superadmin-header">
        <div className="superadmin-header-content">
          <div>
            <h1>Gestión de Recepcionistas</h1>
            <p>Administra los recepcionistas del hotel</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            + Nuevo Recepcionista
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert" style={{ margin: '1rem 2rem', padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
          <p>{error}</p>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#002d62' }}>Crear Recepcionista</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Nombre *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Apellido *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Contraseña *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ email: '', firstName: '', lastName: '', password: '' });
                  }}
                  className="btn-secondary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#002d62',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRecepcionista && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#002d62' }}>Editar Recepcionista</h2>
            <form onSubmit={(e) => handleUpdate(editingRecepcionista._id, e)}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Nombre *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Apellido *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Nueva Contraseña (dejar vacío para no cambiar)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRecepcionista(null);
                    setFormData({ email: '', firstName: '', lastName: '', password: '' });
                  }}
                  className="btn-secondary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#002d62',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="superadmin-card superadmin-card-full">
        <h2>Lista de Recepcionistas</h2>
        {recepcionistas.length > 0 ? (
          <table className="superadmin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recepcionistas.map((recepcionista) => (
                <tr key={recepcionista._id}>
                  <td>{recepcionista.firstName} {recepcionista.lastName}</td>
                  <td>{recepcionista.email}</td>
                  <td>{recepcionista.phoneNumber || 'N/A'}</td>
                  <td>
                    <span className={`badge ${recepcionista.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                      {recepcionista.isActive !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingRecepcionista(recepcionista);
                        setFormData({
                          email: recepcionista.email,
                          firstName: recepcionista.firstName,
                          lastName: recepcionista.lastName,
                          password: ''
                        });
                      }}
                      className="btn-edit"
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(recepcionista._id)}
                      className="btn-delete"
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p>No hay recepcionistas registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}

