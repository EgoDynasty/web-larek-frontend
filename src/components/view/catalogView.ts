import { IProduct } from '../../types/types';

export class CatalogView {
  public galleryElement: HTMLElement;
  private baseUrl: string;

  constructor() {
    this.galleryElement = document.querySelector('.gallery')!;
    this.baseUrl = 'https://larek-api.nomoreparties.co/content/weblarek';
  }

  renderProducts(products: IProduct[]): void {
    this.galleryElement.innerHTML = '';
    products.forEach(product => {
      const cardTemplate = document.querySelector<HTMLTemplateElement>('#card-catalog')!;
      const cardElement = document.importNode(cardTemplate.content, true);

      const cardTitle = cardElement.querySelector('.card__title')!;
      const cardImage = cardElement.querySelector('.card__image')! as HTMLImageElement;
      const cardPrice = cardElement.querySelector('.card__price')!;
      const cardCategory = cardElement.querySelector('.card__category')!;
      const categoryClass = this.getCategoryClass(product.category);

      cardTitle.textContent = product.title;
      cardImage.src = `${this.baseUrl}${product.image}`;
      if (product.price === null) {
        cardPrice.textContent = `Бесценно`;
      } else {
        cardPrice.textContent = `${product.price} синапсов`;
      }
      cardCategory.textContent = product.category;
      cardCategory.classList.add(categoryClass);

      const cardButton = cardElement.querySelector('.gallery__item') as HTMLElement;
      cardButton.dataset.id = product.id;

      this.galleryElement.appendChild(cardElement);
    });
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
}