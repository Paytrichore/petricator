import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../main/nav/nav.component';
import { ActivatedRoute } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { PeblobService } from '../../services/peblob/peblob.service';
import { ComposedPeblob } from '../../shared/interfaces/peblob';
import { User } from '../../core/stores/user/user.model';
import { selectUser } from '../../core/stores/user/user.selectors';
import { provideAnimations } from '@angular/platform-browser/animations';
import { take } from 'rxjs';
import { userMock } from '../../tests/mocks/user.mock';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let peblobService: jasmine.SpyObj<PeblobService>;

  beforeEach(async () => {
    const peblobMock: ComposedPeblob = [
      [{ r: 1, g: 2, b: 3 }],
      [{ r: 4, g: 5, b: 6 }],
      [{ r: 7, g: 8, b: 9 }]
    ];
    peblobService = jasmine.createSpyObj('PeblobService', ['composedPeblobGenerator']);
    peblobService.composedPeblobGenerator.and.returnValue(peblobMock);
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterOutlet, NavComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: PeblobService, useValue: peblobService },
        provideMockStore({
          selectors: [
            {
              selector: selectUser,
              value: userMock
            }
          ]
        }),
        provideAnimations()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should assign user$', (done) => {
  component.ngOnInit();
  component.user$.pipe(take(1)).subscribe(user => {
    expect(user?.username).toBe('user');
    done();
  });
});

  it('should generate and shuffle peblobDraft, set storyDone and story on onChoiceSelected', () => {
    const choice = { color: 'orange', action: 'a', result: 'r' };
    component.onChoiceSelected(choice);
    expect(component.peblobDraft.length).toBe(3);
    expect(component.storyDone).toBeTrue();
    expect(component.story).toEqual(choice);
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const spy = spyOn((component as any).destroy$, 'next').and.callThrough();
    const spy2 = spyOn((component as any).destroy$, 'complete').and.callThrough();
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should set draftDone to true when onDraftDone is called with true', () => {
    component.draftDone = false;
    spyOn(console, 'log');
    component.onDraftDone(true);
    expect(component.draftDone).toBeTrue();
    expect(console.log).toHaveBeenCalledWith('Draft done:', true);
  });

  it('should set draftDone to false when onDraftDone is called with false', () => {
    component.draftDone = true;
    spyOn(console, 'log');
    component.onDraftDone(false);
    expect(component.draftDone).toBeFalse();
    expect(console.log).toHaveBeenCalledWith('Draft done:', false);
  });
});