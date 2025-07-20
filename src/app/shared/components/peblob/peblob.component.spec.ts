import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeblobComponent } from './peblob.component';

describe('PeblobComponent', () => {
  let component: PeblobComponent;
  let fixture: ComponentFixture<PeblobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeblobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeblobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
