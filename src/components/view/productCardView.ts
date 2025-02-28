import { IProduct, AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';

export class ProductCardView {
  private element: HTMLElement;
  private events: EventEmitter;
  private baseUrl: string = 'https://larek-api.nomoreparties.co/content/weblarek';

  constructor(product: IProduct, events: EventEmitter) {
    this.events = events;
    this.element = this.createCardElement(product);
    this.setupEventListeners(product);
  }

  private createCardElement(product: IProduct): HTMLElement {
    const cardTemplate = document.querySelector<HTMLTemplateElement>('#card-catalog');
    if (!cardTemplate) {
      throw new Error('Template #card-catalog not found');
    }

    const cardElement = document.importNode(cardTemplate.content, true);

    const cardTitle = cardElement.querySelector('.card__title');
    const cardImage = cardElement.querySelector('.card__image') as HTMLImageElement;
    const cardPrice = cardElement.querySelector('.card__price');
    const cardCategory = cardElement.querySelector('.card__category');
    const categoryClass = this.getCategoryClass(product.category);

    if (cardTitle) cardTitle.textContent = product.title;
    if (cardImage) cardImage.src = `${this.baseUrl}${product.image}`;
    if (cardPrice)
      cardPrice.textContent = product.price === null ? 'Бесценно' : `${product.price} синапсов`;
    if (cardCategory) {
      cardCategory.textContent = product.category;
      cardCategory.classList.add(categoryClass);
    }

    const cardItem = cardElement.querySelector('.gallery__item') as HTMLElement;
    if (cardItem) cardItem.dataset.id = product.id;

    return cardItem || cardElement.firstElementChild as HTMLElement;
  }

  private setupEventListeners(product: IProduct): void {
    this.element.addEventListener('click', () => {
      this.events.emit(AppEvent.ProductDetailsOpened, product);
    });
  }

  getElement(): HTMLElement {
    return this.element;
  }

  private getCategoryClass(category: string): string {
    switch (category) {
      case 'софт-скил': return 'card__category_soft';
      case 'другое': return 'card__category_other';
      case 'дополнительное': return 'card__category_additional';
      case 'кнопка': return 'card__category_button';
      case 'хард-скил': return 'card__category_hard';
      default: return '';
    }
  }
}