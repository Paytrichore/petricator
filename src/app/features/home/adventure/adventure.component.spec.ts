import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AdventureComponent } from './adventure.component';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { GeneratedPeblob, Tint } from '../../../shared/interfaces/peblob';

describe('AdventureComponent', () => {
  let component: AdventureComponent;
  let fixture: ComponentFixture<AdventureComponent>;
  let peblobService: jasmine.SpyObj<PeblobService>;

  beforeEach(async () => {
    const peblobMock: GeneratedPeblob = {
      structure: [
        [{ r: 1, g: 2, b: 3 }],
        [{ r: 4, g: 5, b: 6 }],
        [{ r: 7, g: 8, b: 9 }],
      ],
      dominantColor: Tint.ORANGE,
    };

    peblobService = jasmine.createSpyObj('PeblobService', ['generatePeblob']);
    peblobService.generatePeblob.and.returnValue(peblobMock);

    await TestBed.configureTestingModule({
      imports: [AdventureComponent],
      providers: [
        { provide: PeblobService, useValue: peblobService },
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdventureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate and shuffle peblobDraft when a choice is selected', () => {
    const choice = { color: 'orange', action: 'a', result: 'r' };

    component.onChoiceSelected(choice);

    expect(component.peblobDraft.length).toBe(3);
    expect(component.storyDone).toBeTrue();
    expect(component.story).toEqual(choice);
    expect(peblobService.generatePeblob).toHaveBeenCalledTimes(3);
  });

  it('should keep story result after choice selection', () => {
    const choice = { color: 'orange', action: 'a', result: 'Le resultat' };

    component.onChoiceSelected(choice);

    expect(component.story?.result).toBe('Le resultat');
  });
});
