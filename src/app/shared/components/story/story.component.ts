import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { StoryService } from '../../../services/story/story.service';
import { Story, StoryChoice } from '../../interfaces/story';
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
  @Input() externalStory?: Story;

  public story!: Story;

  public shuffledChoices: StoryChoice[] = [];
  public storyAnimState: 'default' | 'clicked' = 'default';

  @Output() choiceSelected = new EventEmitter<StoryChoice>();
  @Output() storyReady = new EventEmitter<Story>();

  constructor(private storyService: StoryService) {}

  ngOnInit(): void {
    this.story = this.externalStory ?? this.storyService.getRandomStory();
    this.shuffledChoices = shuffleArray(this.story.choices);
    if (!this.externalStory) {
      this.storyReady.emit(this.story);
    }
  }

  onChoiceClick(choice: StoryChoice): void {
    this.storyAnimState = 'clicked';
    setTimeout(() => {
      this.choiceSelected.emit(choice);
    }, 400);
  }
}
