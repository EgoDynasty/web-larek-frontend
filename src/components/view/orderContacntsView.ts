import { AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';

export class OrderContactsView {
  private contactsContainer: HTMLElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private payButton: HTMLButtonElement;
  private errorsElement: HTMLElement;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;

    const template = document.querySelector<HTMLTemplateElement>('#contacts');
    if (!template) throw new Error('Template #contacts not found');
    this.contactsContainer = document.importNode(template.content, true).querySelector('.form') as HTMLElement;

    this.emailInput = this.contactsContainer.querySelector('input[name="email"]') as HTMLInputElement;
    this.phoneInput = this.contactsContainer.querySelector('input[name="phone"]') as HTMLInputElement;
    this.payButton = this.contactsContainer.querySelector('.button') as HTMLButtonElement;
    this.errorsElement = this.contactsContainer.querySelector('.form__errors') as HTMLElement;

    this.payButton.disabled = true;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.emailInput.addEventListener('input', () => {
      this.events.emit(AppEvent.EmailChanged, { data: this.emailInput.value });
    });

    this.phoneInput.addEventListener('input', () => {
      this.events.emit(AppEvent.PhoneChanged, { data: this.phoneInput.value });
    });

    this.contactsContainer.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.payButton.disabled) {
        this.events.emit(AppEvent.ContactsSubmitted);
      }
    });
  }

  setError(error: string): void {
    this.errorsElement.textContent = error;
  }

  setButtonState(isEnabled: boolean): void {
    this.payButton.disabled = !isEnabled;
  }

  getContent(): HTMLElement {
    return this.contactsContainer;
  }
}