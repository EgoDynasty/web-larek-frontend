import { IProduct, AppEvent } from '../../types/types';
import { Modal } from './modal';
import { EventEmitter } from '../base/events';

export class ProductDetailsView {
  private modal: Modal;
  private baseUrl: string;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.modal = new Modal({
      templateId: 'card-preview',
      onClose: () => this.handleClose(),
    });
    this.baseUrl = 'https://larek-api.nomoreparties.co/content/weblarek';
    this.events = events;
  }

  renderProductDetails(product: IProduct): void {
    const previewTemplate = document.querySelector<HTMLTemplateElement>('#card-preview');
    if (!previewTemplate) {
      throw new Error('Template #card-preview not found');
    }

    const previewElement = document.importNode(previewTemplate.content, true);

    const previewTitle = previewElement.querySelector('.card__title');
    const previewImage = previewElement.querySelector('.card__image') as HTMLImageElement;
    const previewPrice = previewElement.querySelector('.card__price');
    const previewCategory = previewElement.querySelector('.card__category');
    const previewText = previewElement.querySelector('.card__text');

    if (previewTitle) previewTitle.textContent = product.title;
    if (previewImage) previewImage.src = `${this.baseUrl}${product.image}`;
    if (previewPrice)
      previewPrice.textContent = product.price === null ? 'Бесценно' : `${product.price} синапсов`;
    if (previewCategory) {
      previewCategory.textContent = product.category;
      const categoryClass = this.getCategoryClass(product.category);
      previewCategory.classList.add(categoryClass);
    }
    if (previewText) previewText.textContent = product.description;

    const addToBasketButton = previewElement.querySelector('.card__button') as HTMLElement;
    if (addToBasketButton) {
      addToBasketButton.addEventListener('click', () => {
        this.events.emit(AppEvent.ProductAdded, product);
        this.modal.close();
      });
    }

    this.modal.setContent(previewElement);
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

  private handleClose(): void {}

  private getCategoryClass(category: string): string {
    switch (category) {
      case 'софт-скил':
        return 'card__category_soft';
      case 'другое':
        return 'card__category_other';
      case 'дополнительное':
        return 'card__category_additional';
      case 'кнопка':
        return 'card__category_button';
      case 'хард-скил':
        return 'card__category_hard';
      default:
        return '';
    }
  }
}