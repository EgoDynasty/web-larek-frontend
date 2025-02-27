import './scss/styles.scss';
import { IProduct, IOrder, IOrderResponse, AppEvent } from './types/types';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Catalog } from './components/model/catalog';
import { Basket } from './components/model/basket';
import { OrderProcessor } from './components/model/orderprocessor';
import { BasketView } from './components/view/basketView';  
import { CatalogView } from './components/view/catalogView';
import { ProductDetailsView } from './components/view/productDetailsView';
import { OrderSuccessView } from './components/view/orderSuccessview';

enum PaymentMethod {
  Online = 'online',
  Cash = 'cash'
}

function createModalFromTemplate(templateId: string): HTMLElement {
    const template = document.querySelector<HTMLTemplateElement>(`#${templateId}`);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }
  
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal');
  
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal__content');
  
    const clone = document.importNode(template.content, true);
    modalContent.appendChild(clone);
  
    modalContainer.appendChild(modalContent);
  
    document.body.appendChild(modalContainer);
  
    return modalContainer;
}

// Presenter
class Presenter {
    private catalog: Catalog;
    private basket: Basket;
    private orderProcessor: OrderProcessor;
    private events: EventEmitter;
    private api: Api;
    private productDetailsView: ProductDetailsView;
    private catalogView: CatalogView;
    private basketView: BasketView;
    private orderSuccessView: OrderSuccessView;
  
    private currentPaymentMethod: PaymentMethod | null = null;
    private currentOrder: IOrder | null = null;
  
    constructor(catalog: Catalog, basket: Basket, orderProcessor: OrderProcessor, events: EventEmitter, api: Api) {
      this.catalog = catalog;
      this.basket = basket;
      this.orderProcessor = orderProcessor;
      this.events = events;
      this.api = api;
      this.productDetailsView = new ProductDetailsView(events);
      this.catalogView = new CatalogView();
      this.basketView = new BasketView();
      this.orderSuccessView = new OrderSuccessView();
      this.init();
    }
  
    private async init(): Promise<void> {
      try {
        const products = await this.catalog.getAllProducts();
        this.events.emit(AppEvent.ProductListLoaded, products);
        this.catalogView.renderProducts(products);
  
        this.basketView.render(this.basket.getItems());
        this.basketView.updateCounter(this.basket.getItems().length);
        this.basketView.updateTotalPrice(this.basket.getTotalPrice());
  
        this.basketView.setOnDeleteItemCallback((productId) => {
          this.removeFromBasket(productId);
        });
  
        this.setupEventListeners();
      } catch (error) {
        this.events.emit(AppEvent.ErrorOccurred, { message: error instanceof Error ? error.message : "Неизвестная ошибка" });
      }
    }
  
    private setupEventListeners(): void {
      this.catalogView.galleryElement.addEventListener('click', (event) => {
        const cardElement = (event.target as HTMLElement).closest('.gallery__item') as HTMLElement;
        if (cardElement) {
          const productId = cardElement.dataset.id;
          const product = this.catalog.getProductById(productId);
          if (product) {
            this.productDetailsView.renderProductDetails(product);
  
            const closeButton = this.productDetailsView.getCloseButton();
            if (closeButton) {
              closeButton.addEventListener('click', () => this.productDetailsView.closeModal());
            }
          }
        }
      });
  
      this.events.on(AppEvent.ProductAdded, (product: IProduct) => {
        this.addToBasket(product);
      });
  
      this.events.on(AppEvent.ProductRemoved, (event: { productId: string }) => {
        this.removeFromBasket(event.productId);
      });
  
      this.events.on(AppEvent.OrderCreated, (order: IOrderResponse) => {
        this.orderSuccessView.render(order);
      });
  
      const basketButton = document.querySelector('.header__basket');
      if (basketButton) {
        basketButton.addEventListener('click', () => {
          this.basketView.render(this.basket.getItems());
          this.basketView.openModal();
  
          const basketCloseButton = this.basketView.getModalElement().querySelector('.modal__close');
          if (basketCloseButton) {
            basketCloseButton.addEventListener('click', () => this.basketView.closeModal());
          }
  
          const orderButton = this.basketView.getOrderButton();
          if (orderButton) {
            orderButton.addEventListener('click', () => this.openPaymentModal());
          }
        });
      }
    }
  
    private closeAllModals(): void {
      const activeModals = document.querySelectorAll('.modal_active');
      activeModals.forEach(modal => {
        modal.classList.remove('modal_active');
      });
    }
  
    private openPaymentModal(): void {
      this.closeAllModals();
  
      const paymentModal = createModalFromTemplate('order');
      paymentModal.classList.add('modal_active');
    
      const closeButton = paymentModal.querySelector('.modal__close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          paymentModal.classList.remove('modal_active');
        });
      }
    
      const addressInput = paymentModal.querySelector('input[name="address"]') as HTMLInputElement;
      const nextButton = paymentModal.querySelector('.order__button') as HTMLButtonElement;
      const errorsElement = paymentModal.querySelector('.form__errors') as HTMLElement;
    
      if (!errorsElement) {
        return;
      }
    
      if (nextButton) {
        nextButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.validatePaymentStep(paymentModal);
        });
      }
    
      const paymentButtons = paymentModal.querySelectorAll('.button_alt');
      paymentButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.handlePaymentMethodSelection(button, paymentButtons);
          this.updateNextButtonState(addressInput, nextButton);
        });
      });
    
      if (addressInput) {
        addressInput.addEventListener('input', () => {
          this.validateAddressInRealTime(addressInput, errorsElement);
          this.updateNextButtonState(addressInput, nextButton);
        });
      }
    
      if (nextButton) {
        nextButton.disabled = true;
      }
    }
    
    private validateAddressInRealTime(addressInput: HTMLInputElement, errorsElement: HTMLElement): void {
      if (!addressInput || !addressInput.value.trim()) {
        errorsElement.textContent = 'Введите адрес доставки';
        return;
      }
    
      if (addressInput.value.trim().length < 10) {
        errorsElement.textContent = 'Адрес должен содержать минимум 10 символов';
        return;
      }
    
      errorsElement.textContent = '';
    }
  
    private updateNextButtonState(addressInput: HTMLInputElement, nextButton: HTMLButtonElement): void {
      const isPaymentMethodSelected = this.currentPaymentMethod !== null;
      const isAddressFilled = addressInput.value.trim() !== '' && addressInput.value.trim().length >= 10;
  
      nextButton.disabled = !(isPaymentMethodSelected && isAddressFilled);
    }
  
    private handlePaymentMethodSelection(selectedButton: Element, allButtons: NodeListOf<Element>): void {
      allButtons.forEach(button => {
        button.classList.remove('button_alt-active');
      });
  
      selectedButton.classList.add('button_alt-active');
  
      if (selectedButton.textContent === 'Онлайн') {
        this.currentPaymentMethod = PaymentMethod.Online;
      } else if (selectedButton.textContent === 'При получении') {
        this.currentPaymentMethod = PaymentMethod.Cash;
      }
    }
  
    private validatePaymentStep(paymentModal: HTMLElement): void {
        const addressInput = paymentModal.querySelector('input[name="address"]') as HTMLInputElement;
        const errorsElement = paymentModal.querySelector('.form__errors') as HTMLElement;
    
        if (!errorsElement) {
            return;
        }
    
        if (!addressInput || !addressInput.value.trim()) {
            errorsElement.textContent = 'Введите адрес доставки';
            return;
        }
    
        if (addressInput.value.trim().length < 10) {
            errorsElement.textContent = 'Адрес должен содержать минимум 10 символов';
            return;
        }
    
        errorsElement.textContent = '';
    
        this.currentOrder = {
            ...this.currentOrder,
            address: addressInput.value.trim(),
        };
    
        paymentModal.classList.remove('modal_active');
    
        this.openContactsModal();
    }
    
      private openContactsModal(): void {
        this.closeAllModals();
  
        const contactsModal = createModalFromTemplate('contacts');
        contactsModal.classList.add('modal_active');
      
        const closeButton = contactsModal.querySelector('.modal__close');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            contactsModal.classList.remove('modal_active');
          });
        }
      
        const emailInput = contactsModal.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = contactsModal.querySelector('input[name="phone"]') as HTMLInputElement;
        const errorsElement = contactsModal.querySelector('.form__errors') as HTMLElement;
        const payButton = contactsModal.querySelector('.button') as HTMLButtonElement;
      
        if (!errorsElement || !payButton) {
          return;
        }
      
        payButton.disabled = true;
      
        if (emailInput) {
          emailInput.addEventListener('input', () => {
            this.validateEmailInRealTime(emailInput, errorsElement);
            this.updatePayButtonState(emailInput, phoneInput, payButton);
          });
        }
      
        if (phoneInput) {
          phoneInput.addEventListener('input', () => {
            this.validatePhoneInRealTime(phoneInput, errorsElement);
            this.updatePayButtonState(emailInput, phoneInput, payButton);
          });
        }
      
        payButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.validateContactsStep(contactsModal);
        });
      }
      
      private validateEmailInRealTime(emailInput: HTMLInputElement, errorsElement: HTMLElement): void {
        if (!emailInput || !emailInput.value.trim() || !emailInput.value.includes('@')) {
          errorsElement.textContent = 'Введите корректный email';
          return;
        }
      
        errorsElement.textContent = '';
      }
      
      private validatePhoneInRealTime(phoneInput: HTMLInputElement, errorsElement: HTMLElement): void {
        const cleanedPhone = phoneInput.value.replace(/[^\d+]/g, '');
      
        if (!cleanedPhone.match(/^(\+7|8)\d{10}$/)) {
          errorsElement.textContent = 'Некорректный номер телефона';
          return;
        }
      
        errorsElement.textContent = '';
      }
  
      private updatePayButtonState(emailInput: HTMLInputElement, phoneInput: HTMLInputElement, payButton: HTMLButtonElement): void {
        const isEmailValid = this.orderProcessor.validateEmail(emailInput.value.trim());
        const isPhoneValid = this.orderProcessor.validatePhone(phoneInput.value);
      
        payButton.disabled = !(isEmailValid && isPhoneValid);
      }
  
      private validateContactsStep(contactsModal: HTMLElement): void {
        const emailInput = contactsModal.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = contactsModal.querySelector('input[name="phone"]') as HTMLInputElement;
        const errorsElement = contactsModal.querySelector('.form__errors') as HTMLElement;
        const payButton = contactsModal.querySelector('.button') as HTMLButtonElement;
    
        if (!errorsElement || !payButton) {
            return;
        }
    
        if (!emailInput || !emailInput.value.trim() || !emailInput.value.includes('@')) {
            errorsElement.textContent = 'Введите корректный email';
            return;
        }
    
        if (!phoneInput || !this.orderProcessor.validatePhone(phoneInput.value)) {
            errorsElement.textContent = 'Введите корректный номер телефона';
            return;
        }
    
        errorsElement.textContent = '';
    
        const order: IOrder = {
            payment: this.currentPaymentMethod || PaymentMethod.Online,
            address: this.currentOrder?.address || '',
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            total: this.basket.getTotalPrice(),
            items: this.basket.getItems().map(item => item.id),
        };

        console.log(order)

        this.api.createOrder(order)
            .then((response) => {
                contactsModal.classList.remove('modal_active');
                this.basket.clear();
                this.basketView.render(this.basket.getItems());
                this.basketView.updateCounter(this.basket.getItems().length);
                this.basketView.updateTotalPrice(this.basket.getTotalPrice());
                this.orderSuccessView.render(response);
                this.closeAllModals();
                this.orderSuccessView.openModal();
    
                const successCloseButton = this.orderSuccessView.getModalElement().querySelector('.order-success__close');
                if (successCloseButton) {
                    successCloseButton.addEventListener('click', () => {
                        this.orderSuccessView.closeModal();
                    });
                }
            })
            .catch((error) => {
                this.events.emit(AppEvent.ErrorOccurred, { message: error instanceof Error ? error.message : "Неизвестная ошибка" });
            });
    }
  
    private createOrder(): void {
      const order: IOrder = {
        payment: this.currentPaymentMethod || PaymentMethod.Online,
        address: '',
        email: '',
        phone: '',
        total: this.basket.getTotalPrice(),
        items: this.basket.getItems().map(item => item.id),
      };
  
      this.api.createOrder(order)
        .then((response) => {
          this.events.emit(AppEvent.OrderCreated, response);
          this.basket.clear();
          this.basketView.render(this.basket.getItems());
          this.basketView.updateCounter(this.basket.getItems().length);
          this.basketView.updateTotalPrice(this.basket.getTotalPrice());
        })
        .catch((error) => {
          this.events.emit(AppEvent.ErrorOccurred, { message: error instanceof Error ? error.message : "Неизвестная ошибка" });
        });
    }
  
    private addToBasket(product: IProduct): void {
      this.basket.addItem(product);
      this.basketView.render(this.basket.getItems());
      this.basketView.updateCounter(this.basket.getItems().length);
      this.basketView.updateTotalPrice(this.basket.getTotalPrice());
    }
  
    private removeFromBasket(productId: string): void {
      this.basket.removeItem(productId);
      this.basketView.render(this.basket.getItems());
      this.basketView.updateCounter(this.basket.getItems().length);
      this.basketView.updateTotalPrice(this.basket.getTotalPrice());
    }
}

// Инициализация
const api = new Api('https://larek-api.nomoreparties.co/api/weblarek');
const events = new EventEmitter();

const catalog = new Catalog(api, events);
const basket = new Basket(events);
const orderProcessor = new OrderProcessor(events);

catalog.loadProducts();

const presenter = new Presenter(catalog, basket, orderProcessor, events, api);