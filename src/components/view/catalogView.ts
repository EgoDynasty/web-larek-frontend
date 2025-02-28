import { IProduct } from '../../types/types';
import { ProductCardView } from './productCardView';
import { EventEmitter } from '../base/events';

export class CatalogView {
  public galleryElement: HTMLElement;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.galleryElement = document.querySelector('.gallery')!;
    this.events = events;
  }

  renderProducts(products: IProduct[]): void {
    if (!products || products.length === 0) {
      this.galleryElement.innerHTML = '<p>Товары не найдены</p>';
      return;
    }

    this.galleryElement.innerHTML = '';
    products.forEach((product) => {
      const cardView = new ProductCardView(product, this.events);
      this.galleryElement.appendChild(cardView.getElement());
    });
  }
}