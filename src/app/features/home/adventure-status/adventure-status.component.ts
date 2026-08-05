import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../core/stores/user/user.model';
import { MatButtonModule } from '@angular/material/button';

export interface AdventureCountdown {
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-adventure-status',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './adventure-status.component.html',
  styleUrl: './adventure-status.component.scss',
})
export class AdventureStatusComponent {
  @Input({ required: true }) user!: User;
  @Input() countdown: AdventureCountdown = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  @Input() isHydrating = false;

  @Output() ctaClicked = new EventEmitter<void>();

  public onCtaClick() {
    this.ctaClicked.emit();
  }
}
