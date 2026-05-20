import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import documentsReducer, {
  setLocalTables,
  clearDocuments,
  setActiveTable,
  createTable,
  duplicateTable,
  renameTable,
  deleteTable,
  setTableData,
  updateDocumentsAndSync,
} from './documents';
import type { TableData } from './auth';
import { createLocalStorageMock } from '../test/localStorageMock';

const makeTable = (overrides: Partial<TableData> = {}): TableData => ({
  id: 'id-1',
  name: 'Table1',
  active: false,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  N: 26,
  M: 100,
  data: {},
  ...overrides,
});

describe('documents slice', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
    vi.stubGlobal('crypto', {
      randomUUID: () => 'new-uuid',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('setLocalTables replaces tables', () => {
    const tables = [makeTable()];
    const state = documentsReducer({ tables: [] }, setLocalTables(tables));
    expect(state.tables).toEqual(tables);
  });

  it('clearDocuments empties tables', () => {
    const state = documentsReducer(
      { tables: [makeTable()] },
      clearDocuments()
    );
    expect(state.tables).toEqual([]);
  });

  it('setActiveTable toggles active flag by name', () => {
    const state = documentsReducer(
      { tables: [makeTable({ name: 'A', active: false })] },
      setActiveTable({ name: 'A', active: true })
    );
    expect(state.tables[0].active).toBe(true);
  });

  it('createTable adds new table', () => {
    const state = documentsReducer({ tables: [] }, createTable('New'));
    expect(state.tables).toHaveLength(1);
    expect(state.tables[0].name).toBe('New');
    expect(state.tables[0].id).toBe('new-uuid');
  });

  it('duplicateTable clones table with new id', () => {
    const source = makeTable({ name: 'Source' });
    const state = documentsReducer(
      { tables: [] },
      duplicateTable({
        name: source.name,
        active: source.active,
        created_at: source.created_at,
        updated_at: source.updated_at,
        N: source.N,
        M: source.M,
        data: source.data,
      })
    );
    expect(state.tables[0].id).toBe('new-uuid');
    expect(state.tables[0].name).toBe('Source');
  });

  it('renameTable updates name', () => {
    const state = documentsReducer(
      { tables: [makeTable({ name: 'Old' })] },
      renameTable({ name: 'Old', newName: 'New' })
    );
    expect(state.tables[0].name).toBe('New');
  });

  it('deleteTable removes by name', () => {
    const state = documentsReducer(
      { tables: [makeTable({ name: 'Remove' })] },
      deleteTable('Remove')
    );
    expect(state.tables).toHaveLength(0);
  });

  it('setTableData updates data for matching table', () => {
    const state = documentsReducer(
      { tables: [makeTable({ name: 'T', data: {} })] },
      setTableData({ name: 'T', data: { A1: '1' } })
    );
    expect(state.tables[0].data).toEqual({ A1: '1' });
  });

  it('updateDocumentsAndSync writes to localStorage', async () => {
    const tables = [makeTable()];
    const store = configureStore({ reducer: { documents: documentsReducer } });

    await store.dispatch(
      updateDocumentsAndSync({ newTables: tables, username: 'user@test.com' })
    );

    const stored = JSON.parse(localStorage.getItem('myTableApp_Data') || '{}');
    expect(stored['user@test.com'].tables).toEqual(tables);
    expect(store.getState().documents.tables).toEqual(tables);
  });
});
