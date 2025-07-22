import { Component, Input } from '@angular/core';
import { ComposedPeblob } from '../../interfaces/peblob';
import { PeblobComponent } from '../peblob/peblob.component';
import { MatButtonModule } from '@angular/material/button';
import { sequencedFadeInAnimation } from '../../animations/sequenced-fade-in.animation';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-peblob-draft',
  imports: [PeblobComponent, MatButtonModule, TranslateModule],
  templateUrl: './peblob-draft.component.html',
  styleUrl: './peblob-draft.component.scss',
  animations: [
    sequencedFadeInAnimation('.peblob-draft__result', '.peblob-draft__event')
  ]
})
export class PeblobDraftComponent {
  @Input() peblobDraft!: Array<ComposedPeblob>;

  selectedPeblob?: ComposedPeblob;

  public selectPeblob(peblob: ComposedPeblob) {
    this.selectedPeblob = peblob;
  }

  public confirmSelection() {
    console.log('Peblob confirmé : TODO PeblobAPI add Peblob, link to user, etc...', this.selectedPeblob);
  }
}
