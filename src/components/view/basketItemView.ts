import { IProduct } from '../../types/types';

export class BasketItemView {
  private itemElement: HTMLElement;
  private indexElement: HTMLElement;
  private titleElement: HTMLElement;
  private priceElement: HTMLElement;
  private deleteButton: HTMLElement;

  constructor(item: IProduct, index: number, onDelete: (productId: string) => void) {
    const template = document.querySelector<HTMLTemplateElement>('#card-basket');
    if (!template) {
      throw new Error('Template for basket item not found');
    }

    const clonedElement = document.importNode(template.content, true).firstElementChild;
    if (!(clonedElement instanceof HTMLElement)) {
      throw new Error('Basket item template does not contain an HTMLElement');
    }
    this.itemElement = clonedElement;

    const indexElement = this.itemElement.querySelector('.basket__item-index');
    const titleElement = this.itemElement.querySelector('.card__title');
    const priceElement = this.itemElement.querySelector('.card__price');
    const deleteButton = this.itemElement.querySelector('.basket__item-delete');

    if (!(indexElement instanceof HTMLElement) || 
        !(titleElement instanceof HTMLElement) || 
        !(priceElement instanceof HTMLElement) || 
        !(deleteButton instanceof HTMLElement)) {
      throw new Error('Required elements not found in basket item template');
    }

    this.indexElement = indexElement;
    this.titleElement = titleElement;
    this.priceElement = priceElement;
    this.deleteButton = deleteButton;

    this.indexElement.textContent = index.toString();
    this.titleElement.textContent = item.title;
    this.priceElement.textContent = item.price === null ? 'Бесценно' : `${item.price} синапсов`;

    this.deleteButton.addEventListener('click', () => onDelete(item.id));
  }

  get element(): HTMLElement {
    return this.itemElement;
  }
}