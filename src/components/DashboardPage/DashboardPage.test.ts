// @vitest-environment jsdom
import '../../test/setupDom';
import { describe, it, expect, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPage from './DashboardPage';
import authReducer from '../../slices/auth';
import documentsReducer from '../../slices/documents';
import uiReducer from '../../slices/ui';
import spreadsheetReducer from '../../slices/spreadsheet';
import type { TableData } from '../../slices/auth';

const table: TableData = {
  id: 'doc-1',
  name: 'Budget',
  active: false,
  created_at: '2024-06-01T00:00:00.000Z',
  updated_at: '2024-06-02T00:00:00.000Z',
  N: 26,
  M: 100,
  data: { A1: '100' },
};

const renderDashboard = () => {
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
        user: { id: '1', email: 'user@test.com' },
        status: 'authenticated',
        loginStatus: 'idle',
        error: null,
      },
      document: { tables: [table] },
    },
  });

  return render(
    createElement(
      Provider,
      { store },
      createElement(MemoryRouter, null, createElement(DashboardPage))
    )
  );
};

describe('DashboardPage', () => {
  afterEach(() => cleanup());

  it('renders username and tables', () => {
    renderDashboard();
    expect(screen.getByText(/Таблицы пользователя user@test.com/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Budget' })).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows create input when creating is enabled', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Создать новый документ' }));
    expect(screen.getByPlaceholderText('Название таблицы')).toBeInTheDocument();
  });
});
