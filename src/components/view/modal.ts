export class Modal {
    private modalElement: HTMLElement;
    private closeButton: HTMLElement | null;
    private contentContainer: HTMLElement | null;
  
    constructor(options: {
      templateId?: string;
      content?: HTMLElement | DocumentFragment;
      onClose?: () => void;
    }) {
      this.modalElement = this.createModal(options);
      this.contentContainer = this.modalElement.querySelector('.modal__content');
      this.closeButton = this.modalElement.querySelector('.modal__close');
  
      this.bindEvents(options.onClose);
    }
  
    open(): void {
      this.modalElement.classList.add('modal_active');
      // Убрали document.body.style.overflow = 'hidden';
    }
  
    close(): void {
      this.modalElement.classList.remove('modal_active');
      // Убрали document.body.style.overflow = '';
    }
  
    setContent(content: HTMLElement | DocumentFragment): void {
      if (this.contentContainer) {
        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(content);
      }
    }
  
    getModalElement(): HTMLElement {
      return this.modalElement;
    }
  
    private createModal(options: {
      templateId?: string;
      content?: HTMLElement | DocumentFragment;
    }): HTMLElement {
      const modalContainer = document.createElement('div');
      modalContainer.classList.add('modal');
  
      const modalInner = document.createElement('div');
      modalInner.classList.add('modal__container');
  
      const closeBtn = document.createElement('button');
      closeBtn.classList.add('modal__close');
      closeBtn.setAttribute('aria-label', 'закрыть');
  
      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('modal__content');
  
      if (options.templateId) {
        const template = document.querySelector<HTMLTemplateElement>(
          `#${options.templateId}`
        );
        if (!template) {
          throw new Error(`Template with id ${options.templateId} not found`);
        }
        const clone = document.importNode(template.content, true);
        contentWrapper.appendChild(clone);
      } else if (options.content) {
        contentWrapper.appendChild(options.content);
      }
  
      modalInner.append(closeBtn, contentWrapper);
      modalContainer.appendChild(modalInner);
      document.body.appendChild(modalContainer);
  
      return modalContainer;
    }
  
    private bindEvents(onClose?: () => void): void {
      if (this.closeButton) {
        this.closeButton.addEventListener('click', () => {
          this.close();
          onClose?.();
        });
      }
  
      this.modalElement.addEventListener('click', (event) => {
        if (event.target === this.modalElement) {
          this.close();
          onClose?.();
        }
      });
  
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.modalElement.classList.contains('modal_active')) {
          this.close();
          onClose?.();
        }
      });
    }
  
    destroy(): void {
      this.modalElement.remove();
    }
  }