import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {useAppDispatch, useAppSelector} from "../../hooks.ts";
import {setUsername} from "../../slices/auth.ts";
import {setLocalTables} from "../../slices/documents.ts";

export default function Auth({children}: {children: React.ReactNode}) {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch()

  const username = useAppSelector((state) => state.auth.username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = inputValue.trim();

    if (user) {
      document.cookie = `username=${user}`;
      dispatch(setUsername(user));

      navigate(`/dashboard`);
    }
  };

  const loadTablesForUser = (user: string) => {
    const rawSavedData = localStorage.getItem('myTableApp_Data');

    if (rawSavedData) {
      try {
        const parsedData = JSON.parse(rawSavedData);
        const userTables = parsedData[user]?.tables || [];

        dispatch(setLocalTables(userTables));
      } catch (err) {
        console.error("Ошибка загрузки данных", err);
        dispatch(setLocalTables([]));
      }
    } else {
      dispatch(setLocalTables([]));
    }
  };

  useEffect(() => {
    if (username) {
      loadTablesForUser(username);
    }
  }, [username]);

  if (username) {
    return children;
  }

  return (
    <div className="auth">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Введите юзернейм"
        />
        <button type="submit">Авторизоваться</button>
      </form>
    </div>
  );
}