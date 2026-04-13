/* Type declarations for @ngx-env/builder environment variables. */

declare interface Env {
  readonly NODE_ENV: string;
  /** Build-time environment: 'development' | 'production' | 'preview' */
  readonly NG_APP_ENV: string;
  /** Backend API base URL (e.g. http://localhost:3000) */
  readonly NG_APP_API_URL: string;
  [key: string]: string;
}

declare interface ImportMeta {
  readonly env: Env;
}
