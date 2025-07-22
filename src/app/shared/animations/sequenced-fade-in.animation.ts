import { trigger, transition, style, animate, query, state } from '@angular/animations';

export function sequencedFadeInAnimation(
  titleSelector: string = '.story__situation',
  actionsSelector: string = '.story__actions'
) {
  return trigger('sequencedFadeIn', [
    transition(':enter', [
      query(`${titleSelector}, ${actionsSelector}`, [
        style({ opacity: 0, transform: 'translateY(20px)' })
      ]),
      query(titleSelector, [
        animate('600ms ease-out', style({ opacity: 1, transform: 'none' }))
      ]),
      query(actionsSelector, [
        animate('400ms 800ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ]),
    state('clicked', style({ opacity: 0, transform: 'translateY(20px)' })), // To make the leave work you need to set clicked in each component
    transition('default => clicked', animate('400ms ease-in')),
  ]);
}