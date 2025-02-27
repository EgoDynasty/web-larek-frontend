import { IOrderResponse } from '../../types/types';

export class OrderSuccessView {
  private modalElement: HTMLElement;

  constructor() {
    this.modalElement = this.createModalFromTemplate('success');
    this.setupOutsideClickHandler(); // Добавляем обработчик клика вне модального окна
  }

  render(order: IOrderResponse): void {
    const successTemplate = document.querySelector<HTMLTemplateElement>('#success')!;
    const successElement = document.importNode(successTemplate.content, true);

    const title = successElement.querySelector('.order-success__title')!;
    const description = successElement.querySelector('.order-success__description')!;

    title.textContent = `Заказ оформлен!`;
    description.textContent = `Списано ${order.total} синапсов`;

    this.modalElement.querySelector('.modal__content')!.innerHTML = '';
    this.modalElement.querySelector('.modal__content')!.appendChild(successElement);

    // Добавляем обработчик события для кнопки закрытия
    const closeButton = this.getCloseButton();
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            this.closeModal();
        });
    }
  }

  openModal(): void {
    this.modalElement.classList.add('modal_active');
  }

  closeModal(): void {
    this.modalElement.classList.remove('modal_active');
  }

  getModalElement(): HTMLElement {
    return this.modalElement;
  }

  getCloseButton(): HTMLElement | null {
    return this.modalElement.querySelector('.modal__close');
  }

  private setupOutsideClickHandler(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Проверяем, был ли клик вне модального окна
      if (this.modalElement.classList.contains('modal_active') && !this.modalElement.contains(target)) {
        this.closeModal();
      }
    });
  }

  private createModalFromTemplate(templateId: string): HTMLElement {
    const template = document.querySelector<HTMLTemplateElement>(`#${templateId}`);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal__content');

    const clone = document.importNode(template.content, true);
    modalContent.appendChild(clone);

    modalContainer.appendChild(modalContent);

    document.body.appendChild(modalContainer);

    return modalContainer;
  }
}