import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActionsSubject } from '@ngrx/store';
import { Observable, Subject, combineLatest, map, startWith, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import * as WorldActions from '../../core/stores/world/world.actions';
import { selectAllCells, selectIsConnected, selectWorldError, selectWorldLoading } from '../../core/stores/world/world.selectors';
import { selectPeblobs } from '../../core/stores/peblob/peblob.selectors';
import { PeblobEntity } from '../../core/stores/peblob/peblob.model';
import { PixiMapComponent } from './pixi-map/pixi-map.component';
import { PeblobComponent } from '../../shared/components/peblob/peblob.component';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [
    AsyncPipe,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatSlideToggleModule,
    PeblobComponent,
    PixiMapComponent,
    ReactiveFormsModule
  ],
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly actionsSubject = inject(ActionsSubject);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatMenuTrigger)
  private menuTrigger?: MatMenuTrigger;

  @ViewChild('placementForm', { read: ElementRef })
  private placementForm?: ElementRef<HTMLElement>;

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private closePlacementTimeout?: ReturnType<typeof setTimeout>;

  cells$ = this.store.select(selectAllCells);
  loading$ = this.store.select(selectWorldLoading);
  connected$ = this.store.select(selectIsConnected);
  error$ = this.store.select(selectWorldError);
  peblobs$ = this.store.select(selectPeblobs);
  selectedCell: { x: number; y: number } | null = null;
  placementFormOpen = false;
  placementPending = false;
  mapZoom = 1;
  showAxes = true;
  private isDestroyed = false;
  menuPosition = { left: '0px', top: '0px' };
  placementPeblobControl = new FormControl<PeblobEntity | string>('', { nonNullable: true });
  filteredPeblobs$: Observable<PeblobEntity[]> = combineLatest([
    this.peblobs$,
    this.placementPeblobControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([peblobs, value]) => {
      const query = typeof value === 'string' ? value.toLowerCase() : value._id.toLowerCase();
      return peblobs.filter(peblob => peblob._id.toLowerCase().includes(query));
    })
  );

  constructor() {
    this.actionsSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(action => {
        if (!this.placementPending) {
          return;
        }

        if (action.type === WorldActions.placeOnCellSuccess.type) {
          this.placementPending = false;
          this.messageService.openSnackBar('Le péblob a été placé sur la carte.');
          this.cancelPlacement();
        }

        if (action.type === WorldActions.placeOnCellFailure.type) {
          this.placementPending = false;
          const error = 'error' in action && typeof action.error === 'string'
            ? action.error
            : 'Le péblob n’a pas pu être placé sur la carte.';
          this.messageService.openSnackBar(error, true);
        }
      });
  }

  selectCell(cell: { x: number; y: number; clientX: number; clientY: number }): void {
    this.selectedCell = cell;
    this.placementFormOpen = false;
    this.placementPeblobControl.reset('');
    this.menuPosition = {
      left: `${cell.clientX}px`,
      top: `${cell.clientY}px`
    };
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.menuTrigger?.openMenu();
      }
    });
  }

  openPlacementForm(): void {
    this.placementFormOpen = true;
    this.placementPeblobControl.reset('');
    this.menuTrigger?.closeMenu();
    setTimeout(() => {
      const formElement = this.placementForm?.nativeElement;
      if (!this.isDestroyed && formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  cancelPlacement(): void {
    this.menuTrigger?.closeMenu();

    const scrollContainer = this.elementRef.nativeElement.closest('.nav__content') as HTMLElement | null;
    if (!scrollContainer || scrollContainer.scrollTop === 0) {
      this.finishCancelPlacement();
      return;
    }

    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    this.closePlacementTimeout = setTimeout(() => this.finishCancelPlacement(), 250);
  }

  private finishCancelPlacement(): void {
    this.selectedCell = null;
    this.placementFormOpen = false;
    this.placementPeblobControl.reset('');
  }

  placePeblob(): void {
    const selectedPeblob = this.placementPeblobControl.value;
    if (!this.selectedCell || typeof selectedPeblob === 'string' || !selectedPeblob || this.placementPending) {
      return;
    }

    this.placementPending = true;
    this.store.dispatch(WorldActions.placeOnCell({
      x: this.selectedCell.x,
      y: this.selectedCell.y,
      peblobIds: [selectedPeblob._id]
    }));
  }

  displayPeblob(peblob: PeblobEntity | string | null): string {
    return typeof peblob === 'string' ? peblob : peblob?._id ?? '';
  }

  trackPeblob(_: number, peblob: PeblobEntity): string {
    return peblob._id;
  }

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.store.dispatch(WorldActions.connectWs({ token }));
    }

    this.store.dispatch(WorldActions.loadSnapshot());
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.closePlacementTimeout) {
      clearTimeout(this.closePlacementTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(WorldActions.disconnectWs());
  }
}
