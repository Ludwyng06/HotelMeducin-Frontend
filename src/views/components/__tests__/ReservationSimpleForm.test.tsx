import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReservationSimpleForm from '../ReservationSimpleForm';
import * as AuthContext from '../../context/AuthContext';
import * as reservationServiceModule from '../../services';
import React from 'react';

jest.mock('../../services');

const mockUser = {
  id: 1,
  email: 'marcos@gmail.com',
  role: 'user',
  firstName: 'Marcos',
  lastName: 'Pérez'
};

describe('ReservationSimpleForm integración', () => {
  beforeEach(() => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn()
    });
    (reservationServiceModule.reservationService.createReservation as jest.Mock).mockResolvedValue({ id: 123 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear una reserva exitosamente', async () => {
    render(<ReservationSimpleForm rooms={[{ id: 1, price: 100 }]} roomId="1" />);
    fireEvent.change(screen.getByLabelText(/Fecha de Entrada/i), { target: { value: '2025-06-10' } });
    fireEvent.change(screen.getByLabelText(/Fecha de Salida/i), { target: { value: '2025-06-12' } });
    fireEvent.click(screen.getByRole('button', { name: /crear reserva/i }));
    await waitFor(() => {
      expect(screen.getByText(/reserva creada con éxito/i)).toBeInTheDocument();
    });
  });
}); 