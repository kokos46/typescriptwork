import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate(); // Инициализируем навигатор

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.trim()) {
      navigate(`/dashboard/${inputValue}`);
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