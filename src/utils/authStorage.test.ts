import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadTablesForUser } from './authStorage';
import { createLocalStorageMock } from '../test/localStorageMock';

const STORAGE_KEY = 'myTableApp_Data';

describe('authStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns empty array when storage is empty', () => {
    expect(loadTablesForUser('user@example.com')).toEqual([]);
  });

  it('returns tables for user', () => {
    const tables = [{ id: '1', name: 'Sheet1' }];
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 'user@example.com': { tables } })
    );

    expect(loadTablesForUser('user@example.com')).toEqual(tables);
  });

  it('returns empty array for unknown user', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ other: { tables: [{ id: '1' }] } })
    );

    expect(loadTablesForUser('user@example.com')).toEqual([]);
  });

  it('returns empty array on invalid JSON', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(STORAGE_KEY, 'not-json');

    expect(loadTablesForUser('user@example.com')).toEqual([]);
    expect(spy).toHaveBeenCalled();
  });
});
