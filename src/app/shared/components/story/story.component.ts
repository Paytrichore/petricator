import { Component, OnInit, Output, EventEmitter, HostBinding } from '@angular/core';
import { StoryService } from '../../../services/story/story.service';
import { Story } from '../../interfaces/story';
import { MatButtonModule } from '@angular/material/button';
import { shuffleArray } from '../../helpers/array.helpers';
import { sequencedFadeInAnimation } from '../../animations/sequenced-fade-in.animation';

@Component({
  selector: 'app-story',
  imports: [MatButtonModule],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss',
  animations: [
    sequencedFadeInAnimation('.story__situation', '.story__actions')
  ],
})
export class StoryComponent implements OnInit {
  public story!: Story;
  public shuffledChoices: Array<{ color: string; action: string; result: string }> = [];
  public storyAnimState: 'default' | 'clicked' = 'default';

  @Output() choiceSelected = new EventEmitter<{ color: string; action: string; result: string }>();

  constructor(private storyService: StoryService) {}

  ngOnInit(): void {
    this.story = this.storyService.getRandomStory();
    this.shuffledChoices = shuffleArray(this.story.choices);
  }

  onChoiceClick(choice: { color: string; action: string; result: string }) {
    this.storyAnimState = 'clicked';
    setTimeout(() => {
      this.choiceSelected.emit(choice);
    }, 400);
  }
}
