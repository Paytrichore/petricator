import { StoryService } from './story.service';
import storyData from '../../../assets/i18n/story-fr.json';
import { PeblobEntity } from '../../core/stores/peblob/peblob.model';
import { Tint } from '../../shared/interfaces/peblob';

describe('PeblobService', () => {
  let service: StoryService;

  beforeEach(() => {
    service = new StoryService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a story of type PRIMARY when rand < 0.75', () => {
    spyOn(Math, 'random').and.returnValues(0.5, 0.1); // type, index
    const story = service.getRandomStory();
    expect(story).toBeTruthy();
    expect(story.choices.length).toBeGreaterThan(0);
    expect(story.situation).toBeDefined();
    // Vérifie que la situation existe dans les stories PRIMARY
    const situations = (storyData as any).primary.map((s: any) => s.situation);
    expect(situations).toContain(story.situation);
  });

  it('should return a story of type SECONDARY when 0.75 <= rand < 0.95', () => {
    spyOn(Math, 'random').and.returnValues(0.8, 0.1); // type, index
    const story = service.getRandomStory();
    expect(story).toBeTruthy();
    expect(story.choices.length).toBeGreaterThan(0);
    expect(story.situation).toBeDefined();
    // Vérifie que la situation existe dans les stories SECONDARY
    const situations = (storyData as any).secondary.map((s: any) => s.situation);
    expect(situations).toContain(story.situation);
  });

  it('should return a story of type PINK when rand >= 0.95', () => {
    spyOn(Math, 'random').and.returnValues(0.97, 0.1); // type, index
    const story = service.getRandomStory();
    expect(story).toBeTruthy();
    expect(story.choices.length).toBeGreaterThan(0);
    expect(story.situation).toBeDefined();
    // Vérifie que la situation existe dans les stories PINK
    const situations = (storyData as any).pink.map((s: any) => s.situation);
    expect(situations).toContain(story.situation);
  });

  it('should return a random story for each call', () => {
    const stories = new Set();
    for (let i = 0; i < 5; i++) {
      stories.add(JSON.stringify(service.getRandomStory()));
    }
    expect(stories.size).toBeGreaterThan(1);
  });

  it('should select the first unread story in sequence', () => {
    const peblob: PeblobEntity = {
      _id: 'peblob-1',
      userId: 'user-1',
      structure: [[{ r: 1, g: 1, b: 1 }]],
      createdAt: new Date(),
      updatedAt: new Date(),
      dominantColor: Tint.RED,
      playedStoryIds: ['story-1', 'story-2', 'story-3'],
    };
    const stories = Array.from({ length: 12 }, (_, index) => ({
      situation: `Situation ${index + 1}`,
      choices: [],
    }));

    const story = service['selectStory'](stories, peblob);

    expect(story).not.toBeNull();
    if (!story) {
      return;
    }
    expect(story.id).toBe('story-4');
    expect(peblob.playedStoryIds).not.toContain(story.id);
  });
});