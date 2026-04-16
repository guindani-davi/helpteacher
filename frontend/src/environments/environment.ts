const apiUrl = import.meta.env['NG_APP_API_URL'] ?? 'http://localhost:3000';

export const environment = {
  production: import.meta.env['NG_APP_ENV'] === 'production',
  apiUrl: apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl,
};
