
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,      // Позволяет не импортировать describe, it и т.д. в каждом файле
        environment: 'jsdom', // ВОТ ЭТА СТРОЧКА РЕШАЕТ ПРОБЛЕМУ
        // setupFiles: './src/setupTests.ts', // Опционально для расширения expect
    },
});