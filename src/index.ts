import './scss/styles.scss';
import { IProduct, IOrder, IOrderView, IOrderResponse, IProductView ,AppEvent } from './types/index';

// EventEmitter для управления событиями
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(data));
    }
  }
}

// Класс для работы с каталогом товаров (Model)
class Catalog {
  private products: IProduct[];
  private events: EventEmitter;

  constructor(products: IProduct[]) {
    this.products = products;
  }

  getAllProducts(): IProduct[] {
    return this.products;
  }

  setProducts(products: IProduct[]): void {
    this.products = products;
    this.events.emit(AppEvent.BasketUpdated, this.products  );
  }
  

  updateProduct(productId: string, updatedProduct: IProduct): void {
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      this.products[productIndex] = updatedProduct;
      this.events.emit(AppEvent.ProductUpdated, updatedProduct);
    }
  }
}

// Класс корзины (Model)
class Basket {
  private items: IProduct[] = [];
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
  }

  addItem(product: IProduct): void {
    this.items.push(product);
    this.events.emit(AppEvent.BasketUpdated, this.items);
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.events.emit(AppEvent.BasketUpdated, this.items);
  }

  getItems(): IProduct[] {
    return this.items;
  }

  clear(): void {
    this.items = [];
    this.events.emit(AppEvent.BasketUpdated, this.items);
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price || 0), 0);
  }
}

// Класс заказа (Model)
class OrderProcessor {
  private events: EventEmitter;
  private order: IOrder | null = null;  

  constructor(events: EventEmitter) {
    this.events = events;
  }

  validateOrder(order: IOrder): boolean {
    if (!order.email.includes("@")) {
      events.emit("OrderValidationError", "Некорректный email");
      return false;
    }
    if (!order.phone.match(/^\d{10,15}$/)) {
      events.emit("OrderValidationError", "Некорректн ый номер телефона");
      return false;
    }
    return true;
  }

  createOrder(order: IOrder): void {
    if (!order.email || !order.phone || !order.address) {
      throw new Error('Все поля должны быть заполнены');
    }
    this.order = order;
    this.events.emit(AppEvent.OrderStatusChanged, { orderId: order.items, status: 'created' });
  }

  getOrder(): IOrder | null {
    return this.order;
  }
}

// Класс для отображения корзины (view)
class BasketView {
  private basketElement: HTMLElement;
  private counterElement: HTMLElement;

  constructor() {
    this.basketElement = document.getElementById('basket')!;
    this.counterElement = document.getElementById('basket-counter')!;
  }

  render(items: IProduct[]): void {
    this.basketElement.innerHTML = items.map(item => `<div>${item.title}</div>`).join('');
  }

  updateCounter(count: number): void {
    this.counterElement.textContent = count.toString();
  }

  show(): void {
    this.basketElement.style.display = 'block';
  }

  hide(): void {
    this.basketElement.style.display = 'none';
  }
}

// Класс для отображения деталей товара (view)
class ProductDetailsView implements IProductView {
  private modalElement: HTMLElement;
  private addToCartButton: HTMLElement;

  constructor() {
    this.modalElement = document.getElementById('product-modal')!;
    this.addToCartButton = document.getElementById('add-to-cart-button')!;
  }

  renderProductDetails(product: IProduct): void {
    this.modalElement.innerHTML = `
      <h2>${product.title}</h2>
      <p>${product.description}</p>
      <p>Цена: ${product.price} руб.</p>
    `;
    this.modalElement.style.display = 'block';
  }

  updateAddToCartButton(isInCart: boolean): void {
    this.addToCartButton.textContent = isInCart ? 'Убрать из корзины' : 'Добавить в корзину';
  }

  closeModal(): void {
    this.modalElement.style.display = 'none';
  }

  renderProducts(products: IProduct[]): void {
    console.log("Список товаров:", products);
  }
}

// Класс для отображения формы заказа (view)
class OrderFormView implements IOrderView {
  private formElement: HTMLElement;
  private errorElement: HTMLElement;

  constructor() {
    this.formElement = document.getElementById('order-form')!;
    this.errorElement = document.getElementById('order-error')!;
  }

  render(): void {
    this.formElement.style.display = 'block';
  }

  showError(message: string): void {
    this.errorElement.textContent = message;
  }

  clearForm(): void {
    this.formElement.style.display = 'none';
    this.errorElement.textContent = '';
  }

  renderOrderSuccess(order: IOrderResponse): void {
    alert(`Заказ успешно оформлен! ID заказа: ${order.id}, Сумма: ${order.total} руб.`);
    this.clearForm();
  }

  renderOrderError(error: string): void {
    this.showError(`Ошибка при оформлении заказа: ${error}`);
  }
}

// Класс для отображения успешного заказа (view)
class OrderSuccessView {
  private successElement: HTMLElement;

  constructor() {
    this.successElement = document.getElementById('order-success')!;
  }

  render(order: IOrderResponse): void {
    this.successElement.innerHTML = `
      <h2>Заказ успешно оформлен!</h2>
      <p>Номер заказа: ${order.id}</p>
      <p>Итоговая сумма: ${order.total} руб.</p>
    `;
    this.successElement.style.display = 'block';
  }
}


// Presenter
class Presenter {
  private catalog: Catalog;
  private basket: Basket;
  private orderProcessor: OrderProcessor;
  private events: EventEmitter;

  constructor(catalog: Catalog, basket: Basket, orderProcessor: OrderProcessor, events: EventEmitter) {
    this.catalog = catalog;
    this.basket = basket;
    this.orderProcessor = orderProcessor;
    this.events = events;
    this.init();
  }

  private init(): void {
    this.events.on(AppEvent.ProductListLoaded, (products: IProduct[]) => console.log('Обновлен список товаров', products));
    this.events.on(AppEvent.OrderCreated, (order: IOrder) => console.log('Заказ создан', order));
    this.events.on(AppEvent.BasketUpdated, (items: IProduct[]) => {
      console.log('Корзина обновлена', items);
    });
  }
}

// Инициализация
const events = new EventEmitter();
const sampleProducts: IProduct[] = [
  { id: '1', title: 'Фреймворк куки судьбы', price: 2500, category: 'софт-скил', description: 'Описание товара', image: 'image1.png' },
  { id: '2', title: '+1 час в сутках', price: 750, category: 'другое', description: 'Описание товара', image: 'image2.png' }
];

const catalog = new Catalog(sampleProducts);
const basket = new Basket(events);
const orderProcessor = new OrderProcessor(events);
const presenter = new Presenter(catalog, basket, orderProcessor, events);

console.log('Каталог товаров:', catalog.getAllProducts());