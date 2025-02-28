import { Modal } from './modal';

export class OrderPaymentView {
  private modal: Modal;
  private nextButton: HTMLElement | null;

  constructor() {
    this.modal = new Modal({
      templateId: 'order',
      onClose: () => this.handleClose(),
    });

    // Кэшируем кнопку "Далее" сразу
    this.nextButton = this.modal.getModalElement().querySelector('.order__button');
  }

  // Рендеринг (открытие модалки)
  render(): void {
    this.modal.open();
  }

  // Установка callback для кнопки "Далее"
  setOnNextButtonClick(callback: () => void): void {
    if (this.nextButton) {
      this.nextButton.addEventListener('click', (e) => {
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