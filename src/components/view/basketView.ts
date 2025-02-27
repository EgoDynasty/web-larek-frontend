import { IProduct } from '../../types/types';

export class BasketView {
  private modalElement: HTMLElement;
  private counterElement: HTMLElement;
  private onDeleteItem: (productId: string) => void;

  constructor() {
    this.counterElement = document.querySelector('.header__basket-counter')!;
    this.modalElement = this.createModalFromTemplate('basket');
  }

  setOnDeleteItemCallback(callback: (productId: string) => void): void {
    this.onDeleteItem = callback;
  }

  render(items: IProduct[]): void {
    const basketList = this.modalElement.querySelector('.basket__list')!;
    basketList.innerHTML = items.map((item, index) => `
      <li class="basket__item card card_compact">
        <span class="basket__item-index">${index + 1}</span>
        <span class="card__title">${item.title}</span>
        <span class="card__price">${item.price === null ? 'Бесценно' : `${item.price} синапсов`}</span>
        <button class="basket__item-delete" aria-label="удалить" data-id="${item.id}"></button>
      </li>
    `).join('');

    this.updateCounter(items.length);
    this.updateTotalPrice(this.calculateTotalPrice(items));

    const orderButton = this.getOrderButton() as HTMLButtonElement;
    if (orderButton) {
      orderButton.disabled = this.calculateTotalPrice(items) === 0;
    }

    basketList.querySelectorAll('.basket__item-delete').forEach(button => {
      button.addEventListener('click', (event) => {
        const productId = (event.currentTarget as HTMLElement).dataset.id;
        if (productId && this.onDeleteItem) {
          this.onDeleteItem(productId);
        }
      });
    });
  }

  updateCounter(count: number): void {
    this.counterElement.textContent = count.toString();
  }

  updateTotalPrice(totalPrice: number): void {
    const totalPriceElement = this.modalElement.querySelector('.basket__price')!;
    totalPriceElement.textContent = `${totalPrice} синапсов`;
  }

  calculateTotalPrice(items: IProduct[]): number {
    return items.reduce((total, item) => total + (item.price || 0), 0);
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

  getOrderButton(): HTMLElement | null {
    return this.modalElement.querySelector('.basket__button');
  }

  private createModalFromTemplate(templateId: string): HTMLElement {
    const template = document.querySelector<HTMLTemplateElement>(`#${templateId}`);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }
  
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal');
  
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal__container'); // Используем modal__container вместо modal__content
  
    const clone = document.importNode(template.content, true);
    modalContent.appendChild(clone);
  
    modalContainer.appendChild(modalContent);
  
    document.body.appendChild(modalContainer);
  
    return modalContainer;
}
}