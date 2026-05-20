// @vitest-environment jsdom
import './test/setupDom';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createElement } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from './hooks';
import spreadsheetReducer from './slices/spreadsheet';
import uiReducer from './slices/ui';
import documentsReducer from './slices/documents';
import authReducer from './slices/auth';

const createTestStore = () =>
  configureStore({
    reducer: {
      spreadsheet: spreadsheetReducer,
      ui: uiReducer,
      document: documentsReducer,
      auth: authReducer,
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createTestStore();
  return createElement(Provider, { store, children });
};

describe('hooks', () => {
  it('useAppSelector reads auth state', () => {
    const { result } = renderHook(
      () => useAppSelector((state) => state.auth.status),
      { wrapper }
    );
    expect(result.current).toBe('idle');
  });

  it('useAppDispatch returns dispatch function', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    expect(typeof result.current).toBe('function');
  });
});
