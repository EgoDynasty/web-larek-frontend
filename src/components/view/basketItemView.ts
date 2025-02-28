import { IProduct } from "../../types/types";

export class BasketItemView {
    private itemElement: HTMLElement;
  
    constructor(item: IProduct, onDelete: (productId: string) => void) {
      const template = document.querySelector<HTMLTemplateElement>('#card-basket');
      if (!template) {
        throw new Error('Template for basket item not found');
      }
  
      this.itemElement = document.importNode(template.content, true).firstElementChild as HTMLElement;
  
      const indexElement = this.itemElement.querySelector('.basket__item-index')!;
      const titleElement = this.itemElement.querySelector('.card__title')!;
      const priceElement = this.itemElement.querySelector('.card__price')!;
      const deleteButton = this.itemElement.querySelector('.basket__item-delete')!;
  
      indexElement.textContent = (item.index + 1).toString();
      titleElement.textContent = item.title;
      priceElement.textContent = item.price === null ? 'Бесценно' : `${item.price} синапсов`;
  
      deleteButton.addEventListener('click', () => onDelete(item.id));
    }
  
    get element(): HTMLElement {
      return this.itemElement;
    }
  }