import { IProduct, IProductView, AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';

export class ProductDetailsView implements IProductView {
  private modalElement: HTMLElement;
  private baseUrl: string;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.modalElement = this.createModalFromTemplate('card-preview');
    this.baseUrl = 'https://larek-api.nomoreparties.co/content/weblarek';
    this.events = events;
  }
  
getModalElement(): HTMLElement {
    return this.modalElement;
  }

  renderProductDetails(product: IProduct): void {
    const previewTemplate = document.querySelector<HTMLTemplateElement>('#card-preview')!;
    const previewElement = document.importNode(previewTemplate.content, true);

    const previewTitle = previewElement.querySelector('.card__title')!;
    const previewImage = previewElement.querySelector('.card__image')! as HTMLImageElement;
    const previewPrice = previewElement.querySelector('.card__price')!;
    const previewCategory = previewElement.querySelector('.card__category')!;
    const previewText = previewElement.querySelector('.card__text')!;
    const categoryClass = this.getCategoryClass(product.category);

    previewTitle.textContent = product.title;
    previewImage.src = `${this.baseUrl}${product.image}`;
    if (product.price === null) {
      previewPrice.textContent = `Бесценно`;
    } else {
      previewPrice.textContent = `${product.price} синапсов`;
    }

    previewCategory.textContent = product.category;
    previewText.textContent = product.description;
    previewCategory.classList.add(categoryClass);

    const addToBasketButton = previewElement.querySelector('.card__button') as HTMLElement;
    addToBasketButton.addEventListener('click', () => {
      this.events.emit(AppEvent.ProductAdded, product);
      this.closeModal();
    });

    const modalContent = this.modalElement.querySelector('.modal__content')!;
    modalContent.innerHTML = '';
    modalContent.appendChild(previewElement);
    this.openModal();
  }

  openModal(): void {
    this.modalElement.classList.add('modal_active');
  }

  closeModal(): void {
    this.modalElement.classList.remove('modal_active');
  }

  getCloseButton(): HTMLElement | null {
    return this.modalElement.querySelector('.modal__close');
  }

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