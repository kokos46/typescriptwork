// @vitest-environment jsdom
import '../../test/setupDom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Profile from './Profile';
import authReducer from '../../slices/auth';
import documentsReducer from '../../slices/documents';
import uiReducer from '../../slices/ui';
import spreadsheetReducer from '../../slices/spreadsheet';

vi.mock('../../api/authService.ts', () => ({
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  logout: vi.fn(),
  refreshAccessToken: vi.fn(),
  clearAuthTokens: vi.fn(),
}));

const renderProfile = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      document: documentsReducer,
      ui: uiReducer,
      spreadsheet: spreadsheetReducer,
    },
    preloadedState: {
      auth: {
        username: 'user@test.com',
        user: { id: '1', email: 'user@test.com', username: 'Test' },
        status: 'authenticated',
        loginStatus: 'idle',
        error: null,
      },
      document: {
        tables: [{
          id: '1',
          name: 'T',
          active: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          N: 26,
          M: 100,
          data: {},
        }],
      },
    },
  });

  return render(
    createElement(
      Provider,
      { store },
      createElement(MemoryRouter, null, createElement(Profile))
    )
  );
};

describe('Profile', () => {
  afterEach(() => cleanup());

  it('renders user info', () => {
    renderProfile();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Профиль');
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('shows validation when name is empty', () => {
    renderProfile();
    const nameInput = screen.getByLabelText(/Новое имя/i);
    fireEvent.change(nameInput, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сменить имя' }));
    expect(screen.getByText('Имя не должно быть пустым')).toBeInTheDocument();
  });

  it('shows validation for short new password', () => {
    renderProfile();
    fireEvent.change(screen.getByLabelText(/^Новый пароль:/), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Сменить пароль' }));
    expect(
      screen.getByText('Пароль должен быть не короче 6 символов')
    ).toBeInTheDocument();
  });
});
