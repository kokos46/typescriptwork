// @vitest-environment jsdom
import '../../test/setupDom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Auth from './Auth';
import authReducer from '../../slices/auth';
import documentsReducer from '../../slices/documents';
import uiReducer from '../../slices/ui';
import spreadsheetReducer from '../../slices/spreadsheet';

vi.mock('../../api/authService.ts', () => ({
  login: vi.fn(),
  clearAuthTokens: vi.fn(),
}));

const renderAuth = () => {
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
      createElement(MemoryRouter, null, createElement(Auth))
    )
  );
};

describe('Auth', () => {
  afterEach(() => cleanup());

  it('renders login form', () => {
    renderAuth();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', () => {
    renderAuth();
    const form = screen.getByRole('button', { name: 'Войти' }).closest('form')!;
    form.noValidate = true;

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'bad-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(form);

    expect(screen.getByText('Введите корректный email')).toBeInTheDocument();
  });

  it('shows validation error for short password', () => {
    renderAuth();
    const form = screen.getByRole('button', { name: 'Войти' }).closest('form')!;
    form.noValidate = true;

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'short' },
    });
    fireEvent.submit(form);

    expect(
      screen.getByText('Пароль должен быть не короче 8 символов')
    ).toBeInTheDocument();
  });
});
