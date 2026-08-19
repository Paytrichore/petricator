import { Component, DestroyRef, OnInit, effect, inject, signal } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { selectMapPeblobsLoading } from '../../../core/stores/peblob/peblob.selectors';
import { Store } from '@ngrx/store';
import loadingData from '../../../../assets/i18n/loading-fr.json';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss',
  animations: [
    trigger('loaderAnimation', [
      transition(':leave', [
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ transform: 'translateY(100px)', opacity: 0 })
        )
      ])
    ])
  ]
})
export class GlobalLoaderComponent implements OnInit {
  public message = signal('');
  public isAuthenticatedRoute = signal(false);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store);
  public readonly mapPeblobsLoading = this.store.selectSignal(selectMapPeblobsLoading);

  constructor(
    public loadingService: LoadingService,
  ) {
    effect(() => {
      if (this.loadingService.isLoading()) {
        this.message.set(this.getRandomMessage());
      }
    });
  }

  public ngOnInit(): void {
    this.isAuthenticatedRoute.set(this.isAuthenticatedUrl(this.router.url));
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(event => this.isAuthenticatedRoute.set(this.isAuthenticatedUrl(event.urlAfterRedirects)));

    this.message.set(this.getRandomMessage());
  }

  private isAuthenticatedUrl(url: string): boolean {
    return !url.startsWith('/login') && !url.startsWith('/signup');
  }

  private getRandomMessage(): string {
    const messages = loadingData.globalLoader.messages as string[];
    if (!Array.isArray(messages) || messages.length === 0) {
      return 'Chargement en cours...';
    }

    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }
}
