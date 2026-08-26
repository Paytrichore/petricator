import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { GeneratedPeblob } from '../../interfaces/peblob';
import { PeblobComponent } from '../peblob/peblob.component';
import { MatButtonModule } from '@angular/material/button';
import { sequencedFadeInAnimation } from '../../animations/sequenced-fade-in.animation';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DraftSession } from '../../../core/stores/peblob/peblob.model';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { MessageService } from '../../../services/message/message.service';

@Component({
  selector: 'app-peblob-draft',
  standalone: true,
  imports: [PeblobComponent, MatButtonModule, TranslateModule],
  templateUrl: './peblob-draft.component.html',
  styleUrl: './peblob-draft.component.scss',
  animations: [
    sequencedFadeInAnimation('.peblob-draft__result', '.peblob-draft__event')
  ]
})
export class PeblobDraftComponent implements OnDestroy {
  constructor(
    private messageService: MessageService,
    private elementRef: ElementRef<HTMLElement>,
    private peblobService: PeblobService,
  ) {}

  @Input() draftSession!: DraftSession;
  @Output() draftDone = new EventEmitter<boolean>();

  @ViewChild('confirmButton') private confirmButton?: ElementRef<HTMLButtonElement>;

  public selectedPeblob?: GeneratedPeblob;
  private selectedIndex?: number;
  public draftAnimState: 'default' | 'clicked' = 'default';
  private draftSubmissionPending = false;
  private destroy$ = new Subject<void>();

  public selectPeblob(peblob: GeneratedPeblob, index: number) {
    this.selectedPeblob = peblob;
    this.selectedIndex = index;
    setTimeout(() => this.scrollToConfirmButtonIfNeeded(), 350);
  }

  private scrollToConfirmButtonIfNeeded(): void {
    const button = this.confirmButton?.nativeElement
      ?? this.elementRef.nativeElement.querySelector<HTMLButtonElement>('button');

    if (!window.matchMedia('(max-width: 600px)').matches || !button) {
      return;
    }

    const scrollContainer = document.querySelector<HTMLElement>('main.nav__content');
    if (!scrollContainer) {
      return;
    }

    const buttonRect = button.getBoundingClientRect();
    const toolbar = document.querySelector<HTMLElement>('.player-status-toolbar');
    const containerRect = scrollContainer.getBoundingClientRect();
    const visibleTop = containerRect.top;
    const visibleBottom = Math.min(
      containerRect.bottom,
      toolbar?.getBoundingClientRect().top ?? window.innerHeight,
    );
    const scrollDelta = buttonRect.bottom > visibleBottom
      ? buttonRect.bottom - visibleBottom + 16
      : buttonRect.top < visibleTop
        ? buttonRect.top - visibleTop - 16
        : 0;

    if (scrollDelta !== 0) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollTop + scrollDelta,
        behavior: 'smooth',
      });
    }
  }

  public confirmSelection() {
    if (!this.selectedPeblob || this.selectedIndex === undefined || this.draftSubmissionPending) return;

    this.draftAnimState = 'clicked';
    this.draftSubmissionPending = true;
    this.peblobService.selectDraft(this.draftSession._id, this.selectedIndex).subscribe({
      next: () => {
        this.messageService.openSnackBar('Le péblob a été capturé.');
        this.draftDone.emit(true);
      },
      error: () => {
        this.draftSubmissionPending = false;
        this.draftAnimState = 'default';
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
