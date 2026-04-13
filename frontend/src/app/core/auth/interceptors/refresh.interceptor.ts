import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Endpoints that should NOT trigger a token refresh on 401. */
const SKIP_REFRESH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout', '/users'];

/**
 * Intercepts 401 responses and attempts a silent token refresh.
 * If the refresh succeeds, the original request is retried with the new token.
 */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        !req.url.startsWith(environment.apiUrl) ||
        SKIP_REFRESH_URLS.some((url) => req.url.includes(url))
      ) {
        return throwError(() => error);
      }

      return auth.handleRefreshOnUnauthorized().pipe(
        switchMap((newToken) => {
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retryReq);
        }),
      );
    }),
  );
};
