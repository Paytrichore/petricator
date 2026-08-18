import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { PlayerStatusToolbarComponent } from './player-status-toolbar.component';
import { userMock } from '../../../tests/mocks/user.mock';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';

const storeMock = {
  select: jasmine.createSpy('select').and.returnValue(of(userMock)),
};

describe('PlayerStatusToolbarComponent', () => {
  let component: PlayerStatusToolbarComponent;
  let fixture: ComponentFixture<PlayerStatusToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerStatusToolbarComponent],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: TranslateService, useValue: translateServiceMock },
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerStatusToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clamp progress values to the PA limit', () => {
    expect(component.getProgressValue(-2)).toBe(0);
    expect(component.getProgressValue(4)).toBe(40);
    expect(component.getProgressValue(12)).toBe(100);
  });

  it('should identify valid and invalid DLA dates', () => {
    expect(component.isValidDla('2026-08-18T18:30:00.000Z')).toBeTrue();
    expect(component.isValidDla('invalid-date')).toBeFalse();
  });

  it('should toggle the minimized state', () => {
    expect(component.isMinimized).toBeFalse();

    component.toggleMinimized();

    expect(component.isMinimized).toBeTrue();
  });
});
