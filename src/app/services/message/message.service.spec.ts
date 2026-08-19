import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerMock: { url: string };

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerMock = { url: '/login' };
    TestBed.configureTestingModule({
      providers: [
        MessageService,
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerMock },
      ]
    });
    service = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a snackbar with error style after 500ms', fakeAsync(() => {
    service.openSnackBar('Erreur', true);
    expect(snackBarSpy.open).not.toHaveBeenCalled();
    
    tick(500);
    
    expect(snackBarSpy.open).toHaveBeenCalledWith('Erreur', 'Fermer', {
      duration: 6000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snackbar--error']
    });
  }));

  it('should open a snackbar with success style after 500ms', fakeAsync(() => {
    service.openSnackBar('OK', false);
    expect(snackBarSpy.open).not.toHaveBeenCalled();
    
    tick(500);
    
    expect(snackBarSpy.open).toHaveBeenCalledWith('OK', 'Fermer', {
      duration: 6000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snackbar--success']
    });
  }));

  it('should add the authenticated positioning class outside public auth routes', fakeAsync(() => {
    routerMock.url = '/world';

    service.openSnackBar('OK');
    tick(500);

    expect(snackBarSpy.open).toHaveBeenCalledWith('OK', 'Fermer', jasmine.objectContaining({
      verticalPosition: 'bottom',
      panelClass: ['snackbar--success', 'snackbar--authenticated'],
    }));
  }));
});
