import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
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
import { selectMapPeblobs, selectPeblobs } from '../../core/stores/peblob/peblob.selectors';
import { selectUser } from '../../core/stores/user/user.selectors';
import { User } from '../../core/stores/user/user.model';
import { PeblobEntity } from '../../core/stores/peblob/peblob.model';
import { PixiMapComponent } from './pixi-map/pixi-map.component';
import { PeblobComponent } from '../../shared/components/peblob/peblob.component';
import { MessageService } from '../../services/message/message.service';
import { TooltipComponent } from '../../shared/components/tooltip/tooltip.component';
import { TranslateService } from '@ngx-translate/core';
import { WorldError, worldErrorTranslationKey } from '../../core/stores/world/world-error';

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
    ReactiveFormsModule,
    TooltipComponent
  ],
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly actionsSubject = inject(ActionsSubject);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatMenuTrigger)
  private menuTrigger?: MatMenuTrigger;

  @ViewChild('placementForm', { read: ElementRef })
  private placementForm?: ElementRef<HTMLElement>;

  @ViewChild('cellTooltip')
  private cellTooltip?: TemplateRef<unknown>;

  @ViewChild(TooltipComponent)
  private tooltip?: TooltipComponent;

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private closePlacementTimeout?: ReturnType<typeof setTimeout>;
  private currentUser?: User;

  cells$ = this.store.select(selectAllCells);
  loading$ = this.store.select(selectWorldLoading);
  connected$ = this.store.select(selectIsConnected);
  error$ = this.store.select(selectWorldError);
  peblobs$ = this.store.select(selectMapPeblobs);
  placementPeblobs$ = this.store.select(selectPeblobs);
  user$ = this.store.select(selectUser);
  selectedCell: { x: number; y: number } | null = null;
  selectedCellOccupied = false;
  placementFormOpen = false;
  placementPending = false;
  contextMenuOpen = false;
  mapZoom = 1;
  showAxes = true;
  showMyPeblobs = true;
  private isDestroyed = false;
  menuPosition = { left: '0px', top: '0px' };
  placementPeblobControl = new FormControl<PeblobEntity | string>('', { nonNullable: true });
  hasAvailablePeblob$ = combineLatest([this.placementPeblobs$, this.cells$]).pipe(
    map(([peblobs, cells]) => {
      const placedPeblobIds = new Set(cells.flatMap(cell => cell.occupants));
      return peblobs.some(peblob => !placedPeblobIds.has(peblob._id));
    })
  );
  canPlace$ = combineLatest([this.user$, this.hasAvailablePeblob$]).pipe(
    map(([user, hasAvailablePeblob]) => Boolean(user && user.actionPoints >= 2 && hasAvailablePeblob))
  );
  filteredPeblobs$: Observable<PeblobEntity[]> = combineLatest([
    this.placementPeblobs$,
    this.cells$,
    this.placementPeblobControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([peblobs, cells, value]) => {
      const query = typeof value === 'string' ? value.toLowerCase() : value.name?.toLowerCase() ?? '';
      const placedPeblobIds = new Set(cells.flatMap(cell => cell.occupants));
      return peblobs.filter(peblob =>
        !placedPeblobIds.has(peblob._id) && (peblob.name?.toLowerCase() ?? '').includes(query)
      );
    })
  );

  constructor() {
    this.actionsSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(action => {
        if (action.type === WorldActions.loadSnapshotFailure.type) {
          const error = 'error' in action
            ? action.error as WorldError
            : { code: 'WORLD_LOAD_FAILED', status: 0 } as WorldError;
          this.messageService.openSnackBar(
            this.translate.instant(worldErrorTranslationKey(error)),
            true
          );
          return;
        }

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
          const error = 'error' in action
            ? action.error as WorldError
            : { code: 'PLACEMENT_FAILED', status: 0 } as WorldError;
          this.messageService.openSnackBar(
            this.translate.instant(worldErrorTranslationKey(error)),
            true
          );
        }
      });
  }

  selectCell(cell: { x: number; y: number; occupied: boolean; clientX: number; clientY: number }): void {
    this.hideCellTooltip();
    this.selectedCell = cell;
    this.selectedCellOccupied = cell.occupied;
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
    if (this.selectedCellOccupied) {
      return;
    }

    this.hideCellTooltip();
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

  onContextMenuOpened(): void {
    this.contextMenuOpen = true;
    this.hideCellTooltip();
  }

  onContextMenuClosed(): void {
    this.contextMenuOpen = false;
    this.hideCellTooltip();
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
    this.selectedCellOccupied = false;
    this.placementFormOpen = false;
    this.placementPeblobControl.reset('');
  }

  placePeblob(): void {
    const selectedPeblob = this.placementPeblobControl.value;
    if (
      !this.selectedCell ||
      this.selectedCellOccupied ||
      typeof selectedPeblob === 'string' ||
      !selectedPeblob ||
      this.placementPending
    ) {
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
    return typeof peblob === 'string' ? peblob : peblob?.name ?? '';
  }

  selectedPlacementPeblob(): PeblobEntity | null {
    const peblob = this.placementPeblobControl.value;
    return typeof peblob === 'string' ? null : peblob;
  }

  trackPeblob(_: number, peblob: PeblobEntity): string {
    return peblob._id;
  }

  ngOnInit(): void {
    this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user ?? undefined;
    });

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
    this.hideCellTooltip();
    this.store.dispatch(WorldActions.disconnectWs());
  }

  showCellTooltip(cell: {
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    peblob?: PeblobEntity;
  }): void {
    if (this.contextMenuOpen || this.placementFormOpen) {
      return;
    }

    if (!this.cellTooltip) {
      return;
    }

    this.tooltip?.show(
      this.cellTooltip,
      {
        ...cell,
        ownerName: this.getPeblobOwnerName(cell.peblob)
      },
      { x: cell.clientX, y: cell.clientY }
    );
  }

  getPeblobOwnerName(peblob?: PeblobEntity): string {
    if (peblob?.ownerName) {
      return peblob.ownerName;
    }

    if (peblob?.userId === this.currentUser?._id) {
      return this.currentUser?.username ?? 'Propriétaire inconnu';
    }

    return 'Propriétaire inconnu';
  }

  hideCellTooltip(): void {
    this.tooltip?.hide();
  }
}
