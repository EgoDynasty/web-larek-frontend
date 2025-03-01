import { EventEmitter } from '../base/events';

export class CatalogView {
  private galleryElement: HTMLElement;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) {
      throw new Error('Gallery element not found');
    }
    this.galleryElement = gallery as HTMLElement;
    this.events = events;
  }

  setProducts(cards: HTMLElement[]): void {
    this.galleryElement.innerHTML = '';
    if (cards.length === 0) {
      this.galleryElement.innerHTML = '<p>Товары не найдены</p>';
      return;
    }
    cards.forEach(card => this.galleryElement.appendChild(card));
  }
}