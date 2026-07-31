import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly minimumVisibleDurationMs = 1000;
  private readonly pendingRequests = signal(0);
  private readonly visible = signal(false);
  private shownAt = 0;
  private hideTimeoutId?: ReturnType<typeof setTimeout>;

  public readonly isLoading = computed(() => this.visible());

  public show(): void {
    this.clearHideTimeout();

    const wasIdle = this.pendingRequests() === 0;
    this.pendingRequests.update((count) => count + 1);

    if (wasIdle) {
      this.shownAt = Date.now();
      this.visible.set(true);
    }
  }

  public hide(): void {
    if (this.pendingRequests() === 0) {
      return;
    }

    this.pendingRequests.update((count) => Math.max(count - 1, 0));

    if (this.pendingRequests() > 0) {
      return;
    }

    const elapsed = Date.now() - this.shownAt;
    const remaining = this.minimumVisibleDurationMs - elapsed;

    if (remaining <= 0) {
      this.visible.set(false);
      return;
    }

    this.hideTimeoutId = setTimeout(() => {
      this.hideTimeoutId = undefined;

      if (this.pendingRequests() === 0) {
        this.visible.set(false);
      }
    }, remaining);
  }

  public reset(): void {
    this.clearHideTimeout();
    this.pendingRequests.set(0);
    this.visible.set(false);
    this.shownAt = 0;
  }

  private clearHideTimeout(): void {
    if (!this.hideTimeoutId) {
      return;
    }

    clearTimeout(this.hideTimeoutId);
    this.hideTimeoutId = undefined;
  }
}
