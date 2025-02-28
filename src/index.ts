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
import { OrderSuccessView } from './components/view/orderSuccessView';
import { OrderPaymentView } from './components/view/orderPaymentView';
import { OrderContactsView } from './components/view/orderContacntsView';

enum PaymentMethod {
  Online = 'online',
  Cash = 'cash',
}

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
  private orderPaymentView: OrderPaymentView;
  private orderContactsView: OrderContactsView;

  private currentPaymentMethod: PaymentMethod | null = null;
  private currentOrder: IOrder | null = null;

  constructor(
    catalog: Catalog,
    basket: Basket,
    orderProcessor: OrderProcessor,
    events: EventEmitter,
    api: Api
  ) {
    this.catalog = catalog;
    this.basket = basket;
    this.orderProcessor = orderProcessor;
    this.events = events;
    this.api = api;
    this.productDetailsView = new ProductDetailsView(events);
    this.catalogView = new CatalogView(events);
    this.basketView = new BasketView(events);
    this.orderSuccessView = new OrderSuccessView();
    this.orderPaymentView = new OrderPaymentView();
    this.orderContactsView = new OrderContactsView();
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const response = await this.api.get('/product/');
      const products: IProduct[] = (response as { items: IProduct[] }).items;
      console.log('Products from API:', products);

      this.catalog.setProducts(products);
      this.catalogView.renderProducts(products);
      this.basketView.render(this.basket.getItems());

      this.basketView.setOnDeleteItemCallback((productId) => {
        this.removeFromBasket(productId);
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Error loading catalog:', error);
      this.events.emit(AppEvent.ErrorOccurred, {
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  private setupEventListeners(): void {
    this.events.on(AppEvent.ProductDetailsOpened, (product: IProduct) => {
      this.productDetailsView.renderProductDetails(product);
    });

    this.events.on(AppEvent.ProductAdded, (product: IProduct) => {
      this.addToBasket(product);
    });

    this.events.on(AppEvent.ProductRemoved, (event: { productId: string }) => {
      this.removeFromBasket(event.productId);
    });

    this.events.on(AppEvent.BasketOpened, () => {
      this.basketView.render(this.basket.getItems());
      this.basketView.open();
    });

    this.events.on(AppEvent.OrderStarted, () => {
      this.openPaymentModal();
    });

    this.events.on(AppEvent.OrderCreated, (order: IOrderResponse) => {
      this.orderSuccessView.render(order);
    });

    this.orderPaymentView.setOnNextButtonClick(() => this.validatePaymentStep());
    this.orderContactsView.setOnPayButtonClick(() => this.validateContactsStep());
  }

  private openPaymentModal(): void {
    this.basketView.close();
    this.orderPaymentView.render();

    const paymentModal = this.orderPaymentView.getModal().getModalElement();
    const addressInput = paymentModal.querySelector('input[name="address"]') as HTMLInputElement;
    const nextButton = paymentModal.querySelector('.order__button') as HTMLButtonElement;
    const errorsElement = paymentModal.querySelector('.form__errors') as HTMLElement;

    if (!errorsElement) return;

    const paymentButtons = paymentModal.querySelectorAll('.button_alt');
    paymentButtons.forEach((button) => {
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
    allButtons.forEach((button) => button.classList.remove('button_alt-active'));
    selectedButton.classList.add('button_alt-active');
    this.currentPaymentMethod = selectedButton.textContent === 'Онлайн' ? PaymentMethod.Online : PaymentMethod.Cash;
  }

  private validatePaymentStep(): void {
    const paymentModal = this.orderPaymentView.getModal().getModalElement();
    const addressInput = paymentModal.querySelector('input[name="address"]') as HTMLInputElement;
    const errorsElement = paymentModal.querySelector('.form__errors') as HTMLElement;

    if (!errorsElement) return;

    if (!addressInput || !addressInput.value.trim()) {
      errorsElement.textContent = 'Введите адрес доставки';
      return;
    }

    if (addressInput.value.trim().length < 10) {
      errorsElement.textContent = 'Адрес должен содержать минимум 10 символов';
      return;
    }

    errorsElement.textContent = '';
    this.currentOrder = { ...this.currentOrder, address: addressInput.value.trim() };
    this.orderPaymentView.close();
    this.openContactsModal();
  }

  private openContactsModal(): void {
    this.orderContactsView.render();

    const contactsModal = this.orderContactsView.getModal().getModalElement();
    const emailInput = contactsModal.querySelector('input[name="email"]') as HTMLInputElement;
    const phoneInput = contactsModal.querySelector('input[name="phone"]') as HTMLInputElement;
    const errorsElement = contactsModal.querySelector('.form__errors') as HTMLElement;
    const payButton = contactsModal.querySelector('.button') as HTMLButtonElement;

    if (!errorsElement || !payButton) return;

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

  private updatePayButtonState(
    emailInput: HTMLInputElement,
    phoneInput: HTMLInputElement,
    payButton: HTMLButtonElement
  ): void {
    const isEmailValid = this.orderProcessor.validateEmail(emailInput.value.trim());
    const isPhoneValid = this.orderProcessor.validatePhone(phoneInput.value);
    payButton.disabled = !(isEmailValid && isPhoneValid);
  }

  private validateContactsStep(): void {
    const contactsModal = this.orderContactsView.getModal().getModalElement();
    const emailInput = contactsModal.querySelector('input[name="email"]') as HTMLInputElement;
    const phoneInput = contactsModal.querySelector('input[name="phone"]') as HTMLInputElement;
    const errorsElement = contactsModal.querySelector('.form__errors') as HTMLElement;

    if (!errorsElement) return;

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
      items: this.basket.getItems().map((item) => item.id),
    };

    this.api
      .createOrder(order)
      .then((response) => {
        this.orderContactsView.close();
        this.basket.clear();
        this.basketView.render(this.basket.getItems());
        this.orderSuccessView.render(response);
        console.log(order)
      })
      .catch((error) => {
        this.events.emit(AppEvent.ErrorOccurred, {
          message: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
      });
  }

  private addToBasket(product: IProduct): void {
    this.basket.addItem(product);
    this.basketView.render(this.basket.getItems());
  }

  private removeFromBasket(productId: string): void {
    this.basket.removeItem(productId);
    this.basketView.render(this.basket.getItems());
  }
}

// Инициализация
const api = new Api('https://larek-api.nomoreparties.co/api/weblarek');
const events = new EventEmitter();
const catalog = new Catalog(events);
const basket = new Basket(events);
const orderProcessor = new OrderProcessor(events);
const presenter = new Presenter(catalog, basket, orderProcessor, events, api);