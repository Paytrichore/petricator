import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectUser } from '../../core/stores/user/user.selectors';
import { User } from '../../core/stores/user/user.model';
import { AsyncPipe } from '@angular/common';
import { AdventureComponent } from './adventure/adventure.component';
import { AdventureStatusComponent, AdventureCountdown } from './adventure-status/adventure-status.component';

@Component({
  selector: 'app-home',
  imports: [
    AdventureComponent,
    AdventureStatusComponent,
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  public user$!: Observable<User | null>;
  public isAdventureVisible = false;
  public countdown: AdventureCountdown = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  private countdownInterval?: ReturnType<typeof setInterval>;
  private countdownDeadline?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user$ = this.store.select(selectUser);

    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (!user?.drafted) {
          this.clearCountdown();
          this.countdown = { hours: 0, minutes: 0, seconds: 0 };
          this.cdr.detectChanges();
          return;
        }

        const nextDeadline = this.resolveDeadline(user);
        if (!nextDeadline) {
          this.clearCountdown();
          return;
        }

        const shouldRestart = !this.countdownInterval || this.countdownDeadline !== nextDeadline;
        if (shouldRestart) {
          this.startCountdown(nextDeadline);
        }
      });
  }

  ngOnDestroy(): void {
    this.clearCountdown();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public showAdventure() {
    this.isAdventureVisible = true;
  }

  private startCountdown(deadline: number) {
    this.clearCountdown();
    this.countdownDeadline = deadline;

    this.updateCountdown(deadline);
    this.countdownInterval = setInterval(() => {
      this.updateCountdown(deadline);
    }, 1000);
  }

  private resolveDeadline(user: User): number | null {
    const deadlineFromDate = Date.parse(user.nextDLA);
    if (Number.isFinite(deadlineFromDate) && deadlineFromDate > Date.now()) {
      return deadlineFromDate;
    }

    if (this.countdownInterval && this.countdownDeadline && this.countdownDeadline > Date.now()) {
      return this.countdownDeadline;
    }

    const fallbackSeconds = (user.timeUntilNextDLA.hours * 3600) + (user.timeUntilNextDLA.minutes * 60);
    if (fallbackSeconds <= 0) {
      return null;
    }

    return Date.now() + (fallbackSeconds * 1000);
  }

  private updateCountdown(deadline: number) {
    const remainingMs = Math.max(deadline - Date.now(), 0);
    const totalSeconds = Math.floor(remainingMs / 1000);

    this.countdown = {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };

    if (totalSeconds === 0) {
      this.clearCountdown();
    }

    this.cdr.detectChanges();
  }

  private clearCountdown() {
    if (!this.countdownInterval) {
      return;
    }

    clearInterval(this.countdownInterval);
    this.countdownInterval = undefined;
    this.countdownDeadline = undefined;
  }
}
