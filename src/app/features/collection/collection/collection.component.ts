import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectPeblobs, selectPeblobsError, selectPeblobsLoading, selectPeblobsTotal, selectRenamingPeblobIds } from '../../../core/stores/peblob/peblob.selectors';
import { PeblobComponent } from '../../../shared/components/peblob/peblob.component';
import { BasicInputComponent } from '../../../shared/components/basic-input/basic-input.component';
import { selectUser } from '../../../core/stores/user/user.selectors';
import { User } from '../../../core/stores/user/user.model';
import * as PeblobActions from '../../../core/stores/peblob/peblob.actions';
import { PeblobEntity, PeblobStatus } from '../../../core/stores/peblob/peblob.model';
import { Tint } from '../../../shared/interfaces/peblob';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RgbValuesComponent } from '../../../shared/components/rgb-values/rgb-values.component';
import { TooltipComponent } from '../../../shared/components/tooltip/tooltip.component';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from '../../../services/message/message.service';

@Component({
  selector: 'app-collection',
  imports: [AsyncPipe, BasicInputComponent, DatePipe, MatButtonModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatPaginatorModule, MatSelectModule, MatSlideToggleModule, PeblobComponent, ReactiveFormsModule, RgbValuesComponent, TooltipComponent, TranslateModule],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss'
})
export class CollectionComponent implements OnInit, OnDestroy {
  public readonly peblobStatus = PeblobStatus;
  public rgbTextPeblobIds = new Set<string>();
  public nameControls = new Map<string, FormControl<string>>();

  constructor(private store: Store) {
    this.peblobs$ = this.store.select(selectPeblobs).pipe(
      takeUntil(this.destroy$),
    );
    this.total$ = this.store.select(selectPeblobsTotal);
    this.loading$ = this.store.select(selectPeblobsLoading);
    this.error$ = this.store.select(selectPeblobsError);
    this.renamingPeblobIds$ = this.store.select(selectRenamingPeblobIds);
  
  }

  public peblobs$: Observable<PeblobEntity[]>;
  public total$: Observable<number>;
  public loading$: Observable<boolean>;
  public error$: Observable<unknown>;
  public renamingPeblobIds$: Observable<string[]>;
  public colors = Object.values(Tint);
  public colorControl = new FormControl<Tint | ''>('');
  public sortOrderControl = new FormControl<'asc' | 'desc'>('desc', { nonNullable: true });
    public statusControl = new FormControl<PeblobStatus | ''>('', { nonNullable: true });
  public page = 1;
  public pageSize = 20;
  private userId = '';
  private destroy$ = new Subject<void>();

  @ViewChild(TooltipComponent)
  private tooltip?: TooltipComponent;

  @ViewChild('rgbTooltip')
  private rgbTooltip?: TemplateRef<unknown>;

  ngOnInit(): void {
    this.store.select(selectUser).pipe(
      filter((user): user is User => !!user && !!user._id),
      take(1)
    ).subscribe((user) => {
      this.userId = user._id;
      this.bindQueryControls(user._id);
      this.loadPage(user._id);
    });
  }

  private bindQueryControls(userId: string): void {
    this.colorControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.loadPage(userId);
    });

    this.sortOrderControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.loadPage(userId);
    });

    this.statusControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.loadPage(userId);
    });
  }

  public changePage(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPage(this.userId);
  }

  public retry(): void {
    if (this.userId) {
      this.loadPage(this.userId);
    }
  }

  private loadPage(userId: string): void {
    this.store.dispatch(PeblobActions.loadPeblobsByUserIds({
      userId,
      page: this.page,
      pageSize: this.pageSize,
      color: this.colorControl.value || undefined,
      sortOrder: this.sortOrderControl.value,
      status: this.statusControl.value || undefined,
    }));
  }

  public toggleRgbText(peblobId: string, enabled: boolean): void {
    if (enabled) {
      this.rgbTextPeblobIds.add(peblobId);
      this.hideRgbTooltip();
    } else {
      this.rgbTextPeblobIds.delete(peblobId);
    }
  }

  public isRgbTextEnabled(peblobId: string): boolean {
    return this.rgbTextPeblobIds.has(peblobId);
  }

  public getNameControl(peblob: PeblobEntity): FormControl<string> {
    let control = this.nameControls.get(peblob._id);

    if (!control) {
      control = new FormControl(peblob.name || '', { nonNullable: true });
      this.nameControls.set(peblob._id, control);
    }

    return control;
  }

  public saveName(peblob: PeblobEntity, name: string): void {
    this.store.dispatch(PeblobActions.renamePeblob({
      peblobId: peblob._id,
      name,
    }));
  }

  public showRgbTooltip(payload: { color: { r: number; g: number; b: number }; event: MouseEvent }): void {
    if (!this.rgbTooltip) {
      return;
    }

    this.tooltip?.show(
      this.rgbTooltip,
      payload.color,
      { x: payload.event.clientX, y: payload.event.clientY }
    );
  }

  public hideRgbTooltip(): void {
    this.tooltip?.hide();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.nameControls.clear();
  }
}
