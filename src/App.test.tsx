import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, Mocked } from 'vitest';
import axios from 'axios';
import App from './App.tsx';

vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

describe('Weather App', () => {
    it('renders weather data after successful fetch', async () => {
        // ответ геокодинга
        mockedAxios.get.mockResolvedValueOnce({ data: [{ lat: 55, lon: 37, name: 'Moscow' }] });
        // ответ погоды
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                list: [{ main: { temp: 25, humidity: 50 }, weather: [{ main: 'Clear', icon: '01d' }], wind: { speed: 5 } }]
            }
        });
        // Мокаем ответ загрязнения
        mockedAxios.get.mockResolvedValueOnce({ data: { list: [{ main: { aqi: 1 } }] } });

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Moscow')).toBeDefined();
            expect(screen.getByText('25°')).toBeDefined();
        });
    });
});