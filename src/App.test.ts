// @vitest-environment jsdom
import './test/setupDom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import authReducer from './slices/auth';
import documentsReducer from './slices/documents';
import uiReducer from './slices/ui';
import spreadsheetReducer from './slices/spreadsheet';

vi.mock('./api/authService.ts', () => ({
  refreshAccessToken: vi.fn().mockResolvedValue(null),
  clearAuthTokens: vi.fn(),
}));

const renderApp = (path = '/dashboard') => {
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
      createElement(MemoryRouter, { initialEntries: [path] }, createElement(App))
    )
  );
};

describe('App', () => {
  afterEach(() => cleanup());

  it('renders navigation links', () => {
    renderApp();
    expect(screen.getByRole('link', { name: 'Панель' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Профиль' })).toHaveAttribute('href', '/profile');
  });

  it('skips session restore on login page', async () => {
    const authService = await import('./api/authService');
    vi.mocked(authService.refreshAccessToken).mockClear();
    renderApp('/login');
    expect(authService.refreshAccessToken).not.toHaveBeenCalled();
  });
});
