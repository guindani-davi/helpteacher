import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Lightweight wrapper around HttpClient that prefixes requests with the API base URL.
 * Use this in feature services to avoid repeating `environment.apiUrl` everywhere.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return this.http.get<T>(`${this.base}${path}`, { params: httpParams });
  }

  post<T>(path: string, body?: unknown) {
    return this.http.post<T>(`${this.base}${path}`, body);
  }

  patch<T>(path: string, body?: unknown) {
    return this.http.patch<T>(`${this.base}${path}`, body);
  }

  put<T>(path: string, body?: unknown) {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.base}${path}`);
  }
}
