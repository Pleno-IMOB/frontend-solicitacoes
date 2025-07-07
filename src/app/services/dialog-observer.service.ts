import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DialogObserverService {
  private renderer: Renderer2;
  private intervalIdMap = new Map<HTMLElement, any>();
  private timeInterval = 1000;

  constructor (
    @Inject(DOCUMENT) private document: Document,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Initializes the system by observing modals.
   * @return {void}
   */
  public init (): void {
    this.observeModals();
  }

  /**
   * Calculate the height of the dialog content based on the container's elements.
   * @param {HTMLElement} dialogContainer - The container element of the dialog.
   * @return {void} - This method does not return a value.
   */
  private calculateDialogContentHeight (dialogContainer: HTMLElement): void {
    const dialogTitle = dialogContainer.querySelector('.mat-dialog-title') as HTMLElement;
    const dialogActions = dialogContainer.querySelector('.mat-dialog-actions') as HTMLElement;

    const titleHeight = dialogTitle ? dialogTitle.offsetHeight : 0;
    const actionsHeight = dialogActions ? dialogActions.offsetHeight : 0;

    const contentHeight = `calc(100vh - ${titleHeight + 100}px - ${actionsHeight}px)`;

    const dialogContent = dialogContainer.querySelector('.mat-dialog-content') as HTMLElement;
    if ( dialogContent ) {
      this.renderer.setStyle(dialogContent, 'max-height', contentHeight);
    } else {
      console.error('Dialog content element not found.');
    }
  }

  /**
   * Observes the modals in the document body and performs certain actions when modals are added or removed.
   * @returns {void}
   */
  private observeModals (): void {
    const body = this.document.body;

    const observer = new MutationObserver((mutationsList) => {
      for ( let mutation of mutationsList ) {
        if ( mutation.type === 'childList' ) {
          mutation.addedNodes.forEach((node: Node): void => {
            if ( node instanceof HTMLElement && node.classList.contains('mat-dialog-container') ) {
              this.startInterval(node);
            }
          });

          mutation.removedNodes.forEach((node: Node): void => {
            if ( node instanceof HTMLElement && node.classList.contains('mat-dialog-container') ) {
              this.stopInterval(node);
            }
          });
        }
      }
    });

    observer.observe(body, { childList: true, subtree: true });
  }

  /**
   * Starts an interval to continuously calculate the dialog content height.
   * @param {HTMLElement} dialogContainer - The container element of the dialog.
   * @return {void}
   */
  private startInterval (dialogContainer: HTMLElement): void {
    const intervalId = setInterval((): void => {
      this.calculateDialogContentHeight(dialogContainer);
    }, this.timeInterval);

    this.intervalIdMap.set(dialogContainer, intervalId);
  }

  /**
   * Stops the interval for a given dialog container.
   *
   * @param {HTMLElement} dialogContainer - The dialog container for which the interval should be stopped.
   * @return {void}
   */
  private stopInterval (dialogContainer: HTMLElement): void {
    const intervalId: any = this.intervalIdMap.get(dialogContainer);
    if ( intervalId ) {
      clearInterval(intervalId);
      this.intervalIdMap.delete(dialogContainer);
    }
  }
}
