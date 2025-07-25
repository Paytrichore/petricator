import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { sequencedFadeInAnimation } from '../../animations/sequenced-fade-in.animation';

@Component({
  selector: 'app-action-checked',
  imports: [MatIconModule],
  templateUrl: './action-checked.component.html',
  styleUrl: './action-checked.component.scss',
  animations: [
    sequencedFadeInAnimation('.action-checked__icon', '.action-checked__message')
  ]
})
export class ActionCheckedComponent {}
