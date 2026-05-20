// @vitest-environment jsdom
import '../../test/setupDom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Table from './Table';
import authReducer from '../../slices/auth';
import documentsReducer from '../../slices/documents';
import uiReducer from '../../slices/ui';
import spreadsheetReducer from '../../slices/spreadsheet';
import type { TableData } from '../../slices/auth';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useBlocker: () => ({ state: 'unblocked', proceed: vi.fn(), reset: vi.fn() }),
  };
});

const table: TableData = {
  id: 'doc-1',
  name: 'Sheet',
  active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  N: 3,
  M: 3,
  data: { A1: 'hello' },
};

const renderTable = () => {
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
      spreadsheet: {
        ...spreadsheetReducer(undefined, { type: '@@INIT' }),
        size: { N: 3, M: 3 },
        tableData: { A1: 'hello' },
      },
    },
  });

  return render(
    createElement(
      Provider,
      { store },
      createElement(
        MemoryRouter,
        { initialEntries: ['/documents/doc-1'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/documents/:documentId',
            element: createElement(Table),
          })
        )
      )
    )
  );
};

describe('Table', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', () => true);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders spreadsheet grid with cell data', () => {
    renderTable();
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
