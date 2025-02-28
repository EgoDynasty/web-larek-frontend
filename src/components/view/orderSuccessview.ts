import { IOrderResponse } from '../../types/types';
import { Modal } from './modal';

export class OrderSuccessView {
  private modal: Modal;

  constructor() {
    this.modal = new Modal({
      templateId: 'success',
      onClose: () => this.handleClose(),
    });
  }

  render(order: IOrderResponse): void {
    const successTemplate = document.querySelector<HTMLTemplateElement>('#success');
    if (!successTemplate) {
      throw new Error('Template #success not found');
    }

    const successElement = document.importNode(successTemplate.content, true);
    const title = successElement.querySelector('.order-success__title');
    const description = successElement.querySelector('.order-success__description');
    const closeButton = successElement.querySelector('.order-success__close') as HTMLButtonElement;

    if (title && description) {
      title.textContent = 'Заказ оформлен!';
      description.textContent = `Списано ${order.total} синапсов`;
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.modal.close();
      });
    }

    this.modal.setContent(successElement);
    this.modal.open();
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