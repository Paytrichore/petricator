import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../core/stores/user/user.selectors';
import { LogoutComponent } from '../../../shared/components/logout/logout.component';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerStatusToolbarComponent } from '../player-status-toolbar/player-status-toolbar.component';
import { GlobalLoaderComponent } from '../../../shared/components/global-loader/global-loader.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
  imports: [
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    TranslateModule,
    LogoutComponent,
    PlayerStatusToolbarComponent,
    GlobalLoaderComponent,
  ]
})
export class NavComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private readonly store = inject(Store);
  user$ = this.store.select(selectUser);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  isHandset = false;
  mini = false;
  isScrolled = false;

  constructor() {
    this.isHandset$.subscribe(value => {
      this.isHandset = value;
      if (this.isHandset) {
        this.mini = false;
      }
    });
  }

  onAnyClick(event: Event, drawer: any) {
    if (!drawer) return;
    if (this.isHandset) {
      drawer.close();
    }
  }

  toggleMini() {
    this.mini = !this.mini;
  }

  onContentScroll(event: Event): void {
    this.isScrolled = (event.target as HTMLElement).scrollTop > 0;
  }

  onContentTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === 'margin-left') {
      window.dispatchEvent(new Event('petricator-nav-resized'));
    }
  }
}
