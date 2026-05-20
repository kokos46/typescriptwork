import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { autosaveMiddleware } from './autosave';
import spreadsheetReducer, { setTableData, setCurrentTableIndex } from '../slices/spreadsheet';
import documentsReducer, { setLocalTables } from '../slices/documents';
import authReducer from '../slices/auth';
import uiReducer, { setSaving } from '../slices/ui';
import type { TableData } from '../slices/auth';
import { loginUser } from '../slices/auth';
import { createLocalStorageMock } from '../test/localStorageMock';

vi.mock('../slices/spreadsheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../slices/spreadsheet')>();
  return {
    ...actual,
    saveDocumentThunk: vi.fn(() => () => ({
      type: 'document/saveToBackend/fulfilled',
    })),
  };
});

const table: TableData = {
  id: 'doc-1',
  name: 'Sheet',
  active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  N: 26,
  M: 100,
  data: {},
};

describe('autosaveMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const createStoreWithAutosave = () =>
    configureStore({
      reducer: {
        spreadsheet: spreadsheetReducer,
        document: documentsReducer,
        auth: authReducer,
        ui: uiReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(autosaveMiddleware),
    });

  it('dispatches saving and sync when spreadsheet changes', async () => {
    const store = createStoreWithAutosave();

    store.dispatch({
      type: loginUser.fulfilled.type,
      payload: {
        access_token: 'token',
        user: { id: '1', email: 'user@test.com' },
      },
    });

    store.dispatch(setLocalTables([table]));
    store.dispatch(setCurrentTableIndex(0));
    store.dispatch(setTableData({ A1: 'value' }));

    await vi.advanceTimersByTimeAsync(500);

    expect(store.getState().ui.saving).toMatch(/saved|saving|error/);
  });

  it('does not save without username', async () => {
    const store = createStoreWithAutosave();
    store.dispatch(setLocalTables([table]));
    store.dispatch(setCurrentTableIndex(0));
    store.dispatch(setTableData({ A1: 'x' }));

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    await vi.advanceTimersByTimeAsync(500);

    const savingCalls = dispatchSpy.mock.calls.filter(
      ([action]) =>
        typeof action === 'object' &&
        action !== null &&
        'type' in action &&
        (action as { type: string }).type === setSaving.type
    );
    expect(savingCalls.length).toBe(0);
  });
});
