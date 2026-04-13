import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Attaches the Bearer access token to outgoing API requests.
 * Only applies to requests targeting our own backend.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();

  // Only attach token to our API and if we have one
  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
