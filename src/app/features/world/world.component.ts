import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import * as WorldActions from '../../core/stores/world/world.actions';
import { selectAllCells, selectIsConnected, selectWorldLoading } from '../../core/stores/world/world.selectors';
import { PixiMapComponent } from './pixi-map/pixi-map.component';

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [
    AsyncPipe,
    PixiMapComponent
  ],
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  cells$ = this.store.select(selectAllCells);
  loading$ = this.store.select(selectWorldLoading);
  connected$ = this.store.select(selectIsConnected);

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.store.dispatch(WorldActions.connectWs({ token }));
    }

    this.store.dispatch(WorldActions.loadSnapshot());
  }

  ngOnDestroy(): void {
    this.store.dispatch(WorldActions.disconnectWs());
  }
}
