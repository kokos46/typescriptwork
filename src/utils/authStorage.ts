import type {TableData} from "../slices/auth.ts";

const STORAGE_KEY = 'myTableApp_Data';

export const loadTablesForUser = (user: string): TableData[] => {
  const rawSavedData = localStorage.getItem(STORAGE_KEY);

  if (!rawSavedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(rawSavedData);
    return parsedData[user]?.tables || [];
  } catch (err) {
    console.error("Ошибка загрузки данных", err);
    return [];
  }
};
