import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import type {
  ApiResponse,
  AuthTokensResponse,
  CreateUserBody,
  LoginBody,
  RefreshTokenBody,
  RequestPasswordResetBody,
  ResetPasswordBody,
  SafeUser,
} from '@help-teacher/shared';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../../environments/environment';

const REFRESH_TOKEN_KEY = 'ht_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  /** In-memory access token — never persisted to disk. */
  private readonly _accessToken = signal<string | null>(null);
  readonly accessToken = this._accessToken.asReadonly();

  /** Current authenticated user. */
  private readonly _user = signal<SafeUser | null>(null);
  readonly user = this._user.asReadonly();

  /** Whether a refresh is currently in-flight (prevents parallel refresh calls). */
  private _isRefreshing = false;
  private readonly _refreshDone$ = new BehaviorSubject<boolean>(false);

  /** Computed convenience state. */
  readonly isAuthenticated = computed(() => !!this._accessToken());
  readonly isInitialized = signal(false);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  login(body: LoginBody): Observable<ApiResponse<AuthTokensResponse>> {
    return this.http
      .post<ApiResponse<AuthTokensResponse>>(`${environment.apiUrl}/auth/login`, body)
      .pipe(tap((res) => this.handleTokens(res.data)));
  }

  register(body: CreateUserBody): Observable<ApiResponse<SafeUser>> {
    return this.http.post<ApiResponse<SafeUser>>(`${environment.apiUrl}/users`, body);
  }

  requestPasswordReset(body: RequestPasswordResetBody): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${environment.apiUrl}/auth/request-password-reset`,
      body,
    );
  }

  resetPassword(body: ResetPasswordBody): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/auth/reset-password`, body);
  }

  fetchMe(): Observable<ApiResponse<SafeUser>> {
    return this.http
      .get<ApiResponse<SafeUser>>(`${environment.apiUrl}/users/me`)
      .pipe(tap((res) => this._user.set(res.data)));
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(`${environment.apiUrl}/auth/logout`, { refreshToken } satisfies RefreshTokenBody)
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.clearSession();
    this.router.navigateByUrl('/login');
  }

  /**
   * Attempt to restore the session from a persisted refresh token.
   * Called once at app startup.
   */
  tryRestoreSession(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.isInitialized.set(true);
      return of(false);
    }

    return this.refreshTokens(refreshToken).pipe(
      switchMap(() => this.fetchMe()),
      tap(() => this.isInitialized.set(true)),
      switchMap(() => of(true)),
      catchError(() => {
        this.clearSession();
        this.isInitialized.set(true);
        return of(false);
      }),
    );
  }

  /**
   * Called by the refresh interceptor when a 401 is encountered.
   * Returns an Observable that emits when new tokens are available.
   */
  handleRefreshOnUnauthorized(): Observable<string> {
    if (this._isRefreshing) {
      // Another refresh is already in-flight — wait for it.
      return this._refreshDone$.pipe(
        filter((done) => done),
        take(1),
        switchMap(() => {
          const token = this._accessToken();
          return token ? of(token) : throwError(() => new Error('Refresh failed'));
        }),
      );
    }

    this._isRefreshing = true;
    this._refreshDone$.next(false);

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token'));
    }

    return this.refreshTokens(refreshToken).pipe(
      tap(() => {
        this._isRefreshing = false;
        this._refreshDone$.next(true);
      }),
      switchMap(() => {
        const token = this._accessToken();
        return token ? of(token) : throwError(() => new Error('Refresh failed'));
      }),
      catchError((err) => {
        this._isRefreshing = false;
        this._refreshDone$.next(true);
        this.clearSession();
        this.router.navigateByUrl('/login');
        return throwError(() => err);
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private refreshTokens(refreshToken: string): Observable<ApiResponse<AuthTokensResponse>> {
    return this.http
      .post<ApiResponse<AuthTokensResponse>>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      } satisfies RefreshTokenBody)
      .pipe(tap((res) => this.handleTokens(res.data)));
  }

  private handleTokens(tokens: AuthTokensResponse): void {
    this._accessToken.set(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
    this.removeRefreshToken();
  }

  private getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  private removeRefreshToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
