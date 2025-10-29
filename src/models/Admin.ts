// Modelos de Administradores

export interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roleId: {
    _id: string;
    name: string;
    description: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UpdateAdminData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

