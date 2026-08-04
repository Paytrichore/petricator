import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { hydrateUser } from './core/stores/user/user.actions';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, GlobalLoaderComponent]
})
export class AppComponent {
  constructor(private translate: TranslateService, private store: Store) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    this.store.dispatch(hydrateUser());
  }
  title = 'petricator';
}
