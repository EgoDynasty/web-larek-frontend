import { IProduct, AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';
import { getCategoryClass } from '../ulits/getCategoryClass';

export class ProductDetailsView {
  private content: HTMLElement;
  private baseUrl: string = 'https://larek-api.nomoreparties.co/content/weblarek';
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
    const template = document.querySelector<HTMLTemplateElement>('#card-preview');
    if (!template) throw new Error('Template #card-preview not found');
    this.content = document.importNode(template.content, true).querySelector('.card') as HTMLElement;
  }

  renderProductDetails(product: IProduct): void {
    const previewTitle = this.content.querySelector('.card__title')!;
    const previewImage = this.content.querySelector('.card__image') as HTMLImageElement;
    const previewPrice = this.content.querySelector('.card__price')!;
    const previewCategory = this.content.querySelector('.card__category')!;
    const previewText = this.content.querySelector('.card__text')!;
    const addButton = this.content.querySelector('.card__button') as HTMLButtonElement;

    previewTitle.textContent = product.title;
    previewImage.src = `${this.baseUrl}${product.image}`;
    previewPrice.textContent = product.price === null ? 'Бесценно' : `${product.price} синапсов`;
    
    previewCategory.className = 'card__category';
    const categoryClass = getCategoryClass(product.category);
    if (categoryClass) previewCategory.classList.add(categoryClass);
    previewCategory.textContent = product.category;

    previewText.textContent = product.description;

    addButton.onclick = () => this.events.emit(AppEvent.ProductAdded, product);
  }

  getContent(): HTMLElement {
    return this.content;
  }
}