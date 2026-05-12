import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAppDispatch, useAppSelector} from "../../hooks.ts";
import {setUsername, setUserData} from "../../slices/auth.ts";
import {setLocalTables} from "../../slices/documents.ts";

export default function Auth() {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const userdat = useAppSelector((state) => state.auth.username)
  const dispatch = useAppDispatch()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = inputValue.trim();
    if (user) {


      dispatch(setUsername(user));

      console.log(userdat)

      const rawSavedData = localStorage.getItem('myTableApp_Data');
      if (rawSavedData) {
        try {
          const parsedData = JSON.parse(rawSavedData);
          const userTables = parsedData[user]?.tables || [];

          dispatch(setUserData(userTables));
          dispatch(setLocalTables(userTables));
        } catch (err) {
          console.error("Ошибка загрузки данных", err);
        }
      }

      navigate(`/dashboard/${user}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Введите юзернейм"
      />
      <button type="submit">Открыть</button>
    </form>
  );
}