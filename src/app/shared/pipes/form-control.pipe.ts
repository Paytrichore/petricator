import { AbstractControl, FormControl } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFormControl',
})
// Permet d'éviter d'utiliser des getter dans le template
// et donc d'augmenter sensiblement les performances lorsqu'on
// veut passer un FormControl.
export class ToFormControlPipe implements PipeTransform {
  transform(value: AbstractControl): FormControl {
    return value as FormControl;
  }
}
