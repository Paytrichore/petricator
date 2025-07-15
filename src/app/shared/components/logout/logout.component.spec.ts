import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutComponent } from './logout.component';
import { provideHttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';

const storeMock = { select: jasmine.createSpy('select').and.returnValue(of(null)) };

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    await TestBed.configureTestingModule({
      imports: [LogoutComponent],
      providers: [
        provideHttpClient(),
        { provide: Store, useValue: storeMock },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService.logout on click', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
