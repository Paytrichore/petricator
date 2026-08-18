import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../../core/stores/user/user.model';
import { selectUser } from '../../../core/stores/user/user.selectors';

@Component({
  selector: 'app-player-status-toolbar',
  imports: [
    AsyncPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './player-status-toolbar.component.html',
  styleUrl: './player-status-toolbar.component.scss',
})
export class PlayerStatusToolbarComponent {
  private readonly store = inject(Store);

  readonly user$: Observable<User | null> = this.store.select(selectUser);
  readonly maxActionPoints = 10;
  @Input() canMinimize = true;
  isMinimized = false;

  get isToolbarMinimized(): boolean {
    return this.canMinimize && this.isMinimized;
  }

  toggleMinimized(): void {
    this.isMinimized = !this.isMinimized;
  }

  getProgressValue(actionPoints: number): number {
    const boundedActionPoints = Math.min(Math.max(actionPoints, 0), this.maxActionPoints);
    return (boundedActionPoints / this.maxActionPoints) * 100;
  }

  isValidDla(nextDLA: string): boolean {
    return Number.isFinite(Date.parse(nextDLA));
  }
}
