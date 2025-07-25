import { Component, OnDestroy } from '@angular/core';
import { map, Observable, skipWhile, Subject, takeUntil } from 'rxjs';
import { ComposedPeblob } from '../../../shared/interfaces/peblob';
import { Store } from '@ngrx/store';
import { selectPeblobs } from '../../../core/stores/peblob/peblob.selectors';
import { AsyncPipe } from '@angular/common';
import { PeblobComponent } from '../../../shared/components/peblob/peblob.component';

@Component({
  selector: 'app-collection',
  imports: [AsyncPipe, PeblobComponent],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss'
})
export class CollectionComponent implements OnDestroy {
  constructor(private store: Store) {
    this.peblobs$ = this.store.select(selectPeblobs).pipe(
      skipWhile(peblobs => peblobs.length === 0),
      map(peblobs => peblobs.map(peblob => peblob.structure) ?? []),
      takeUntil(this.destroy$),
    );
  }

  public peblobs$: Observable<ComposedPeblob[]>;
  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
