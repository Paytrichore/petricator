import { AbstractControl, FormArray } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFormArray',
})
// Permet d'éviter d'utiliser des getter dans le template
// et donc d'augmenter sensiblement les performances lorsqu'on
// veut passer un FormArray.
export class ToFormArrayPipe implements PipeTransform {
  transform(value: AbstractControl): FormArray {
    return value as FormArray;
  }
}
