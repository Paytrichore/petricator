import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionCheckedComponent } from './action-checked.component';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ActionCheckedComponent', () => {
  let component: ActionCheckedComponent;
  let fixture: ComponentFixture<ActionCheckedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionCheckedComponent],
      providers: [provideAnimations()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionCheckedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
