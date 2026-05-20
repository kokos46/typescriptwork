// @vitest-environment jsdom
import '../../test/setupDom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Register from './Register';
import authReducer from '../../slices/auth';
import documentsReducer from '../../slices/documents';
import uiReducer from '../../slices/ui';
import spreadsheetReducer from '../../slices/spreadsheet';

vi.mock('../../api/authService.ts', () => ({
  register: vi.fn(),
  clearAuthTokens: vi.fn(),
}));

const renderRegister = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      document: documentsReducer,
      ui: uiReducer,
      spreadsheet: spreadsheetReducer,
    },
  });

  return render(
    createElement(
      Provider,
      { store },
      createElement(MemoryRouter, null, createElement(Register))
    )
  );
};

describe('Register', () => {
  afterEach(() => cleanup());

  it('renders registration form fields', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Подтверждение пароля')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', () => {
    renderRegister();
    const form = screen.getByRole('button', { name: 'Зарегистрироваться' }).closest('form')!;
    form.noValidate = true;

    fireEvent.change(screen.getByPlaceholderText('Имя'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Подтверждение пароля'), {
      target: { value: 'password456' },
    });
    fireEvent.submit(form);

    expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
  });
});
