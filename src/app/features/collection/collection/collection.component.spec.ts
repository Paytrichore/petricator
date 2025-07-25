import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionComponent } from './collection.component';
import { provideMockStore } from '@ngrx/store/testing';
import { selectPeblobs } from '../../../core/stores/peblob/peblob.selectors';
import { ComposedPeblob } from '../../../shared/interfaces/peblob';
import { mockPeblobs } from '../../../tests/mocks/peblob.mock';

describe('CollectionComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: selectPeblobs,
              value: [
                { structure: mockPeblobs[0] },
                { structure: mockPeblobs[1] }
              ]
            }
          ]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose peblobs$ as an observable of ComposedPeblob[]', (done) => {
    component.peblobs$.subscribe(peblobs => {
      expect(peblobs).toEqual(mockPeblobs);
      done();
    });
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const spy = spyOn(component['destroy$'], 'next');
    const spyComplete = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });
});