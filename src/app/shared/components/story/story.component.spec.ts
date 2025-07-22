import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryComponent } from './story.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { StoryService } from '../../../services/story/story.service';

describe('StoryComponent', () => {
  let component: StoryComponent;
  let fixture: ComponentFixture<StoryComponent>;
  let storyServiceSpy: jasmine.SpyObj<StoryService>;

  beforeEach(async () => {
    storyServiceSpy = jasmine.createSpyObj('StoryService', ['getRandomStory']);
    // Mock par défaut pour éviter undefined lors de la création du composant
    storyServiceSpy.getRandomStory.and.returnValue({
      situation: 'default',
      choices: [
        { color: 'red', action: 'a', result: 'r' }
      ]
    });
    await TestBed.configureTestingModule({
      imports: [StoryComponent],
      providers: [provideAnimations(), { provide: StoryService, useValue: storyServiceSpy }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize story and shuffledChoices on ngOnInit', () => {
    const fakeStory = {
      situation: 's',
      choices: [
        { color: 'red', action: 'a', result: 'r' },
        { color: 'blue', action: 'b', result: 's' }
      ]
    };
    storyServiceSpy.getRandomStory.and.returnValue(fakeStory);
    component.ngOnInit();
    expect(component.story).toEqual(fakeStory);
    expect(component.shuffledChoices.length).toBe(2);
  });

  it('should emit choiceSelected after 400ms when onChoiceClick is called', (done) => {
    const choice = { color: 'red', action: 'a', result: 'r' };
    spyOn(component.choiceSelected, 'emit');
    component.onChoiceClick(choice);
    expect(component.storyAnimState).toBe('clicked');
    setTimeout(() => {
      expect(component.choiceSelected.emit).toHaveBeenCalledWith(choice);
      done();
    }, 410);
  });
});
