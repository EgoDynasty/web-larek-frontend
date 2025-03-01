export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
  index?: number;
}

export interface IProductListResponse {
  total: number;
  items: IProduct[];
}

export interface IOrder {
  payment: 'online' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface IOrderResponse {
  id: string;
  total: number;
}

export interface IErrorResponse {
  error: string;
}

export interface IModalCloseEvent {
  type: AppEvent.ModalClose;
}

// Типы для API-клиента
export interface IApiClient {
  getProducts(): Promise<IProductListResponse>;
  getProductById(id: string): Promise<IProduct>;
  createOrder(order: IOrder): Promise<IOrderResponse>;
}

// Типы для событий
export enum AppEvent {
  ProductListLoaded = 'product_list_loaded',
  ProductLoaded = 'product_loaded',
  OrderCreated = 'order_created',
  ErrorOccurred = 'error_occurred',
  BasketUpdated = 'basket_updated',
  OrderStatusChanged = 'order_status_changed',
  ProductAdded = 'product_added',
  ProductRemoved = 'product_removed',
  ProductUpdated = 'product_updated',
  ProductSelected = 'product_selected',
  ProductDetailsOpened = 'product-details-opened',
  BasketOpened = 'basket-opened',
  OrderStarted = 'order-started',
  PaymentSelected = 'payment-selected',
  AddressChanged = 'address-changed',
  AddressUpdated = 'address-updated',
  EmailChanged = 'email-changed',
  EmailUpdated = 'email-updated',
  PhoneChanged = 'phone-changed',
  PhoneUpdated = 'phone-updated',
  PaymentSubmitted = 'payment-submitted',
  ContactsSubmitted = 'contacts-submitted',
  ModalClose = 'modal-close',
}

// Интерфейсы для событий
export interface IProductListEvent {
  type: AppEvent.ProductListLoaded;
  data: IProductListResponse;
}

export interface IProductEvent {
  type: AppEvent.ProductLoaded;
  data: IProduct;
}

export interface IOrderEvent {
  type: AppEvent.OrderCreated;
  data: IOrderResponse;
}

export interface IErrorEvent {
  type: AppEvent.ErrorOccurred;
  error: string;
}

export interface IBasketUpdatedEvent {
  type: AppEvent.BasketUpdated;
  data: IProduct[];
}

export interface IOrderStatusChangedEvent {
  type: AppEvent.OrderStatusChanged;
  data: { orderId: string; status: string };
}

export interface IProductAddedEvent {
  type: AppEvent.ProductAdded;
  data: IProduct;
}

export interface IProductRemovedEvent {
  type: AppEvent.ProductRemoved;
  data: { productId: string };
}

export interface IProductUpdatedEvent {
  type: AppEvent.ProductUpdated;
  data: IProduct;
}

export interface IProductSelectedEvent {
  type: AppEvent.ProductSelected;
  data: IProduct;
}

export interface IProductDetailsOpenedEvent {
  type: AppEvent.ProductDetailsOpened;
  data: IProduct;
}

export interface IPaymentSelectedEvent {
  type: AppEvent.PaymentSelected;
  data: string;
}

export interface IAddressChangedEvent {
  type: AppEvent.AddressChanged;
  data: string;
}

export interface IAddressUpdatedEvent {
  type: AppEvent.AddressUpdated;
  data: { address: string; isValid: boolean; error: string };
}

export interface IEmailChangedEvent {
  type: AppEvent.EmailChanged;
  data: string;
}

export interface IEmailUpdatedEvent {
  type: AppEvent.EmailUpdated;
  data: { email: string; isValid: boolean; error: string };
}

export interface IPhoneChangedEvent {
  type: AppEvent.PhoneChanged;
  data: string;
}

export interface IPhoneUpdatedEvent {
  type: AppEvent.PhoneUpdated;
  data: { phone: string; isValid: boolean; error: string };
}

export interface IPaymentSubmittedEvent {
  type: AppEvent.PaymentSubmitted;
}

export interface IContactsSubmittedEvent {
  type: AppEvent.ContactsSubmitted;
}

export type AppEvents =
  | IProductListEvent
  | IProductEvent
  | IOrderEvent
  | IErrorEvent
  | IBasketUpdatedEvent
  | IOrderStatusChangedEvent
  | IProductAddedEvent
  | IProductRemovedEvent
  | IProductUpdatedEvent
  | IProductSelectedEvent
  | IProductDetailsOpenedEvent
  | IPaymentSelectedEvent
  | IAddressChangedEvent
  | IAddressUpdatedEvent
  | IEmailChangedEvent
  | IEmailUpdatedEvent
  | IPhoneChangedEvent
  | IPhoneUpdatedEvent
  | IPaymentSubmittedEvent
  | IContactsSubmittedEvent
  | IModalCloseEvent

// Типы для моделей данных
export interface IProductModel {
  products: IProduct[];
  getProducts(): Promise<void>;
  getProductById(id: string): IProduct | undefined;
}

export interface IOrderModel {
  order: IOrder | null;
  createOrder(order: IOrder): Promise<void>;
}

// Типы для отображений
export interface IProductView {
  renderProductDetails(product: IProduct): void;
}

export interface IOrderView {
  renderOrderSuccess(order: IOrderResponse): void;
  renderOrderError(error: string): void;
}

// Типы для базовых классов
export interface IEventEmitter {
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  emit(event: string, ...args: any[]): void;
}

export interface IController {
  handleEvent(event: AppEvents): void;
}

// Интерфейсы для View
export interface IBasketView {
  setItems(items: HTMLElement[]): void;
  updateCounter(count: number): void;
  updateTotalPrice(totalPrice: number): void;
  calculateTotalPrice(items: IProduct[]): number;
  getContent(): HTMLElement;
}

export interface ICatalogView {
  renderProducts(products: IProduct[]): void;
}

export interface IProductDetailsView extends IProductView {
  getContent(): HTMLElement;
}

export interface IOrderSuccessView {
  render(order: IOrderResponse): void;
  getContent(): HTMLElement;
}

export interface IOrderPaymentView {
  setError(error: string): void;
  setButtonState(isEnabled: boolean): void;
  getContent(): HTMLElement;
}

export interface IOrderContactsView {
  setError(error: string): void;
  setButtonState(isEnabled: boolean): void;
  getContent(): HTMLElement;
}

export interface IModal {
  open(): void;
  close(): void;
  setContent(content: HTMLElement): void;
  getModalElement(): HTMLElement;
}