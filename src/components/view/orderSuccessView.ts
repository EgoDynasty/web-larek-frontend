import { IOrderResponse, AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';

export class OrderSuccessView {
  private content: HTMLElement;
  private titleElement: HTMLElement;
  private descriptionElement: HTMLElement;
  private closeButton: HTMLButtonElement;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
    const template = document.querySelector<HTMLTemplateElement>('#success');
    if (!template) throw new Error('Template #success not found');
    this.content = document.importNode(template.content, true).querySelector('.order-success') as HTMLElement;

    const title = this.content.querySelector('.order-success__title');
    const description = this.content.querySelector('.order-success__description');
    const close = this.content.querySelector('.order-success__close');

    if (!title || !description || !close) {
      throw new Error('Required elements not found in success template');
    }

    this.titleElement = title as HTMLElement;
    this.descriptionElement = description as HTMLElement;
    this.closeButton = close as HTMLButtonElement;

    this.setupEventListeners();
  }

  render(order: IOrderResponse): void {
    this.titleElement.textContent = 'Заказ оформлен!';
    this.descriptionElement.textContent = `Списано ${order.total} синапсов`;
  }

  private setupEventListeners(): void {   
    this.closeButton.addEventListener('click', () => {
      this.events.emit(AppEvent.ModalClose);
    });
  }

  getContent(): HTMLElement {
    return this.content;
  }
}