import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GeneratedPeblob } from '../../interfaces/peblob';
import { PeblobComponent } from '../peblob/peblob.component';
import { MatButtonModule } from '@angular/material/button';
import { sequencedFadeInAnimation } from '../../animations/sequenced-fade-in.animation';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ActionsSubject, Store } from '@ngrx/store';
import { selectUser } from '../../../core/stores/user/user.selectors';
import * as PeblobActions from '../../../core/stores/peblob/peblob.actions';
import { MessageService } from '../../../services/message/message.service';

@Component({
  selector: 'app-peblob-draft',
  imports: [PeblobComponent, MatButtonModule, TranslateModule],
  templateUrl: './peblob-draft.component.html',
  styleUrl: './peblob-draft.component.scss',
  animations: [
    sequencedFadeInAnimation('.peblob-draft__result', '.peblob-draft__event')
  ]
})
export class PeblobDraftComponent implements OnDestroy, OnInit {
  constructor(
    private store: Store,
    private actionsSubject: ActionsSubject,
    private messageService: MessageService,
  ) {}

  @Input() peblobDraft!: Array<GeneratedPeblob>;
  @Output() draftDone = new EventEmitter<boolean>();

  public selectedPeblob?: GeneratedPeblob;
  public draftAnimState: 'default' | 'clicked' = 'default';
  private userId?: string;
  private draftSubmissionPending = false;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userId = user?._id;
      });

    this.actionsSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (!this.draftSubmissionPending) {
          return;
        }

        if (action.type === PeblobActions.createPeblobSuccess.type) {
          this.draftSubmissionPending = false;
          this.messageService.openSnackBar('Le péblob a été capturé.');
          this.draftDone.emit(true);
          return;
        }

        if (action.type === PeblobActions.createPeblobFailure.type) {
          this.draftSubmissionPending = false;
          this.draftAnimState = 'default';
        }
      });
  }

  public selectPeblob(peblob: GeneratedPeblob) {
    this.selectedPeblob = peblob;
  }

  public confirmSelection() {
    if (!this.selectedPeblob) return;
    if (!this.userId) return;

    this.draftAnimState = 'clicked';
    this.draftSubmissionPending = true;
    this.store.dispatch(PeblobActions.createPeblob({
      userId: this.userId,
      structure: this.selectedPeblob.structure,
      dominantColor: this.selectedPeblob.dominantColor,
    }));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
