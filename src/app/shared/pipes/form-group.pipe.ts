import { AbstractControl, FormGroup } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFormGroup',
})
// Permet d'éviter d'utiliser des getter dans le template
// et donc d'augmenter sensiblement les performances lorsqu'on
// veut passer un FormGroup.
export class ToFormGroupPipe implements PipeTransform {
  transform(value: AbstractControl): FormGroup {
    return value as FormGroup;
  }
}
