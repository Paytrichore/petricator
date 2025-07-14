import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../core/stores/user/user.selectors';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [AsyncPipe],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private readonly store = inject(Store);
  user$ = this.store.select(selectUser);
}
