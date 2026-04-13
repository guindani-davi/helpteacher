import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * APP_INITIALIZER factory that restores the user session on app startup.
 * Only runs in the browser (no-op during SSG prerendering).
 */
export function initializeAuth(): () => Promise<void> {
  const auth = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  return async () => {
    if (!isPlatformBrowser(platformId)) {
      auth.isInitialized.set(true);
      return;
    }

    await firstValueFrom(auth.tryRestoreSession());
  };
}
