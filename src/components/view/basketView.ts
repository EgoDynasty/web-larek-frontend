import { IProduct } from '../../types/types';
import { BasketItemView } from './basketItemView';
import { Modal } from './modal';
import { EventEmitter } from '../base/events';
import { AppEvent } from '../../types/types';

export class BasketView {
  private modal: Modal;
  private counterElement: HTMLElement;
  private totalPriceElement: HTMLElement;
  private basketListElement: HTMLElement;
  private orderButtonElement: HTMLButtonElement;
  private basketButton: HTMLElement | null;
  private events: EventEmitter;
  private onDeleteItem?: (productId: string) => void;

  constructor(events: EventEmitter) {
    this.events = events;
    this.modal = new Modal({
      templateId: 'basket',
      onClose: () => this.handleClose(),
    });

    const modalElement = this.modal.getModalElement();
    this.counterElement = document.querySelector('.header__basket-counter')!;
    this.totalPriceElement = modalElement.querySelector('.basket__price')!;
    this.basketListElement = modalElement.querySelector('.basket__list')!;
    this.orderButtonElement = modalElement.querySelector('.basket__button') as HTMLButtonElement;
    this.basketButton = document.querySelector('.header__basket');

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

  setBasketItems(items: IProduct[]): void {
    this.render(items);
  }

  setOnDeleteItemCallback(callback: (productId: string) => void): void {
    this.onDeleteItem = callback;
  }

  render(items: IProduct[]): void {
    this.basketListElement.innerHTML = '';

    items.forEach((item, index) => {
      const basketItem = new BasketItemView({ ...item, index }, this.onDeleteItem);
      this.basketListElement.appendChild(basketItem.element);
    });

    this.updateCounter(items.length);
    this.updateTotalPrice(this.calculateTotalPrice(items));
    this.setOrderButtonDisabled(this.calculateTotalPrice(items) === 0);
  }

  updateCounter(count: number): void {
    this.counterElement.textContent = count.toString();
  }

  updateTotalPrice(totalPrice: number): void {
    this.totalPriceElement.textContent = `${totalPrice} синапсов`;
  }

  calculateTotalPrice(items: IProduct[]): number {
    return items.reduce((total, item) => total + (item.price || 0), 0);
  }

  open(): void {
    this.modal.open();
  }

  close(): void {
    this.modal.close();
  }

  getModal(): Modal {
    return this.modal;
  }

  private handleClose(): void {}
}