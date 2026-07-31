import { Component, OnInit, effect } from '@angular/core';
import { LoadingService } from '../../../core/services/loading/loading.service';
import loadingData from '../../../../assets/i18n/loading-fr.json';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss',
})
export class GlobalLoaderComponent implements OnInit {
  public message = '';

  constructor(
    public loadingService: LoadingService,
  ) {
    effect(() => {
      if (this.loadingService.isLoading() && this.message === '') {
        this.updateMessage();
      }
    });
  }

  public ngOnInit(): void {
    this.updateMessage();
  }

  public updateMessage(): void {
    this.message = this.getRandomMessage();
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
