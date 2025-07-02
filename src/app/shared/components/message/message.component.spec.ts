import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { SnackbarData } from './../../interfaces/snackbar';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageComponent } from './message.component';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { Click } from 'src/app/tests/helpers/generics/click';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('MessageComponent Shallow-Testing', () => {
  let messageComponent: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;
  let data: SnackbarData;
  let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    data = { message: 'Le retour de Bambi' };
    matSnackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [MessageComponent],
      imports: [MatIconModule, NoopAnimationsModule, BrowserDynamicTestingModule],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: data },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageComponent);
    messageComponent = fixture.componentInstance;
    matSnackBarSpy = matSnackBarSpy;
  });

  describe('Component Initialization', () => {
    it('should display correct message in snackbar view', () => {
      // Arrange
      const snackbarMessage = fixture.debugElement.query(By.css('.snackbar__txt')).nativeElement;

      // Act
      fixture.detectChanges();

      // Assert
      expect(snackbarMessage.textContent).toContain(messageComponent.data.message);
    });
  });

  describe('Component Behavior', () => {
    it('should close current instance of snackbar on close button click', () => {
      // Arrange
      const closeButton = fixture.debugElement.query(By.css('.snackbar__btn'));
      const snackbarDismissSpy = matSnackBarSpy.dismiss;
      const handleCloseButtonSpy = spyOn(messageComponent, 'handleCloseBtn').and.callThrough();

      // Act
      Click(closeButton);

      // Assert
      expect(snackbarDismissSpy).toHaveBeenCalled();
      expect(handleCloseButtonSpy).toHaveBeenCalled();
    });
  });
});
