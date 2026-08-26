import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import storyData from '../../../assets/i18n/story-fr.json';
import { Story, StoryData, StoryType } from '../../shared/interfaces/story';
import { PeblobEntity } from '../../core/stores/peblob/peblob.model';
import { Tint, tintMap } from '../../shared/interfaces/peblob';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  constructor(@Optional() private http: HttpClient | null = null) {}

  public getStoryForPeblob(peblob: PeblobEntity): Observable<Story | null> {
    if (!peblob.dominantColor) {
      return throwError(() => new Error('A dominant color is required to load a Peblob story.'));
    }

    const color = tintMap[peblob.dominantColor] ?? peblob.dominantColor;
    const url = `/i18n/peblob-stories/${color}-story-fr.json`;
    if (!this.http) {
      return throwError(() => new Error('HttpClient is required to load Peblob stories.'));
    }

    return this.http.get<Record<string, Story[]>>(url).pipe(
      map(data => this.selectStory(data[color] ?? [], peblob))
    );
  }

  private selectStory(stories: Story[], peblob: PeblobEntity): Story | null {
    const playedStoryIds = new Set(peblob.playedStoryIds ?? []);
    const orderedStories = stories.map((story, index) => ({
      ...story,
      id: story.id ?? `story-${index + 1}`,
    }));
    const availableStories = orderedStories.filter(story => !playedStoryIds.has(story.id));

    if (!availableStories.length) {
      return null;
    }

    return availableStories[0];
  }

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
