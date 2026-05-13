import { type Middleware } from '@reduxjs/toolkit';
import {saveDocumentThunk} from '../slices/spreadsheet';
import { updateDocumentsAndSync } from '../slices/documents';
import {setSaving} from "../slices/ui.ts";
import type { TableData } from "../slices/auth.ts";

interface LocalSpreadsheetState {
  currentTableIndex: number | null;
  currentDocumentId: string | null;
  tableData: Record<string, string>;
  tableName: string;
  size: { N: number; M: number };
}

interface EssentialState {
  spreadsheet: LocalSpreadsheetState;
  auth: { username: string };
  document: { tables: TableData[] };
}

const AUTOSAVE_INTERVAL = 500;

export const autosaveMiddleware: Middleware<object, EssentialState> = (store) => {
  let lastSavedSnapshot = "";
  let isSaving = false;

  setInterval(() => {
    const state = store.getState();

    const {
      currentTableIndex,
      currentDocumentId,
      tableData,
      tableName,
      size
    } = state.spreadsheet;

    const { username } = state.auth;
    const { tables } = state.document;

    if (!username || currentTableIndex === null || !tables[currentTableIndex]) {
      return;
    }

    const currentSnapshot = JSON.stringify({
      currentTableIndex,
      currentDocumentId,
      tableName,
      tableData,
      size
    });

    if (currentSnapshot === lastSavedSnapshot || isSaving) {
      return;
    }

    const updatedTable = {
      ...tables[currentTableIndex],
      name: tableName || tables[currentTableIndex].name,
      data: tableData,
      N: size.N,
      M: size.M,
      updated_at: new Date().toISOString()
    };

    const newTables = tables.map((table, index) =>
      index === currentTableIndex ? updatedTable : table
    );

    isSaving = true;
    store.dispatch(setSaving('saving'));

    const saveToServer = currentDocumentId
      ? store.dispatch(saveDocumentThunk(currentDocumentId, {}) as never)
      : Promise.resolve({ type: 'document/saveToBackend/skipped' });

    Promise.resolve(saveToServer)
      .then((result) => {
        const action = result as { type?: string };

        if (currentDocumentId && !action.type?.endsWith('/fulfilled')) {
          throw new Error('Server save failed');
        }

        store.dispatch(updateDocumentsAndSync({
          newTables,
          username
        }) as never);

        lastSavedSnapshot = currentSnapshot;
        store.dispatch(setSaving('saved'));
      })
      .catch(() => {
        store.dispatch(setSaving('error'));
      })
      .finally(() => {
        isSaving = false;
      });
  }, AUTOSAVE_INTERVAL);

  return (next) => (action) => {
    return next(action);
  };
};