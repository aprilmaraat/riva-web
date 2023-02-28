import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'rivaCurrency'})
export class CurrencyPipe implements PipeTransform {
  transform(value) {
    return '$ ' + value;
  }
}