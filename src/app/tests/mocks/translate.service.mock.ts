import { of } from 'rxjs';

export const translateServiceMock = {
  instant: () => 'Erreur',
  get: () => of('Erreur'),
  use: () => {},
  setDefaultLang: () => {},
  onLangChange: of({ lang: 'fr' }),
  onTranslationChange: of({}),
  onDefaultLangChange: of({})
};
