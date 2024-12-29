/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BASE_PREFIX: string;
  readonly VITE_DATA_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
