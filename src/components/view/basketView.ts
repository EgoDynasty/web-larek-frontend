import { AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';

export class BasketView {
  private counterElement: HTMLElement;
  private basketButton: HTMLElement | null;
  private basketContainer: HTMLElement;
  private totalPriceElement: HTMLElement;
  private basketListElement: HTMLElement;
  private orderButtonElement: HTMLButtonElement;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
    this.counterElement = document.querySelector('.header__basket-counter')!;
    this.basketButton = document.querySelector('.header__basket');

    const template = document.querySelector<HTMLTemplateElement>('#basket');
    if (!template) throw new Error('Template #basket not found');
    this.basketContainer = document.importNode(template.content, true).querySelector('.basket') as HTMLElement;

    this.basketListElement = this.basketContainer.querySelector('.basket__list')!;
    this.totalPriceElement = this.basketContainer.querySelector('.basket__price')!;
    this.orderButtonElement = this.basketContainer.querySelector('.basket__button') as HTMLButtonElement;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (this.basketButton) {
      this.basketButton.addEventListener('click', () => {
        this.events.emit(AppEvent.BasketOpened);
      });
    }

    this.orderButtonElement.addEventListener('click', () => {
      this.events.emit(AppEvent.OrderStarted);
    });
  }

  setOrderButtonDisabled(isDisabled: boolean): void {
    this.orderButtonElement.disabled = isDisabled;
  }

  setItems(items: HTMLElement[]): void {
    this.basketListElement.innerHTML = '';
    items.forEach(item => this.basketListElement.appendChild(item));
  }

  updateCounter(count: number): void {
    this.counterElement.textContent = count.toString();
  }

  updateTotalPrice(totalPrice: number): void {
    this.totalPriceElement.textContent = `${totalPrice} синапсов`;
  }

  getContent(): HTMLElement {
    return this.basketContainer;
  }
}