import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      providers: [
        MessageService,
        { provide: MatSnackBar, useValue: snackBarSpy }
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
      duration: 4000,
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
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snackbar--success']
    });
  }));
});
