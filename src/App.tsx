import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = 'c9e105eb3a612fc11557f670626ab723';

function App() {
    const [city, setCity] = useState('Moscow');
    const [search, setSearch] = useState('');
    const [weatherData, setWeatherData] = useState<any>(null);
    const [pollution, setPollution] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchWeather = async (targetCity: string) => {
        setLoading(true);
        setError('');
        try {
            // 1. Геокодинг: получаем координаты города
            const geoRes = await axios.get(
                `https://api.openweathermap.org/geo/1.0/direct?q=${targetCity}&limit=1&appid=${API_KEY}`
            );

            if (geoRes.data.length === 0) throw new Error('Город не найден');
            const { lat, lon, name } = geoRes.data[0];

            // 2. Параллельные запросы к погоде и загрязнению
            const [forecastRes, pollutionRes] = await Promise.all([
                axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
                axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
            ]);

            setWeatherData({ ...forecastRes.data, name });
            setPollution(pollutionRes.data.list[0].main.aqi);
        } catch (err) {
            setError('Ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather(city);
        // Обновление каждые 3 часа (10800000 мс)
        const interval = setInterval(() => fetchWeather(city), 3 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [city]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) setCity(search);
    };

    if (loading && !weatherData) return <div className="loader">Загрузка...</div>;

    const current = weatherData?.list[0];
    const condition = current?.weather[0].main; // Для смены фона

    return (
        <div className={`app-container ${condition?.toLowerCase() || 'clear'}`}>
            <form onSubmit={handleSearch} className="search-box">
                <input
                    type="text"
                    placeholder="Введите город..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit">Поиск</button>
            </form>

            {error && <p className="error">{error}</p>}

            {weatherData && (
                <div className="weather-widget">
                    <header className="main-info">
                        <h2>{weatherData.name}</h2>
                        <div className="temp-display">
                            <h1>{Math.round(current.main.temp)}°</h1>
                            <img
                                src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`}
                                alt="icon"
                            />
                        </div>
                        <p className="description">{current.weather[0].description}</p>
                    </header>

                    <section className="details-grid">
                        <div className="detail-item">
                            <span>Humidity</span>
                            <strong>{current.main.humidity}%</strong>
                        </div>
                        <div className="detail-item">
                            <span>Wind</span>
                            <strong>{current.wind.speed} m/s</strong>
                        </div>
                        <div className="detail-item">
                            <span>Air Quality</span>
                            <strong>AQI: {pollution}</strong>
                        </div>
                    </section>

                    <div className="forecast-list">
                        {weatherData.list.filter((_: any, i: number) => i % 8 === 0).map((day: any) => (
                            <div key={day.dt} className="forecast-row">
                                <span>{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                                <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} alt="icon" />
                                <span>{Math.round(day.main.temp)}°C</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;