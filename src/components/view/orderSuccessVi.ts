import { IOrderResponse } from '../../types/types';

export class OrderSuccessView {
  private content: HTMLElement;

  constructor() {
    const template = document.querySelector<HTMLTemplateElement>('#success');
    if (!template) throw new Error('Template #success not found');
    this.content = document.importNode(template.content, true).querySelector('.order-success') as HTMLElement;
    this.setupEventListeners();
  }

  render(order: IOrderResponse): void {
    const title = this.content.querySelector('.order-success__title')!;
    const description = this.content.querySelector('.order-success__description')!;
    title.textContent = 'Заказ оформлен!';
    description.textContent = `Списано ${order.total} синапсов`;
  }

  private setupEventListeners(): void {
    const closeButton = this.content.querySelector('.order-success__close') as HTMLButtonElement;
    closeButton.addEventListener('click', () => {
      document.querySelector('.modal')!.classList.remove('modal_active');
    });
  }

  getContent(): HTMLElement {
    return this.content;
  }
}