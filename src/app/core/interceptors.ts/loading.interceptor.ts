import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading/loading.service';

export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router, { optional: true });
  const currentUrl = router?.url ?? '';
  const isAuthPage = isAuthRoute(currentUrl);

  if (req.context.get(SKIP_GLOBAL_LOADER) || isAuthPage) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};

function isAuthRoute(url: string): boolean {
  return url.includes('/login') || url.includes('/signup');
}
