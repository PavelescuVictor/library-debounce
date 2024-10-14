/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        setupFiles: './src/debounce.test.ts'
    }
});