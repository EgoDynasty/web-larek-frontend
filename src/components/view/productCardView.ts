import { IProduct, AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';
import { getCategoryClass } from '../../utils/utils';

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
    const cardItem = cardElement.querySelector('.gallery__item') as HTMLElement;

    const cardTitle = cardItem.querySelector('.card__title')!;
    const cardImage = cardItem.querySelector('.card__image')! as HTMLImageElement;
    const cardPrice = cardItem.querySelector('.card__price')!;
    const cardCategory = cardItem.querySelector('.card__category')!;

    cardTitle.textContent = product.title;
    cardImage.src = `${this.baseUrl}${product.image}`;
    cardPrice.textContent = product.price === null ? 'Бесценно' : `${product.price} синапсов`;
    
    cardCategory.className = 'card__category';
    const categoryClass = getCategoryClass(product.category);
    if (categoryClass) cardCategory.classList.add(categoryClass);
    cardCategory.textContent = product.category;

    cardItem.dataset.id = product.id;

    return cardItem;
  }

  private setupEventListeners(product: IProduct): void {
    this.element.addEventListener('click', () => {
      this.events.emit(AppEvent.ProductDetailsOpened, product);
    });
  }

  getElement(): HTMLElement {
    return this.element;
  }
}