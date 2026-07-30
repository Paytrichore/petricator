import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, map, Observable, skipWhile, Subject, take, takeUntil } from 'rxjs';
import { ComposedPeblob } from '../../../shared/interfaces/peblob';
import { Store } from '@ngrx/store';
import { selectPeblobs } from '../../../core/stores/peblob/peblob.selectors';
import { AsyncPipe } from '@angular/common';
import { PeblobComponent } from '../../../shared/components/peblob/peblob.component';
import { selectUser } from '../../../core/stores/user/user.selectors';
import { User } from '../../../core/stores/user/user.model';
import * as PeblobActions from '../../../core/stores/peblob/peblob.actions';

@Component({
  selector: 'app-collection',
  imports: [AsyncPipe, PeblobComponent],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss'
})
export class CollectionComponent implements OnInit, OnDestroy {
  constructor(private store: Store) {
    this.peblobs$ = this.store.select(selectPeblobs).pipe(
      skipWhile(peblobs => peblobs.length === 0),
      map(peblobs => peblobs.map(peblob => peblob.structure) ?? []),
      takeUntil(this.destroy$),
    );
  }

  public peblobs$: Observable<ComposedPeblob[]>;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.store.select(selectUser).pipe(
      filter((user): user is User => !!user && !!user._id),
      take(1)
    ).subscribe((user) => {
      this.store.dispatch(PeblobActions.loadPeblobsByUserIds({ userId: user._id }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
