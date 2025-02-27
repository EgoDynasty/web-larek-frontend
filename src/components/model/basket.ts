import { IProduct, AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';

export class Basket {
  private items: IProduct[] = [];
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const savedBasket = localStorage.getItem('basket');
    if (savedBasket) {
      this.items = JSON.parse(savedBasket);
      this.events.emit(AppEvent.BasketUpdated, this.items);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('basket', JSON.stringify(this.items));
  }

  addItem(product: IProduct): void {
    this.items.push(product);
    this.events.emit(AppEvent.BasketUpdated, this.items);
    this.saveToLocalStorage();
  }

  removeItem(productId: string): void {
    const index = this.items.findIndex(item => item.id === productId);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.events.emit(AppEvent.BasketUpdated, this.items);
      this.saveToLocalStorage();
    }
  }

  getItems(): IProduct[] {
    return this.items;
  }

  clear(): void {
    this.items = [];
    this.events.emit(AppEvent.BasketUpdated, this.items);
    this.saveToLocalStorage();
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price || 0), 0);
  }
}