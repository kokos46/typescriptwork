import { describe, it, expect } from 'vitest';
import { store } from './store';

describe('store', () => {
  it('exposes spreadsheet, ui, document and auth reducers', () => {
    const state = store.getState();
    expect(state).toHaveProperty('spreadsheet');
    expect(state).toHaveProperty('ui');
    expect(state).toHaveProperty('document');
    expect(state).toHaveProperty('auth');
  });

  it('dispatches slice actions', () => {
    store.dispatch({ type: 'ui/setSaving', payload: 'saved' });
    expect(store.getState().ui.saving).toBe('saved');
  });
});
