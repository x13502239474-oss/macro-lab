/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 远端经济数据接口地址，如 https://api.example.com/macro；留空则使用静态教学数据 */
  readonly VITE_DATA_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
