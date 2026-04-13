export const environment = {
  production: import.meta.env['NG_APP_ENV'] === 'production',
  apiUrl: import.meta.env['NG_APP_API_URL'] ?? 'http://localhost:3000',
};
