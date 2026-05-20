// @vitest-environment jsdom
import '../../test/setupDom';
import { describe, it, expect, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import RequireAuth from './RequireAuth';
import authReducer from '../../slices/auth';

const renderWithStatus = (status: 'idle' | 'loading' | 'authenticated' | 'anonymous') => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        username: '',
        user: null,
        status,
        loginStatus: 'idle',
        error: null,
      },
    },
  });

  return render(
    createElement(
      Provider,
      { store },
      createElement(
        MemoryRouter,
        null,
        createElement(
          RequireAuth,
          null,
          createElement('div', null, 'Protected content')
        )
      )
    )
  );
};

describe('RequireAuth', () => {
  afterEach(() => cleanup());

  it('shows loading for idle status', () => {
    renderWithStatus('idle');
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('shows loading for loading status', () => {
    renderWithStatus('loading');
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithStatus('authenticated');
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
