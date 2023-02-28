import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'rivaEnumArray'})
export class EnumToArrayPipe implements PipeTransform {
  transform(value) : Object {
    return Object.keys(value).filter(e => !isNaN(+e)).map(o => { return {value: o, text: value[o]}});
  }
}