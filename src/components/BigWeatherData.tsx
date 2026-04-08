import axios from "axios";
import { useEffect, useState } from "react";

export default function BigWeatherData() {
    const [iconUrl, setIconUrl] = useState<string | null>(null);
    const [weatherData, setWeatherData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // 1. Сначала получаем данные о погоде
                const weatherResponse = await axios.get(
                    "https://api.openweathermap.org/data/2.5/weather?q=London&appid=c9e105eb3a612fc11557f670626ab723&units=metric"
                );

                const data = weatherResponse.data;
                setWeatherData(data);

                // 2. Получаем код иконки из ответа
                const iconCode = data.weather[0].icon; // например "10d"

                // 3. Формируем URL иконки (можно использовать прямую ссылку, без axios)
                const iconUrlString = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                setIconUrl(iconUrlString);

                // Альтернативный способ: загрузить изображение через axios как blob
                // const imageResponse = await axios.get(iconUrlString, { responseType: 'blob' });
                // const imageUrl = URL.createObjectURL(imageResponse.data);
                // setIconUrl(imageUrl);

            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div>
            <h2>{weatherData?.name}</h2>
            <p>Температура: {Math.round(weatherData?.main.temp)}°C</p>
            <p>Описание: {weatherData?.weather[0].description}</p>

            {/* Отображаем иконку */}
            {iconUrl && (
                <img
                    src={iconUrl}
                    alt={weatherData?.weather[0].description}
                    width={100}
                    height={100}
                />
            )}
        </div>
    );
}