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
import { ProductCardView } from './components/view/productCardView';
import { ProductDetailsView } from './components/view/productDetailsView';
import { OrderSuccessView } from './components/view/orderSuccessView';
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
  private currentModalContent: HTMLElement | null = null;

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
    this.orderSuccessView = new OrderSuccessView(events);
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
      this.updateBasketUI(this.basket.getItems());
    } catch (error) {
      this.events.emit(AppEvent.ErrorOccurred, {
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  private setupEventListeners(): void {
    this.events.on(AppEvent.ProductListLoaded, () => {
      const products = this.catalog.getAllProducts();
      const cards = products.map(product => {
        const cardView = new ProductCardView(product, this.events);
        return cardView.getElement();
      });
      this.catalogView.setProducts(cards);
    });

    this.events.on(AppEvent.ProductDetailsOpened, (product: IProduct) => {
      const content = this.productDetailsView.getContent();
      this.modal.setContent(content);
      this.currentModalContent = content;
      this.productDetailsView.renderProductDetails(product);
      this.modal.open();
    });

    this.events.on(AppEvent.ProductAdded, (product: IProduct) => {
      this.addToBasket(product);
      this.modal.close();
    });

    this.events.on(AppEvent.ProductRemoved, (event: { productId: string }) => {
      this.removeFromBasket(event.productId);
    });

    this.events.on(AppEvent.BasketUpdated, (items: IProduct[]) => {
      this.updateBasketUI(items);
    });

    this.events.on(AppEvent.BasketOpened, () => {
      const content = this.basketView.getContent();
      this.modal.setContent(content);
      this.currentModalContent = content;
      this.modal.open();
    });

    this.events.on(AppEvent.OrderStarted, () => {
      const content = this.orderPaymentView.getContent();
      this.modal.setContent(content);
      this.currentModalContent = content;
      this.orderPaymentView.setButtonState(false);
      this.modal.open();
    });

    this.events.on(AppEvent.PaymentSelected, (event: { data: string }) => {
      this.orderProcessor.setPayment(event.data as 'online' | 'cash');
      const { isValid, errors } = this.orderProcessor.validatePaymentForm();
      this.orderPaymentView.setButtonState(isValid);
      this.orderPaymentView.setError(errors.payment || errors.address || '');
    });

    this.events.on(AppEvent.AddressChanged, (event: { data: string }) => {
      this.orderProcessor.setAddress(event.data);
      const { isValid, errors } = this.orderProcessor.validatePaymentForm();
      this.orderPaymentView.setButtonState(isValid);
    });

    this.events.on(AppEvent.AddressUpdated, (event: { address: string; isValid: boolean; error: string }) => {
      const { isValid, errors } = this.orderProcessor.validatePaymentForm();
      this.orderPaymentView.setError(errors.payment || errors.address || '');
      this.orderPaymentView.setButtonState(isValid);
    });

    this.events.on(AppEvent.PaymentSubmitted, () => {
      if (this.orderProcessor.validatePaymentForm().isValid) {
        const content = this.orderContactsView.getContent();
        this.modal.setContent(content);
        this.currentModalContent = content;
        this.orderContactsView.setButtonState(false);
      }
    });

    this.events.on(AppEvent.EmailChanged, (event: { data: string }) => {
      this.orderProcessor.setEmail(event.data);
      const { isValid, errors } = this.orderProcessor.validateContactsForm();
      this.orderContactsView.setButtonState(isValid);
    });

    this.events.on(AppEvent.PhoneChanged, (event: { data: string }) => {
      this.orderProcessor.setPhone(event.data);
      const { isValid, errors } = this.orderProcessor.validateContactsForm();
      this.orderContactsView.setButtonState(isValid);
    });

    this.events.on(AppEvent.EmailUpdated, (event: { email: string; isValid: boolean; error: string }) => {
      const { isValid, errors } = this.orderProcessor.validateContactsForm();
      this.orderContactsView.setError(errors.email || errors.phone || '');
      this.orderContactsView.setButtonState(isValid);
    });

    this.events.on(AppEvent.PhoneUpdated, (event: { phone: string; isValid: boolean; error: string }) => {
      const { isValid, errors } = this.orderProcessor.validateContactsForm();
      this.orderContactsView.setError(errors.email || errors.phone || '');
      this.orderContactsView.setButtonState(isValid);
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
            const content = this.orderSuccessView.getContent();
            this.modal.setContent(content);
            this.currentModalContent = content;
            this.orderSuccessView.render(response);
            this.events.emit(AppEvent.OrderCreated, response);
            console.log(order);
          })
          .catch((error) => {
            this.events.emit(AppEvent.ErrorOccurred, {
              message: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
          });
      }
    });

    this.events.on(AppEvent.OrderCreated, (order: IOrderResponse) => {
      const content = this.orderSuccessView.getContent();
      this.modal.setContent(content);
      this.currentModalContent = content;
      this.orderSuccessView.render(order);
    });

    this.events.on(AppEvent.ModalClose, () => {
      this.modal.close();
    });
  }

  private addToBasket(product: IProduct): void {
    this.basket.addItem(product);
  }

  private removeFromBasket(productId: string): void {
    this.basket.removeItem(productId);
  }

  private updateBasketUI(items: IProduct[]): void {
    this.basketView.updateCounter(items.length);
    this.basketView.updateTotalPrice(this.basket.getTotalPrice());
    this.basketView.setOrderButtonDisabled(this.basket.getTotalPrice() === 0);
    const updatedItems = items.map((item, index) => {
      const basketItemView = new BasketItemView(item, index + 1, (productId) => {
        this.events.emit(AppEvent.ProductRemoved, { productId });
      });
      return basketItemView.element;
    });
    this.basketView.setItems(updatedItems);
  }
}

// Инициализация
const api = new Api('https://larek-api.nomoreparties.co/api/weblarek');
const events = new EventEmitter();
const catalog = new Catalog(events);
const basket = new Basket(events);
const orderProcessor = new OrderProcessor(events);
const presenter = new Presenter(catalog, basket, orderProcessor, events, api);  