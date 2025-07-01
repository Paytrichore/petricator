import { Subject, Observable } from 'rxjs';

/**
 * Permet d'éviter de devoir stocker chaque observable dans
 * un array de souscription et d' y unsubcribe manuellement.
 * Ajouter le décorateur  @TakeUntilDestroy au composant ,
 * ajouter une propriété componentDestroy:() => Observable<any>
 * Utiliser avec l' opérateur takeUntil d'Rxjs : pipe(takeUntil(this.componentDestroy()))
 * Le composant doit implémenter onDestroy même vide.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function TakeUntilDestroy(constructor: Function): void {
  const originalDestroy = constructor.prototype.ngOnDestroy;

  // eslint-disable-next-line space-before-function-paren
  constructor.prototype.componentDestroy = function (): Observable<unknown> {
    this._takeUntilDestroy$ = this._takeUntilDestroy$ || new Subject();
    return this._takeUntilDestroy$.asObservable();
  };

  // eslint-disable-next-line space-before-function-paren
  constructor.prototype.ngOnDestroy = function (): void {
    if (originalDestroy && typeof originalDestroy === 'function') {
      // eslint-disable-next-line prefer-rest-params
      originalDestroy.apply(this, arguments);
    }
    if (this._takeUntilDestroy$) {
      this._takeUntilDestroy$.next(true);
      this._takeUntilDestroy$.complete();
    }
  };
}
