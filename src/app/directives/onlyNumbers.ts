import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyNumbers]'
})
export class OnlyNumbers {
  /**
   * Lida com eventos de pressionamento de tecla para permitir apenas números.
   * @param event Evento de teclado que contém informações sobre a tecla pressionada.
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    const ctrlCommands = ['a', 'c', 'v', 'x'];

    if (
      allowedKeys.includes(event.key) ||
      (event.ctrlKey && ctrlCommands.includes(event.key.toLowerCase()))
    ) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
