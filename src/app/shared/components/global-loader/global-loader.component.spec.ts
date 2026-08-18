import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import { GlobalLoaderComponent } from './global-loader.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';

describe('GlobalLoaderComponent', () => {
  let component: GlobalLoaderComponent;
  let fixture: ComponentFixture<GlobalLoaderComponent>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLoaderComponent],
      providers: [
        provideAnimations(),
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: Router, useValue: { url: '/login', events: EMPTY } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalLoaderComponent);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService);
    loadingService.reset();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide loader by default', () => {
    const overlay = fixture.nativeElement.querySelector('.global-loader') as HTMLElement | null;

    expect(overlay).toBeNull();
  });

  it('should show loader when loading service is active', () => {
    loadingService.show();
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.global-loader') as HTMLElement | null;
    const pixels = fixture.nativeElement.querySelectorAll('.pixel');

    expect(overlay).not.toBeNull();
    expect(pixels.length).toBe(9);
  });
});
