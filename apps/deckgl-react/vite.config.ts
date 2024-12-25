import {defineConfig, loadEnv} from 'vite';
import path from 'path';
import process from 'process';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({command, mode, isPreview}) => {
  console.log(`command: ${command}, mode: ${mode}, isPreview: ${isPreview}`);
  const rootDir = '../../';
  process.env = {...process.env, ...loadEnv(mode, path.resolve(process.cwd(), rootDir))};
  return {
    plugins: [react()],
    envDir: rootDir,
    base: `${process.env.VITE_BASE_PREFIX}/`,
    server: {
      open: true
    },
    build: {
      outDir: '../../dist'
    },
    preview: {
      open: true
    }
  };
});
