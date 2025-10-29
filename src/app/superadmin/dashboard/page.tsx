'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { adminService } from '@services/adminService';
import type { Admin, CreateAdminData, UpdateAdminData } from '@models/Admin';
import '@styles/DashboardAdmin.css';


export default function SuperadminDashboard() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Cargar datos
  useEffect(() => {
    if (user?.role === 'superadmin') {
      loadData();
    }
  }, [user]);

  // Verificar si es superadmin
  if (user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [adminsData, dashboardData] = await Promise.all([
        adminService.getAdmins(),
        adminService.getDashboard()
      ]);
      setAdmins(adminsData);
      setDashboardData(dashboardData);
    } catch (error: any) {
      setError(error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (adminData: CreateAdminData) => {
    try {
      const newAdmin = await adminService.createAdmin(adminData);
      setAdmins([...admins, newAdmin]);
      setShowCreateForm(false);
    } catch (error: any) {
      setError(error.message || 'Error al crear administrador');
    }
  };

  const handleUpdateAdmin = async (id: string, adminData: UpdateAdminData) => {
    try {
      const updatedAdmin = await adminService.updateAdmin(id, adminData);
      setAdmins(admins.map(admin => admin._id === id ? updatedAdmin : admin));
      setEditingAdmin(null);
    } catch (error: any) {
      setError(error.message || 'Error al actualizar administrador');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este administrador?')) {
      return;
    }

    try {
      await adminService.deleteAdmin(id);
      setAdmins(admins.filter(admin => admin._id !== id));
    } catch (error: any) {
      setError(error.message || 'Error al eliminar administrador');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="dashboard-container">
          <h1>Dashboard Superadministrador</h1>
          <p>Gestiona administradores del sistema</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            + Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboardData && (
        <div className="dashboard-container">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Administradores</h3>
              <p>{dashboardData.admins}</p>
            </div>
            <div className="stat-card">
              <h3>Total Usuarios</h3>
              <p>{dashboardData.users}</p>
            </div>
            <div className="stat-card">
              <h3>Total Roles</h3>
              <p>{dashboardData.roles}</p>
            </div>
            <div className="stat-card">
              <h3>Total Sistema</h3>
              <p>{dashboardData.totalUsers}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Administradores */}
      <div className="dashboard-container">
        <h2>Lista de Administradores</h2>
        <p>Gestiona los administradores del sistema</p>
        
        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <h3 className="text-sm font-medium text-gray-900">No hay administradores</h3>
                      <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo administrador.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id}>
                    <td>
                      <div className="text-sm font-medium text-gray-900">
                        {admin.firstName} {admin.lastName}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">{admin.email}</div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">{admin.phoneNumber || 'N/A'}</div>
                    </td>
                    <td>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => setEditingAdmin(admin)}
                          className="btn-edit"
                          title="Editar administrador"
                        >
                          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className="btn-delete"
                          title="Eliminar administrador"
                        >
                          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {showCreateForm && (
        <CreateAdminModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateAdmin}
        />
      )}

      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSubmit={(data) => handleUpdateAdmin(editingAdmin._id, data)}
        />
      )}
    </div>
  );
}

// Componente para crear administrador
function CreateAdminModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: CreateAdminData) => void }) {
  const [formData, setFormData] = useState<CreateAdminData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Crear Administrador</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="form-input"
              placeholder="Ingresa el nombre"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="form-input"
              placeholder="Ingresa el apellido"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              placeholder="ejemplo@hotel.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="form-input"
              placeholder="+1234567890"
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              Crear Administrador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para editar administrador
function EditAdminModal({ admin, onClose, onSubmit }: { admin: Admin; onClose: () => void; onSubmit: (data: UpdateAdminData) => void }) {
  const [formData, setFormData] = useState<UpdateAdminData>({
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    phoneNumber: admin.phoneNumber || '',
    isActive: admin.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Editar Administrador</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="form-input"
              placeholder="Ingresa el nombre"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="form-input"
              placeholder="Ingresa el apellido"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              placeholder="ejemplo@hotel.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="form-input"
              placeholder="+1234567890"
            />
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="checkbox-input"
            />
            <label htmlFor="isActive" className="checkbox-label">Activo</label>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
