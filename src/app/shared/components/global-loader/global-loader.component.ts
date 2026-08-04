import { Component, OnInit, effect, signal } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { LoadingService } from '../../../core/services/loading/loading.service';
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
    this.message.set(this.getRandomMessage());
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
