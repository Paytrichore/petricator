import { Component } from '@angular/core';
import { StoryComponent } from '../../../shared/components/story/story.component';
import { PeblobDraftComponent } from '../../../shared/components/peblob-draft/peblob-draft.component';
import { ComposedPeblob, tintMap } from '../../../shared/interfaces/peblob';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { shuffleArray } from '../../../shared/helpers/array.helpers';

@Component({
  selector: 'app-adventure',
  standalone: true,
  imports: [StoryComponent, PeblobDraftComponent],
  templateUrl: './adventure.component.html',
  styleUrl: './adventure.component.scss',
})
export class AdventureComponent {
  public peblobDraft!: Array<ComposedPeblob>;
  public storyDone = false;
  public story?: { color: string; action: string; result: string };

  constructor(private peblobService: PeblobService) {}

  onChoiceSelected(choice: { color: string; action: string; result: string }) {
    this.peblobDraft = [
      this.peblobService.composedPeblobGenerator(tintMap[choice.color.toLowerCase()]),
      this.peblobService.composedPeblobGenerator(),
      this.peblobService.composedPeblobGenerator(),
    ];
    this.peblobDraft = shuffleArray(this.peblobDraft);
    this.storyDone = true;
    this.story = choice;
  }
}
