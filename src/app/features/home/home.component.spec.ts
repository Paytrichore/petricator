import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../main/nav/nav.component';
import { ActivatedRoute } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { PeblobService } from '../../services/peblob/peblob.service';
import { ComposedPeblob } from '../../shared/interfaces/peblob';
import { User } from '../../core/stores/user/user.types';
import { selectUser } from '../../core/stores/user/user.selectors';

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
              value: {
                _id: '1', username: 'test', email: 't@t.com', peblobs: [peblobMock]
              } as User
            }
          ]
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should assign user$ and peblob on ngOnInit', () => {
    component.ngOnInit();
    component.user$.subscribe(user => {
      expect(user?.username).toBe('test');
    });
    expect(component.peblob.length).toBe(1);
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
});