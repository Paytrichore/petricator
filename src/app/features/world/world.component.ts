import { Component, OnDestroy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import * as WorldActions from '../../core/stores/world/world.actions';
import { selectAllCells, selectIsConnected, selectWorldLoading } from '../../core/stores/world/world.selectors';
import { Cell } from '../../shared/interfaces/world.interface';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent implements OnDestroy {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  cells$ = this.store.select(selectAllCells);
  loading$ = this.store.select(selectWorldLoading);
  connected$ = this.store.select(selectIsConnected);

  cellUpdateForm = this.fb.group({
    x: [0, Validators.required],
    y: [0, Validators.required],
    occupants: ['']
  });

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSnapshot(): void {
    this.store.dispatch(WorldActions.loadSnapshot());
  }

  connectWs(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.store.dispatch(WorldActions.connectWs({ token }));
    }
  }

  disconnectWs(): void {
    this.store.dispatch(WorldActions.disconnectWs());
  }

  // Simulates a `cell:update` WebSocket push, for testing the reducer merge without a live backend event.
  simulateCellUpdate(): void {
    if (this.cellUpdateForm.invalid) {
      return;
    }

    const { x, y, occupants } = this.cellUpdateForm.getRawValue();
    const now = new Date().toISOString();
    const cell: Cell = {
      _id: `${x}_${y}`,
      x: x ?? 0,
      y: y ?? 0,
      occupants: (occupants ?? '').split(',').map((o) => o.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now
    };

    this.store.dispatch(WorldActions.cellUpdated({ cell }));
  }
}
