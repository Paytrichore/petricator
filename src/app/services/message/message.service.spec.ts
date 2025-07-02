import { TestBed } from '@angular/core/testing';
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

  it('should open a snackbar with error style if message is provided', () => {
    service.openSnackBar('Erreur', true);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Erreur', 'Fermer', {
      duration: 4000,
      panelClass: ['snackbar--error']
    });
  });

  it('should open a snackbar without error style if message is empty', () => {
    service.openSnackBar('', false);
    expect(snackBarSpy.open).toHaveBeenCalledWith('', 'Fermer', {
      duration: 4000,
      panelClass: undefined
    });
  });
});
