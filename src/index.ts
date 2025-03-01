import './scss/styles.scss';
import { IProduct, IOrder, IOrderResponse, AppEvent } from './types/types';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Catalog } from './components/model/catalog';
import { Basket } from './components/model/basket';
import { OrderProcessor } from './components/model/orderprocessor';
import { BasketView } from './components/view/basketView';
import { BasketItemView } from './components/view/basketItemView';
import { CatalogView } from './components/view/catalogView';
import { ProductDetailsView } from './components/view/productDetailsView';
import { OrderSuccessView } from './components/view/orderSuccessVi';
import { OrderPaymentView } from './components/view/orderPaymentView';
import { OrderContactsView } from './components/view/orderContacntsView';
import { Modal } from './components/view/modal';

class Presenter {
  private readonly catalog: Catalog;
  private readonly basket: Basket;
  private readonly orderProcessor: OrderProcessor;
  private readonly events: EventEmitter;
  private readonly api: Api;
  private readonly modal: Modal;
  private readonly productDetailsView: ProductDetailsView;
  private readonly catalogView: CatalogView;
  private readonly basketView: BasketView;
  private readonly orderSuccessView: OrderSuccessView;
  private readonly orderPaymentView: OrderPaymentView;
  private readonly orderContactsView: OrderContactsView;

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
    this.modal = new Modal(events);
    this.productDetailsView = new ProductDetailsView(events);
    this.catalogView = new CatalogView(events);
    this.basketView = new BasketView(events);
    this.orderSuccessView = new OrderSuccessView();
    this.orderPaymentView = new OrderPaymentView(events);
    this.orderContactsView = new OrderContactsView(events);
    this.setupEventListeners();
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const response = await this.api.get('/product/');
      const products: IProduct[] = (response as { items: IProduct[] }).items;
      this.catalog.setProducts(products);
    } catch (error) {
      this.events.emit(AppEvent.ErrorOccurred, {
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  private setupEventListeners(): void {
    this.events.on(AppEvent.ProductListLoaded, () => {
      this.catalogView.renderProducts(this.catalog.getAllProducts());
    });
  
    this.events.on(AppEvent.ProductDetailsOpened, (product: IProduct) => {
      this.modal.setContent(this.productDetailsView.getContent());
      this.productDetailsView.renderProductDetails(product);
      this.modal.open();
    });
  
    this.events.on(AppEvent.ProductAdded, (product: IProduct) => {
      this.addToBasket(product);
      this.basketView.updateCounter(this.basket.getItems().length);
      this.basketView.updateTotalPrice(this.basket.getTotalPrice());
      this.basketView.setOrderButtonDisabled(this.basket.getTotalPrice() === 0);
      this.modal.close();
    });
  
    this.events.on(AppEvent.ProductRemoved, (event: { productId: string }) => {
      this.removeFromBasket(event.productId);
      this.basketView.updateCounter(this.basket.getItems().length);
      this.basketView.updateTotalPrice(this.basket.getTotalPrice());
      const items = this.basket.getItems().map((item, index) => {
        const basketItemView = new BasketItemView(item, (productId) => {
          this.events.emit(AppEvent.ProductRemoved, { productId });
        });
        basketItemView.setIndex(index + 1);
        return basketItemView.element;
      });
      this.basketView.setItems(items);
      this.basketView.setOrderButtonDisabled(this.basket.getTotalPrice() === 0);
    });
  
    this.events.on(AppEvent.BasketOpened, () => {
      const items = this.basket.getItems().map((item, index) => {
        const basketItemView = new BasketItemView(item, (productId) => {
          this.events.emit(AppEvent.ProductRemoved, { productId });
        });
        basketItemView.setIndex(index + 1);
        return basketItemView.element;
      });
      this.basketView.setItems(items);
      this.basketView.updateCounter(this.basket.getItems().length);
      this.basketView.updateTotalPrice(this.basket.getTotalPrice());
      this.basketView.setOrderButtonDisabled(this.basket.getTotalPrice() === 0);
      this.modal.setContent(this.basketView.getContent());
      this.modal.open();
    });
  
    this.events.on(AppEvent.OrderStarted, () => {
      this.modal.setContent(this.orderPaymentView.getContent());
      this.orderPaymentView.setButtonState(false);
      this.modal.open();
    });
  
    this.events.on(AppEvent.PaymentSelected, (event: { data: string }) => {
      this.orderProcessor.setPayment(event.data as 'online' | 'cash');
      const order = this.orderProcessor.getOrder();
      const isAddressValid = this.orderProcessor.validateAddress(order.address || '');
      this.orderPaymentView.setButtonState(isAddressValid);
    });
  
    this.events.on(AppEvent.AddressChanged, (event: { data: string }) => {
      this.orderProcessor.setAddress(event.data);
    });
  
    this.events.on(AppEvent.AddressUpdated, (event: { address: string; isValid: boolean; error: string }) => {
      this.orderPaymentView.setError(event.error);
      const order = this.orderProcessor.getOrder();
      const isPaymentSelected = order.payment !== null;
      this.orderPaymentView.setButtonState(event.isValid && isPaymentSelected);
    });
  
    this.events.on(AppEvent.PaymentSubmitted, () => {
      const order = this.orderProcessor.getOrder();
      const isAddressValid = this.orderProcessor.validateAddress(order.address || '');
      const isPaymentSelected = order.payment !== null;
      if (isAddressValid && isPaymentSelected) {
        this.modal.setContent(this.orderContactsView.getContent());
        this.orderContactsView.setButtonState(false);
      }
    });
  
    this.events.on(AppEvent.EmailChanged, (event: { data: string }) => {
      this.orderProcessor.setEmail(event.data);
    });
  
    this.events.on(AppEvent.PhoneChanged, (event: { data: string }) => {
      this.orderProcessor.setPhone(event.data);
    });
  
    this.events.on(AppEvent.EmailUpdated, (event: { email: string; isValid: boolean; error: string }) => {
      if (!event.isValid) this.orderContactsView.setError(event.error);
      const order = this.orderProcessor.getOrder();
      const isPhoneValid = this.orderProcessor.validatePhone(order.phone || '');
      this.orderContactsView.setButtonState(event.isValid && isPhoneValid);
    });
  
    this.events.on(AppEvent.PhoneUpdated, (event: { phone: string; isValid: boolean; error: string }) => {
      if (!event.isValid) this.orderContactsView.setError(event.error);
      const order = this.orderProcessor.getOrder();
      const isEmailValid = this.orderProcessor.validateEmail(order.email || '');
      this.orderContactsView.setButtonState(event.isValid && isEmailValid);
    });
  
    this.events.on(AppEvent.ContactsSubmitted, () => {
      if (this.orderProcessor.isOrderValid()) {
        const order: IOrder = {
          ...this.orderProcessor.getOrder(),
          total: this.basket.getTotalPrice(),
          items: this.basket.getItems().map((item) => item.id),
        } as IOrder;
        this.api
          .createOrder(order)
          .then((response) => {
            this.basket.clear();
            this.modal.setContent(this.orderSuccessView.getContent());
            this.orderSuccessView.render(response);
            this.events.emit(AppEvent.OrderCreated, response);
            console.log(order)
          })
          .catch((error) => {
            this.events.emit(AppEvent.ErrorOccurred, {
              message: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
          });
      }
    });
  
    this.events.on(AppEvent.OrderCreated, (order: IOrderResponse) => {
      this.modal.setContent(this.orderSuccessView.getContent());
      this.orderSuccessView.render(order);
    });
  }

  private addToBasket(product: IProduct): void {
    this.basket.addItem(product);
  }

  private removeFromBasket(productId: string): void {
    this.basket.removeItem(productId);
  }
}

// Инициализация
const api = new Api('https://larek-api.nomoreparties.co/api/weblarek');
const events = new EventEmitter();
const catalog = new Catalog(events);
const basket = new Basket(events);
const orderProcessor = new OrderProcessor(events);
const presenter = new Presenter(catalog, basket, orderProcessor, events, api);