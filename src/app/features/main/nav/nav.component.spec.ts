import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { provideHttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';
import { BreakpointObserver } from '@angular/cdk/layout';

const storeMock = { select: jasmine.createSpy('select').and.returnValue(of(null)) };

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  const breakpointObserverMock = {
    observe: () => of({ matches: true })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NavComponent,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Store, useValue: storeMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        provideHttpClient(),
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
    expect(component.isHandset).toBeTrue();
    expect(component.mini).toBeFalse();
  });

  it('should toggle mini from false to true', () => {
    component.mini = false;
    component.toggleMini();
    expect(component.mini).toBeTrue();
  });

  it('should toggle mini from true to false', () => {
    component.mini = true;
    component.toggleMini();
    expect(component.mini).toBeFalse();
  });

  it('should close drawer on click if handset', () => {
    const drawerMock = { close: jasmine.createSpy('close') };
    component.isHandset = true;
    component.onAnyClick(new Event('click'), drawerMock);
    expect(drawerMock.close).toHaveBeenCalled();
  });

  it('should not close drawer on click if not handset', () => {
    const drawerMock = { close: jasmine.createSpy('close') };
    component.isHandset = false;
    component.onAnyClick(new Event('click'), drawerMock);
    expect(drawerMock.close).not.toHaveBeenCalled();
  });

  it('should not throw if drawer is null in onAnyClick', () => {
    expect(() => component.onAnyClick(new Event('click'), null)).not.toThrow();
  });
});