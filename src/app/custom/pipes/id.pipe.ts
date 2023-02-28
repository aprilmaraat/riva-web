import { ValueTransformer } from '@angular/compiler/src/util';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'idPipe'})
export class IdPipe implements PipeTransform {
  transform(value) {
    let x = '0000000';
    let x_split = x.split('');
    let value_split = (value + '').split('');
    let x_length = x_split.length;
    let value_length = value_split.length;
    let starting_index = (x_length - value_length);
    let index = 0;
    for(starting_index; starting_index < x_length; starting_index++){
      if(index < value_length){
        x_split[starting_index] = value_split[index];
        index++;
      }
    }

    return x_split.join('');
  }
}