import { describe, it, expect } from 'vitest';
import uiReducer, {
  setSaving,
  setContextMenu,
  setCreating,
  setRenaming,
} from './ui';

describe('ui slice', () => {
  const initial = uiReducer(undefined, { type: '@@INIT' });

  it('has correct initial state', () => {
    expect(initial).toEqual({
      saving: '',
      contextMenu: { x: 0, y: 0, visible: false },
      creating: false,
      renaming: false,
    });
  });

  it('setSaving updates saving status', () => {
    const state = uiReducer(initial, setSaving('saved'));
    expect(state.saving).toBe('saved');
  });

  it('setContextMenu updates context menu', () => {
    const menu = { x: 10, y: 20, visible: true };
    const state = uiReducer(initial, setContextMenu(menu));
    expect(state.contextMenu).toEqual(menu);
  });

  it('setCreating and setRenaming toggle flags', () => {
    let state = uiReducer(initial, setCreating(true));
    expect(state.creating).toBe(true);

    state = uiReducer(state, setRenaming(true));
    expect(state.renaming).toBe(true);
  });
});
