import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';
import { ActivatedRoute } from '@angular/router';

const storeMock = { select: jasmine.createSpy('select').and.returnValue(of(null)) };

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideHttpClient(),
        { provide: Store, useValue: storeMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ActivatedRoute, useValue: {} },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
