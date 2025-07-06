import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: true, name: 'celularMask' })
export class CelularMaskPipe implements PipeTransform {
  transform (value: string): string {
    if ( !value ) return '';
    const digits = value.replace(/\D/g, '');
    if ( digits.length === 11 ) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return value;
  }
}
