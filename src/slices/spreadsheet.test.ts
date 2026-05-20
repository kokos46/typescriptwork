import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import spreadsheetReducer, {
  setTableName,
  setTableData,
  toggleCellStyle,
  recordUpdate,
  recordCellsUpdate,
  undo,
  redo,
  saveDocumentThunk,
} from './spreadsheet';

describe('spreadsheet slice', () => {
  const initial = spreadsheetReducer(undefined, { type: '@@INIT' });

  it('setTableName updates name', () => {
    const state = spreadsheetReducer(initial, setTableName('Report'));
    expect(state.tableName).toBe('Report');
  });

  it('setTableData replaces cell data', () => {
    const state = spreadsheetReducer(
      initial,
      setTableData({ A1: 'hello' })
    );
    expect(state.tableData).toEqual({ A1: 'hello' });
  });

  it('toggleCellStyle enables style when any cell lacks it', () => {
    const state = spreadsheetReducer(
      { ...initial, cellStyles: {} },
      toggleCellStyle({ cellIds: ['A1', 'B1'], style: 'bold' })
    );
    expect(state.cellStyles.A1?.bold).toBe(true);
    expect(state.cellStyles.B1?.bold).toBe(true);
  });

  it('toggleCellStyle disables style when all cells have it', () => {
    const base = {
      ...initial,
      cellStyles: { A1: { bold: true }, B1: { bold: true } },
    };
    const state = spreadsheetReducer(
      base,
      toggleCellStyle({ cellIds: ['A1', 'B1'], style: 'bold' })
    );
    expect(state.cellStyles.A1?.bold).toBe(false);
    expect(state.cellStyles.B1?.bold).toBe(false);
  });

  it('undo and redo restore cell values', () => {
    let state = spreadsheetReducer(
      { ...initial, tableData: { A1: 'new' } },
      recordUpdate({ cellId: 'A1', oldValue: 'old' })
    );

    state = spreadsheetReducer(state, undo());
    expect(state.tableData.A1).toBe('old');

    state = spreadsheetReducer(state, redo());
    expect(state.tableData.A1).toBe('new');
  });

  it('undo removes empty cells when old value was empty', () => {
    let state = spreadsheetReducer(
      { ...initial, tableData: { A1: 'x' } },
      recordUpdate({ cellId: 'A1', oldValue: '' })
    );
    state = spreadsheetReducer(state, undo());
    expect(state.tableData.A1).toBeUndefined();
  });

  it('recordCellsUpdate clears redo stack', () => {
    const withRedo = { ...initial, redoStack: [{ A1: 'x' }] };
    const state = spreadsheetReducer(
      withRedo,
      recordCellsUpdate({ B1: 'old' })
    );
    expect(state.redoStack).toEqual([]);
    expect(state.updates).toHaveLength(1);
  });

  describe('saveDocumentThunk', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('sends PATCH request on success', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const store = configureStore({
        reducer: { spreadsheet: spreadsheetReducer },
      });
      store.dispatch(setTableName('My doc'));
      store.dispatch(setTableData({ A1: '1' }));

      await store.dispatch(saveDocumentThunk('doc-1'));

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/documents/doc-1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('rejects on server error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

      const store = configureStore({
        reducer: { spreadsheet: spreadsheetReducer },
      });

      const result = await store.dispatch(saveDocumentThunk('doc-1'));
      expect(result.type).toBe('document/saveToBackend/rejected');
    });
  });
});
