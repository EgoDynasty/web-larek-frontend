import { AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';

export class OrderPaymentView {
  private paymentContainer: HTMLElement;
  private addressInput: HTMLInputElement;
  private nextButton: HTMLButtonElement;
  private paymentButtons: NodeListOf<HTMLElement>;
  private errorsElement: HTMLElement;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;

    const template = document.querySelector<HTMLTemplateElement>('#order');
    if (!template) throw new Error('Template #order not found');
    this.paymentContainer = document.importNode(template.content, true).querySelector('.form') as HTMLElement;

    this.addressInput = this.paymentContainer.querySelector('input[name="address"]') as HTMLInputElement;
    this.nextButton = this.paymentContainer.querySelector('.order__button') as HTMLButtonElement;
    this.paymentButtons = this.paymentContainer.querySelectorAll('.button_alt');
    this.errorsElement = this.paymentContainer.querySelector('.form__errors') as HTMLElement;

    this.nextButton.disabled = true;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.paymentButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.paymentButtons.forEach((btn) => btn.classList.remove('button_alt-active'));
        button.classList.add('button_alt-active');
        const payment: 'online' | 'cash' = button.textContent === 'Онлайн' ? 'online' : 'cash';
        this.events.emit(AppEvent.PaymentSelected, { data: payment });
      });
    });

    this.addressInput.addEventListener('input', () => {
      this.events.emit(AppEvent.AddressChanged, { data: this.addressInput.value });
    });

    this.paymentContainer.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.nextButton.disabled) {
        this.events.emit(AppEvent.PaymentSubmitted);
      }
    });
  }

  setError(error: string): void {
    this.errorsElement.textContent = error;
  }

  setButtonState(isEnabled: boolean): void {
    this.nextButton.disabled = !isEnabled;
  }

  getContent(): HTMLElement {
    return this.paymentContainer;
  }
}