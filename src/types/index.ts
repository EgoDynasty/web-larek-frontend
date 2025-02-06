// Базовые типы данных
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
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
  ProductUpdated = 'product_updated',
}

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
  data: { orderId: string, status: string };
}

export interface IProductAddedEvent {
  type: AppEvent.ProductAdded;
  data: IProduct;
}

export interface IProductUpdatedEvent {
  type: AppEvent.ProductUpdated;
  data: IProduct;
}

export type AppEvents =
  | IProductListEvent
  | IProductEvent
  | IOrderEvent
  | IErrorEvent
  | IBasketUpdatedEvent
  | IOrderStatusChangedEvent
  | IProductAddedEvent
  | IProductUpdatedEvent;

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
  renderProducts(products: IProduct[]): void;
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