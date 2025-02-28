import { Modal } from './modal';

export class OrderContactsView {
  private modal: Modal;
  private payButton: HTMLElement | null;

  constructor() {
    this.modal = new Modal({
      templateId: 'contacts',
      onClose: () => this.handleClose(),
    });

    this.payButton = this.modal.getModalElement().querySelector('.button');
  }

  render(): void {
    this.modal.open();
  }


  setOnPayButtonClick(callback: () => void): void {
    if (this.payButton) {
      this.payButton.addEventListener('click', (e) => {
        e.preventDefault();
        callback();
      });
    }
  }

  getModal(): Modal {
    return this.modal;
  }

  close(): void {
    this.modal.close();
  }

  destroy(): void {
    this.modal.destroy();
  }

  private handleClose(): void {
  }
}