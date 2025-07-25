import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { userReducer } from './core/stores/user/user.reducer';
import { UserEffects } from './core/stores/user/user.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { peblobReducer } from './core/stores/peblob/peblob.reducer';
import { PeblobEffects } from './core/stores/peblob/peblob.effects';
import { appReducer } from './core/stores/app/app.reducer';
import { AuthInterceptor } from './core/interceptors.ts/auth.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor])
    ),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    provideStore({ 
      app: appReducer,
      user: userReducer,
      peblob: peblobReducer
   }),
    provideEffects([UserEffects, PeblobEffects]),
    provideStoreDevtools(),
  ]
};
