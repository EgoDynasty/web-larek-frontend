import { EventEmitter } from '../base/events';

export class Modal {
  private modalElement: HTMLElement;
  private closeButton: HTMLElement | null;
  private contentContainer: HTMLElement | null;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
    this.modalElement = document.querySelector('.modal')!;
    this.closeButton = this.modalElement.querySelector('.modal__close');
    this.contentContainer = this.modalElement.querySelector('.modal__content');

    this.bindEvents();
  }

  open(): void {
    this.modalElement.classList.add('modal_active');
    document.addEventListener('keydown', this.handleEscape);
  }

  close(): void {
    this.modalElement.classList.remove('modal_active');
    document.removeEventListener('keydown', this.handleEscape);
  }

  setContent(content: HTMLElement): void {
    if (this.contentContainer) {
      this.contentContainer.innerHTML = '';
      this.contentContainer.appendChild(content);
    }
  }

  private bindEvents(): void {
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    this.modalElement.addEventListener('click', (event) => {
      if (event.target === this.modalElement) {
        this.close();
      }
    });
  }

  private handleEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.modalElement.classList.contains('modal_active')) {
      this.close();
    }
  };
}