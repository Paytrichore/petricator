import { Injectable } from '@angular/core';
import storyData from '../../../assets/i18n/story-fr.json';
import { Story, StoryData, StoryType } from '../../shared/interfaces/story';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  constructor() {}

  getRandomStory(): Story {
    const rand = Math.random();
    let type: StoryType;

    if (rand < 0.75) type = StoryType.PRIMARY;
    else if (rand < 0.95) type = StoryType.SECONDARY;
    else type = StoryType.PINK;

    const stories: Story[] = (storyData as StoryData)[type];
    const idx = Math.floor(Math.random() * stories.length);

    return stories[idx];
  }
}
