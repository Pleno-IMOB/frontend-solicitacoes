import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'nl2br'
})

/**
 * Converte quebras de linha em tags <br>.
 * @param value Texto de entrada que será transformado.
 * @returns Texto com quebras de linha convertidas em <br>.
 */
export class Nl2BrPipe implements PipeTransform {
  transform (value: string): string {
    return value?.replace(/\n/g, '<br>') ?? '';
  }
}