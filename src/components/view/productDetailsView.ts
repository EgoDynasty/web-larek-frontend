import { IProduct, AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';
import { getCategoryClass } from '../../utils/utils';

export class ProductDetailsView {
  private content: HTMLElement;
  private baseUrl: string = 'https://larek-api.nomoreparties.co/content/weblarek';
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
    const template = document.querySelector<HTMLTemplateElement>('#card-preview');
    if (!template) throw new Error('Template #card-preview not found');
    const clonedContent = document.importNode(template.content, true).querySelector('.card');
    if (!(clonedContent instanceof HTMLElement)) {
      throw new Error('Card element not found in template');
    }
    this.content = clonedContent;
  }

  renderProductDetails(product: IProduct): void {
    const previewTitle = this.content.querySelector('.card__title');
    const previewImage = this.content.querySelector('.card__image');
    const previewPrice = this.content.querySelector('.card__price');
    const previewCategory = this.content.querySelector('.card__category');
    const previewText = this.content.querySelector('.card__text');
    const addButton = this.content.querySelector('.card__button');

    if (!previewTitle || !previewImage || !previewPrice || !previewCategory || !previewText || !addButton) {
      throw new Error('Required elements not found in product details template');
    }

    previewTitle.textContent = product.title;
    (previewImage as HTMLImageElement).src = `${this.baseUrl}${product.image}`;
    previewPrice.textContent = product.price === null ? 'Бесценно' : `${product.price} синапсов`;
    
    previewCategory.className = 'card__category';
    const categoryClass = getCategoryClass(product.category);
    if (categoryClass) previewCategory.classList.add(categoryClass);
    previewCategory.textContent = product.category;

    previewText.textContent = product.description;

    const isPriceless = product.price === null;
    (addButton as HTMLButtonElement).disabled = isPriceless;
    if (!isPriceless) {
      (addButton as HTMLButtonElement).onclick = () => this.events.emit(AppEvent.ProductAdded, product);
    }
  }

  getContent(): HTMLElement {
    return this.content;
  }
}